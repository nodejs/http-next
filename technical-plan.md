# Technical Plan

Status: Draft

This is a living doc attempting to reflect our current technical plan for this repository. We are pulling together work from
a few sources and plan to bias toward action on merging things as the change. Do not take anything here yet as a final proposal
or committed direction. When that changes we will change the status message here.

---

## Notes from @jasnell in https://github.com/nodejs/web-server-frameworks/issues/55

I'll be working up a detailed description over the next few days but the short version of the proposal is this:

Due to the organic and incremental way in which HTTP/1.1 and HTTPS support evolved in core, the fundamental differences introduced in HTTP/2, and the desire for us not to break any existing userland code, HTTP/1.1 and HTTP/2 support in core has become less than ideal.

There are currently four distinct HTTP server API implementations:

1. HTTP/1.1 (`require('http')`)
2. HTTP/1.1 over TLS (`require('https')`) 
3. HTTP/2 Core
4. HTTP/2 Compat

And three distinct client API implementations:

1. HTTP/1.1
2. HTTP/1.1 over TLS
3. HTTP/2

Add to this the fact that the TCP and UDP implementations each have very different implementations, the TCP/TLS implementation has become extremely complicated and difficult to maintain, and the differences between the APIs have been the source of many bugs going back many years.

The introduction of QUIC and HTTP/3 yields the prospect of making this problem even more acute.

The current model is unsustainable both for core and userland, and makes it difficult to make further progress.

The somewhat radical proposal is to completely reimplement the TCP/UDP/HTTP stack from the ground up in Node.js, with the eventual target of replacing the existing http, https, http/2 stacks (as well as the tcp and dgram stacks but that is secondary to this discussion here) with a more architecturally consistent foundation.

All of the details of this reimplementation need to be worked out, including determining how much of the existing code can be reused or repurposed. But, the highlevel idea would be to take the lessons learned from implementing both the HTTP/2 and QUIC internals to implement a new common subsystem for all HTTP versions, with a *single* core JavaScript API upon which a higher level JavaScript API framework can be based.

That higher level framework would be implemented as a layer on top, but external to node.js core, potentially vendored in as a dependency but not necessarily so...

```
             Node.js Core Jurisdiction                    This WG Jurisdiction
/-------------------------------------------------\  /------------------------------\
+---------------------+  |  +---------------------+ | +-----------------------------+
|  Node.js Internals  |  |  |  Node.js Core Lib   | | |  Node.js stdlib / Userland  |
|                     |  |  |                     | | |                             |
| +-----------------+ |  |  | +-----------------+ | | | +-------------------------+ |
| |     New Net     | |  |  | |     Net Core    | | | | | High-level / User APIs  | |
| |    Subsystem    |<----->| |     Net API     | |<--->|                         | |
| +-----------------+ |  |  | +-----------------+ | | | +-------------------------+ |
+---------------------+  |  +---------------------+ | +-----------------------------+
```

Under this plan, the existing `require('http')`, `require('https')`, and `require('http2')` modules would be expected to radically evolve or potentially be deprecated, and replaced with a new high-level user API developed by this working group. All of the internals of the HTTP/1 and HTTP/2 implementations would be evolved to sync with the QUIC and HTTP/3 implementations so that there is a single API model moving forward.

This would be a *massive* effort that would be expected to take quite a long time to complete and there are a ton of details to work through. A key goal on the Node.js core side will be to actually decrease the complexity and obscurity of the existing separate code paths and yield a more maintainable architecture top to bottom.

That's the short summary, will work on expanding detail over the next week. 


In the webserver frameworks team call today we discussed distinct work threads on this that can proceed in parallel:

There's the ongoing work on the QUIC/H3 implementation that I've been pushing forward. The revamped core model will be an abstraction of the Socket/Session/Stream model used here.

There's updating HTTP/2, where necessary to bring it up to speed with the revamped QUIC model. Fortunately, HTTP/2 core already implements a similar Session/Stream model (the QUIC approach was based originally off this) so this will be more of an exercise in updating and aligning what's currently there.

There's the revamped HTTP/1 implementation. This will be a completely new parallel implementation that does not touch the existing http1 stack in core. It will reimplement HTTP1 support around the Socket/Session/Stream model.

Once we have H1, H2, and H3 all built around the same Socket/Session/Stream abstraction, we will ensure that they share a common base code as much as possible to help simplify maintenance moving forward.

The final work stream is design and implementation of the higher-level HTTP specific JavaScript API on top. The goal would be a HTTP version agnostic API layer that works consistently regardless of version being used. It is this API that framework implementations would adapt to. This API layer would be implemented as a separate project vendored-in as a dependency in core.

These can largely progress in parallel with each other, we just need owners for each part to help move it forward.
