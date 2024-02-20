#include <napi.h>
#include "socket.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports)
{
    return Socket::Init(env, exports);
}

NODE_API_MODULE(addon, InitAll)
