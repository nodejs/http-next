import { InboundTCPSocket } from "../lib/socket.js";
import { test } from "node:test";
import assert from "node:assert";

test("InboundTCPSocket", async () => {
	const body = "Hello, World!\r\n";
	const socket = new InboundTCPSocket({ hostname: "0.0.0.0", port: 8000 });
	socket.listen((req, res, err) => {
		assert.ok(req.data.includes(body));
		const http_response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 15\r\n\r\n${body}`;
		res.write(http_response);
	});

	const res = await fetch("http://localhost:8000", { method: "POST", body });
	const text = await res.text();
	assert.deepStrictEqual(text, body);
	socket.close();
});
