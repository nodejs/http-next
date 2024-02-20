import { InboundSocket } from '../lib/socket.js';
import { test } from 'node:test';
import assert from 'node:assert';

test('InboundSocket', async () => {
    const body = "Hello, World!\r\n";
    const socket = new InboundSocket({ hostname: "0.0.0.0", port: 8000 }).listen();
    socket.emitter.on("data", (req) => {
        assert.ok(req.data.includes(body));
        const http_response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 15\r\n\r\n${body}`;
        req.write(http_response);
        socket.close();
    });

    const res = await fetch("http://localhost:8000", { method: 'POST', body });
    const text = await res.text();
    assert.deepStrictEqual(text, body);
});
