import { InboundSocket } from "./socket.js";
import { load } from "./milo.js";
import { Request } from "./request.js";

export class HttpServer {
	httpVersion;
	#socket;
	constructor(options) {
		this.httpVersion = options.httpVersion || "1.1";
		switch (this.httpVersion) {
			case "1":
			case "1.1":
				this.#socket = new InboundSocket(options);
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
		const parsing = (req, res, err) => {
			const parser = load();
			const data = Buffer.from(req.data);
			parser.parse(data, data.length);
			const request = new Request(parser.context.parsed);
			const response = cb(request, err);
			res.write(response.parse(this.httpVersion));
		};
		this.#socket.listen(parsing);
		return this;
	}

	close() {
		this.#socket.close();
		return this;
	}
}
