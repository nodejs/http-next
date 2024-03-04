export class Request {
	constructor(options) {
		this.url = options.url;
		this.method = options.method;
		this.protocol = "HTTP";
		this.version = options.version;
		this.headers = options.headers;
		this.body = options.data;
	}
}
