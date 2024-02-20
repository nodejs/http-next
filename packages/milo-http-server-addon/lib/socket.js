import bindings from "bindings";
import { EventEmitter } from "events";
const { Socket } = bindings("inbound-socket");

export class InboundSocket {
	#socket;
	emitter;
	open = false;

	constructor(options) {
		if (!options) {
			throw new Error("Address is required");
		}

		if (!options.port || typeof options.port !== "number" || options.port < 0) {
			throw new Error("Port is required");
		}

		if (!options.hostname || typeof options.hostname !== "string") {
			throw new Error("Hostname is required");
		}

		this.#socket = new Socket(options);
		this.emitter = new EventEmitter();
	}

	close() {
		this.open = false;
		this.#socket.close();
		return this;
	}

	listen() {
		const read = this.emitter.emit.bind(this.emitter);
		this.#socket.listen(read);
		this.open = true;
		return this;
	}
}
