#include <napi.h>
#include "inbound_tcp_socket.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
    return InboundTCPSocket::Init(env, exports);
}

NODE_API_MODULE(addon, InitAll)