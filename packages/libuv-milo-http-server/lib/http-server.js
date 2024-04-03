import { milo } from "@perseveranza-pets/milo";
import { createParser } from "./parsing.js";
import { InboundTCPSocket } from "./socket.js";

export class HttpServer {
	httpVersion;
	hostname;
	port;
	#socket;
	constructor(options) {
		this.httpVersion = options.httpVersion || "1.1";
		this.hostname = options.hostname;
		this.port = options.port;
		switch (this.httpVersion) {
			case "1":
			case "1.1":
				this.#socket = new InboundTCPSocket(options);
				break;
			case "2":
				throw new Error("HTTP/2 is not supported yet");
			case "3":
				throw new Error("HTTP/3 is not supported yet");
			default:
				throw new Error("Invalid HTTP version");
		}
	}

	listen(cb) {
		this.#socket.listen(async (req, res, err) => {
			try {
				// Create the parser
				const { context, parser } = createParser();

				// Allocate a memory in the WebAssembly space. This speeds up data copying to the WebAssembly layer.
				const ptr = milo.alloc(req.data.length);

				// Create a buffer we can use normally.
				const buffer = Buffer.from(milo.memory.buffer, ptr, req.data.length);
				buffer.set(req.data, 0);
				context.input = buffer;

				// Perform the parsing
				const consumed = milo.parse(parser, ptr, req.data.length);

				// Clean up
				milo.dealloc(ptr, req.data.length);
				milo.destroy(parser);

				// Build the request URL
				const { hostname, port } = this;
				const { protocol, path } = context.parsed;
				const url = `${normalizeProtocol(protocol)}${hostname}:${port}${path}`;

				// Create the request object
				const request = new Request(url, context.parsed);

				// Execute user callback
				const response = await cb(request, err);
				const responseStringified = await parseResponse(
					response,
					this.httpVersion,
				);

				// Send the response back
				res.write(responseStringified);
			} catch (e) {
				// TODO: Improve error reporting
				console.error(e);
			}
		});
		return this;
	}

	close() {
		this.#socket.close();
		return this;
	}
}

function normalizeProtocol(protocol) {
	switch (protocol) {
		case "HTTP":
			return "http://";
		case "HTTPS":
			return "https://";
		default:
			break;
	}
}

export async function parseResponse(response, httpVersion) {
	let headers = "";
	for (const [key, value] of response.headers.entries()) {
		headers += `${key}: ${value}\r\n`;
	}
	const body = await response.text();
	return `HTTP/${httpVersion} ${response.status} ${response.statusText}\r\n${headers}\r\n${body}`;
}
