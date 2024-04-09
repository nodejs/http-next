import { milo } from "@perseveranza-pets/milo";

const lastHeaderName = Symbol("lastHeaderName");

function extractPayload(context, from, size) {
	return context.input.subarray(from, from + size);
}

function getValue(context, name, from, size) {
	context.parsed[name] = extractPayload(context, from, size).toString("utf-8");
}

function onReason(_, from, size) {
	getValue(this, "reason", from, size);
}

function onMethod(_, from, size) {
	getValue(this, "method", from, size);
}

function onUrl(_, from, size) {
	getValue(this, "path", from, size);
}

function onProtocol(_, from, size) {
	getValue(this, "protocol", from, size);
}

function onVersion(_, from, size) {
	getValue(this, "version", from, size);
}

function onStatus(_, from, size) {
	getValue(this, "status", from, size);
}

function onHeaderName(_, from, size) {
	this.parsed[lastHeaderName] = extractPayload(this, from, size).toString(
		"utf-8",
	);
}

function onHeaderValue(_, from, size) {
	this.parsed.headers[this.parsed[lastHeaderName]] = extractPayload(
		this,
		from,
		size,
	).toString("utf-8");
}

function onData(_, from, size) {
	return getValue(this, "body", from, size);
}

export function createParser() {
	const parser = milo.create();
	const context = { parsed: { headers: {} } };

	milo.setOnMethod(parser, onMethod.bind(context));
	milo.setOnUrl(parser, onUrl.bind(context));
	milo.setOnProtocol(parser, onProtocol.bind(context));
	milo.setOnVersion(parser, onVersion.bind(context));
	milo.setOnReason(parser, onReason.bind(context));
	milo.setOnStatus(parser, onStatus.bind(context));
	milo.setOnHeaderName(parser, onHeaderName.bind(context));
	milo.setOnHeaderValue(parser, onHeaderValue.bind(context));
	milo.setOnData(parser, onData.bind(context));

	return { context, parser };
}
