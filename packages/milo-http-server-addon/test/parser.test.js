import { load } from '../lib/milo.js';
import { test } from 'node:test';
import assert from 'node:assert';


test('Milo parsing http response', () => {
    const protocol = "HTTP";
    const version = "1.1";
    const status = "200";
    const contentType = "text/plain";
    const contentLength = "15";
    const body = "Hello, World!\r\n";
    const request = Buffer.from(`${protocol}/${version} ${status} OK\r\nContent-Type: ${contentType}\r\nContent-Length: ${contentLength}\r\n\r\n${body}`)

    const parser = load();
    parser.parse(request, request.length);
    assert.strictEqual(parser.context.parsed.protocol, protocol);
    assert.strictEqual(parser.context.parsed.version, version);
    assert.strictEqual(parser.context.parsed.status, status);
    assert.strictEqual(parser.context.parsed.headers["Content-Type"], contentType);
    assert.strictEqual(parser.context.parsed.headers["Content-Length"], contentLength);
    assert.strictEqual(parser.context.parsed.data, body);
});

test('Milo parsing http request', () => {
    const method = "GET";
    const url = "/";
    const protocol = "HTTP";
    const version = "1.1";
    const request = Buffer.from(`${method} ${url} ${protocol}/${version}\r\n\r\n`)

    const parser = load();
    parser.parse(request, request.length);
    assert.strictEqual(parser.context.parsed.method, method);
    assert.strictEqual(parser.context.parsed.url, url);
    assert.strictEqual(parser.context.parsed.protocol, protocol);
    assert.strictEqual(parser.context.parsed.version, version);
});
