#include <napi.h>
#include <uv.h>
#include "inbound_tcp_socket.h"

#define BACKLOG 511

Napi::Object InboundTCPSocket::Init(Napi::Env env, Napi::Object exports)
{
    Napi::Function func =
        DefineClass(env,
                    "InboundTCPSocket",
                    {InboundTCPSocket::InstanceMethod("listen", &InboundTCPSocket::Listen),
                     InboundTCPSocket::InstanceMethod("close", &InboundTCPSocket::Close),
                     InboundTCPSocket::InstanceAccessor("port", &InboundTCPSocket::GetPort, nullptr),
                     InboundTCPSocket::InstanceAccessor("hostname", &InboundTCPSocket::GetHostname, nullptr)});

    Napi::FunctionReference *constructor = new Napi::FunctionReference();
    *constructor = Napi::Persistent(func);
    env.SetInstanceData(constructor);

    Napi::String name = Napi::String::New(env, "InboundTCPSocket");
    exports.Set(name, func);
    return exports;
}

Napi::Value InboundTCPSocket::GetPort(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::Number::New(env, (double)(this->_port));
}

Napi::Value InboundTCPSocket::GetHostname(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    return Napi::String::New(env, this->_hostname);
}

InboundTCPSocket::InboundTCPSocket(const Napi::CallbackInfo &info)
    : Napi::ObjectWrap<InboundTCPSocket>(info)
{
    Napi::Object options = info[0].As<Napi::Object>();
    this->_port = options.Get("port").As<Napi::Number>().Uint32Value();
    this->_hostname = options.Get("hostname").As<Napi::String>().Utf8Value();
}

void on_close(uv_handle_t *handle)
{
    free(handle);
}

void InboundTCPSocket::Close(const Napi::CallbackInfo &info)
{
    uv_close((uv_handle_t *)&this->tcpServer, NULL);
}

static void allocator(uv_handle_t *handle,
                      size_t suggested_size,
                      uv_buf_t *buf)
{
    buf->base = (char *)malloc(suggested_size);
    buf->len = suggested_size;
}

inline void emit_uv_error(Napi::Function callback, int result)
{
    Napi::Env env = callback.Env();
    Napi::Object err = Napi::Object::New(env);
    err.Set("code", Napi::String::New(env, uv_err_name(result)));
    callback.MakeCallback(env.Global(), {env.Undefined(), env.Undefined(), err});
}

void after_write(uv_write_t *req, int status)
{
    free(req);
}

static Napi::Value write(const Napi::CallbackInfo &info)
{
    uv_stream_t *client = (uv_stream_t *)info.Data();
    std::string data = info[0].As<Napi::String>().Utf8Value();
    uv_write_t *req = (uv_write_t *)malloc(sizeof(uv_write_t));
    uv_buf_t wrbuf = uv_buf_init((char *)data.c_str(), data.length());
    uv_write(req, client, &wrbuf, 1, after_write);
    uv_close((uv_handle_t *)client, on_close);
    return info.This();
}

static void after_read(uv_stream_t *client,
                       ssize_t nread,
                       const uv_buf_t *buf)
{
    if (nread <= 0)
    {
        free(buf->base);
        return;
    }
    server_data *client_data = (server_data *)(client->data);
    Napi::Env env = client_data->callback.Env();
    Napi::HandleScope scope(env);
    Napi::Object request = Napi::Object::New(env);
    request.Set("data", Napi::Buffer<char>::NewOrCopy(env, buf->base, nread));
    Napi::Object response = Napi::Object::New(env);
    response.Set("write", Napi::Function::New(env, write, "write", client));

    client_data->callback.MakeCallback(env.Global(), {request, response, env.Undefined()});
    free(buf->base);
}

static void on_connection(uv_stream_t *tcpServer, int status)
{
    const server_data *serverData = (server_data *)tcpServer->data;
    uv_loop_t *eventLoop = serverData->eventLoop;
    uv_tcp_t *client = (uv_tcp_t *)malloc(sizeof(uv_tcp_t));
    client->data = tcpServer->data;
    int result = 0;
    result = uv_tcp_init(eventLoop, client);
    if (result != 0)
    {
        Napi::HandleScope scope(serverData->callback.Env());
        emit_uv_error(serverData->callback.Value(), result);
        uv_close((uv_handle_t *)client, on_close);
    }

    result = uv_accept(tcpServer, (uv_stream_t *)client);
    if (result != 0)
    {
        Napi::HandleScope scope(serverData->callback.Env());
        emit_uv_error(serverData->callback.Value(), result);
        uv_close((uv_handle_t *)client, on_close);
    }

    result = uv_read_start((uv_stream_t *)client, allocator, after_read);
    if (result != 0)
    {
        Napi::HandleScope scope(serverData->callback.Env());
        emit_uv_error(serverData->callback.Value(), result);
        uv_close((uv_handle_t *)client, on_close);
    }
}

void InboundTCPSocket::Listen(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    uv_loop_t *eventLoop;
    napi_status status = napi_get_uv_event_loop(env, &eventLoop);
    NAPI_THROW_IF_FAILED(env, status);
    Napi::Function callback = info[0].As<Napi::Function>();

    int result = 0;
    result = uv_tcp_init(eventLoop, &this->tcpServer);
    if (result != 0)
    {
        emit_uv_error(callback, result);
        return;
    }

    struct sockaddr_in address;
    result = uv_ip4_addr(this->_hostname.c_str(), (int)(this->_port), &address);
    if (result != 0)
    {
        emit_uv_error(callback, result);
        return;
    }

    result = uv_tcp_bind(&this->tcpServer, (const struct sockaddr *)&address, 0);
    if (result != 0)
    {
        emit_uv_error(callback, result);
        return;
    }

    server_data *serverData = (server_data *)malloc(sizeof(server_data));
    serverData->callback = Napi::Persistent(info[0].As<Napi::Function>());
    serverData->eventLoop = eventLoop;
    this->tcpServer.data = serverData;

    result = uv_listen((uv_stream_t *)&this->tcpServer, BACKLOG, on_connection);
    if (result != 0)
    {
        emit_uv_error(callback, result);
        free(tcpServer.data);
        free(serverData);
        return;
    }
}
