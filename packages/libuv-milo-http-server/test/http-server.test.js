import { HttpServer } from "../lib/http-server.js";
import { test } from "node:test";
import assert from "node:assert";

test("HttpServer", async () => {
	const body = "Hello, World!\r\n";
	const server = new HttpServer({ hostname: "0.0.0.0", port: 8001 });
	server.listen(async (req, err) => {
		assert.deepStrictEqual(req.method, "POST");
		assert.deepStrictEqual(req.url, "http://0.0.0.0:8001/");
		assert.deepStrictEqual(req.headers.get("content-length"), "15");
		assert.deepStrictEqual(await req.text(), body);
		return new Response(body, {
			status: 200,
			reason: "OK",
			headers: { "Content-Type": "text/plain", "Content-Length": "15" },
		});
	});

	const res = await fetch("http://localhost:8001", { method: "POST", body });
	const text = await res.text();
	assert.deepStrictEqual(text, body);
	server.close();
});
