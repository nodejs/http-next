import { milo } from "@perseveranza-pets/milo";
import assert from "node:assert";
import { test } from "node:test";
import { createParser } from "../lib/parsing.js";

test("Milo parsing HTTP response", () => {
	const protocol = "HTTP";
	const version = "1.1";
	const status = "200";
	const contentType = "text/plain";
	const contentLength = "15";
	const body = "Hello, World!\r\n";
	const request = Buffer.from(
		`${protocol}/${version} ${status} OK\r\nContent-Type: ${contentType}\r\nContent-Length: ${contentLength}\r\n\r\n${body}`,
	);

	const { context, parser } = createParser();
	const ptr = milo.alloc(request.length);
	const buffer = Buffer.from(milo.memory.buffer, ptr, request.length);
	context.input = buffer;
	buffer.set(request);

	const consumed = milo.parse(parser, ptr, buffer.length);

	assert.strictEqual(consumed, request.length);
	assert.strictEqual(milo.getState(parser), milo.STATE_START);
	assert.strictEqual(context.parsed.protocol, protocol);
	assert.strictEqual(context.parsed.version, version);
	assert.strictEqual(context.parsed.status, status);
	assert.strictEqual(context.parsed.headers["Content-Type"], contentType);
	assert.strictEqual(context.parsed.headers["Content-Length"], contentLength);
	assert.strictEqual(context.parsed.body, body);

	milo.dealloc(ptr, request.length);
	milo.destroy(parser);
});

test("Milo parsing HTTP request", () => {
	const method = "GET";
	const url = "/";
	const protocol = "HTTP";
	const version = "1.1";
	const request = Buffer.from(
		`${method} ${url} ${protocol}/${version}\r\n\r\n`,
	);

	const { context, parser } = createParser();
	const ptr = milo.alloc(request.length);
	const buffer = Buffer.from(milo.memory.buffer, ptr, request.length);
	context.input = buffer;
	buffer.set(request);

	const consumed = milo.parse(parser, ptr, buffer.length);

	assert.strictEqual(consumed, request.length);
	assert.strictEqual(milo.getState(parser), milo.STATE_START);
	assert.strictEqual(context.parsed.method, method);
	assert.strictEqual(context.parsed.path, url);
	assert.strictEqual(context.parsed.protocol, protocol);
	assert.strictEqual(context.parsed.version, version);

	milo.dealloc(ptr, request.length);
	milo.destroy(parser);
});
