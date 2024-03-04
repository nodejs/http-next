import { Parser } from "@shogunpanda/milo";

const lastHeaderName = Symbol("lastHeaderName");

function extractPayload(context, from, size) {
	return context.input.subarray(from, from + size);
}

function getValue(context, name, from, size) {
	context.parsed[name] = extractPayload(context, from, size).toString("utf-8");
	return 0;
}

function onReason(from, size) {
	return getValue(this.context, "reason", from, size);
}

function onMethod(from, size) {
	return getValue(this.context, "method", from, size);
}

function onUrl(from, size) {
	return getValue(this.context, "url", from, size);
}

function onProtocol(from, size) {
	return getValue(this.context, "protocol", from, size);
}

function onVersion(from, size) {
	return getValue(this.context, "version", from, size);
}

function onStatus(from, size) {
	const context = this.context;
	return getValue(context, "status", from, size);
}

function onHeaderName(from, size) {
	this.context.parsed.headers[lastHeaderName] = extractPayload(
		this.context,
		from,
		size,
	).toString("utf-8");
	return 0;
}

function onHeaderValue(from, size) {
	this.context.parsed.headers[this.context.parsed.headers[lastHeaderName]] =
		extractPayload(this.context, from, size).toString("utf-8");
	return 0;
}

function onData(from, size) {
	return getValue(this.context, "data", from, size);
}

function onHeaders() {
	delete this.context.parsed.headers[lastHeaderName];
	return 0;
}

export function load() {
	const parser = Parser.create();
	parser.context.parsed = { headers: {} };
	parser.setOnMethod(onMethod.bind(parser));
	parser.setOnUrl(onUrl.bind(parser));
	parser.setOnProtocol(onProtocol.bind(parser));
	parser.setOnVersion(onVersion.bind(parser));
	parser.setOnReason(onReason.bind(parser));
	parser.setOnStatus(onStatus.bind(parser));
	parser.setOnHeaderName(onHeaderName.bind(parser));
	parser.setOnHeaderValue(onHeaderValue.bind(parser));
	parser.setOnData(onData.bind(parser));
	parser.setOnHeaders(onHeaders.bind(parser));
	return parser;
}
