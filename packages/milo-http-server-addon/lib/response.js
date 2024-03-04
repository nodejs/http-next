export class Response {
	constructor(body, options) {
		this.body = body;
		this.protocol = "HTTP";
		this.headers = options.headers;
		this.reason = options.reason;
		this.status = options.status;
	}

	parse(httpVersion) {
		return `${this.protocol}/${httpVersion} ${this.status} ${
			this.reason
		}\r\n${Object.entries(this.headers)
			.map(([key, value]) => `${key}: ${value}`)
			.join("\r\n")}\r\n\r\n${this.body}`;
	}
}
