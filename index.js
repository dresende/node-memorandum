var traceback = require("traceback");
var moment    = require("moment-timezone");
var ansi      = require("ansi");
var path      = require("path");
var util      = require("util");
var tty       = require("tty");

module.exports = function (id) {
	return new Memorandum(id);
};

module.exports.settings = {
	timestamp : {
		timezone : null,
		format   : "YYYY-MM-DD HH:mm:ss.SSS",
		color    : "#444444"
	}
};

function Memorandum(id) {
	this.id   = id;
	this.last = null;
}

Memorandum.settings = {
	timestamp : {
		timezone : null,
		format   : "YYYY-MM-DD HH:mm:ss.SSS",
		color    : "#444444"
	}
};

Memorandum.prototype.settings = module.exports.settings;
Memorandum.prototype.info     = wrap_logging(process.stdout, " info", "", false, "#59a0ff");
Memorandum.prototype.warn     = wrap_logging(process.stdout, " warn", "", false, "#ffe441");
Memorandum.prototype.error    = wrap_logging(process.stderr, "error", "E", true, "#ff4c5f", "#c43b4a");
Memorandum.prototype.debug    = wrap_logging(process.stderr, "debug", "D", false, "#c44fda", "#5c5b5a");

function wrap_logging(stream, prefix, tag, show_trace, color, text_color) {
	var cursor = ansi(stream);

	return function () {
		var settings  = this.settings;
		var timestamp = build_timestamp(settings);
		var too_fast  = (Date.now() - this.last < 500 && [ "debug", "error" ].indexOf(prefix) == -1);

		this.last = Date.now();

		if (settings.coloring === false) {
			build_tag(cursor, tag, null);

			cursor.write((too_fast ? str_repeat(" ", timestamp.length) : timestamp) + " ");

			if (this.id) {
				cursor.write(" " + this.id + "  ");
			}

			cursor.write(prefix + ":");

			if (prefix == "debug" && typeof arguments[0] == "object" && arguments[0] && !util.isError(arguments[0])) {
				cursor.write(" " + (arguments[1] || "-- output --")).write("\n");

				JSON.stringify(arguments[0], null, "  ").split("\n").forEach(function (line) {
					build_tag(cursor, tag, null).write(line).write("\n");
				});
			} else {
				cursor.write(" " + util.format.apply(util, arguments)).write("\n");
			}

			if (show_trace) {
				var stack  = traceback();
				var indent = timestamp.length + (this.id ? this.id.length + 3 : 0) + prefix.length + 3;
				var cwd    = process.cwd() + path.sep;

				for (var i = 1; i < stack.length; i++) {
					if (stack[i].path.indexOf(path.sep) == -1) break;

					build_tag(cursor, tag, null)
						.write(str_repeat(" ", indent))
						.write(stack[i].path.indexOf(cwd) === 0 ? stack[i].path.substr(cwd.length) : stack[i].path)
						.write(" , line " + stack[i].line + " , col. " + stack[i].col)
						.write("\n");
				}
			}
		} else {
			build_tag(cursor, tag, text_color || color);

			if (settings.timestamp.color) {
				cursor.hex(settings.timestamp.color);
			}

			cursor.write((too_fast ? str_repeat(" ", timestamp.length) : timestamp) + " ");

			if (this.id) {
				cursor.bg.hex("#222222").fg.hex("#dddddd").write(" " + this.id + " ").bg.reset().write(" ");
			}

			cursor.hex(color).bold().write(prefix + ":");

			if (text_color) {
				cursor.hex(text_color);
			}

			if (prefix == "debug" && typeof arguments[0] == "object" && arguments[0] && !util.isError(arguments[0])) {
				cursor.write(" " + (arguments[1] || "-- output --")).reset().write("\n");

				JSON.stringify(arguments[0], null, "  ").split("\n").forEach(function (line) {
					build_tag(cursor, tag, text_color || color).write(line).write("\n");
				});
			} else {
				cursor.write(" " + util.format.apply(util, arguments)).reset().write("\n");
			}

			if (show_trace) {
				var stack  = traceback();
				var indent = timestamp.length + (this.id ? this.id.length + 3 : 0) + prefix.length + 3;
				var cwd    = process.cwd() + path.sep;

				for (var i = 1; i < stack.length; i++) {
					if (stack[i].path.indexOf(path.sep) == -1) break;

					build_tag(cursor, tag, text_color || color)
						.hex(text_color)
						.write(str_repeat(" ", indent))
						.write(stack[i].path.indexOf(cwd) === 0 ? stack[i].path.substr(cwd.length) : stack[i].path)
						.write(" , line " + stack[i].line + " , col. " + stack[i].col)
						.reset()
						.write("\n");
				}
			}
		}

		return this;
	};
}

function build_tag(cursor, tag, color) {
	if (!tag) {
		return cursor.write("  ");
	}
	if (color === null) {
		return cursor.write(tag).write(" ");
	}

	return cursor.bg.hex(color).fg.hex("#ffffff").write(tag).bg.reset().write(" ");
}

function build_timestamp(settings) {
	if (!settings.timestamp.timezone) {
		return moment().format(settings.timestamp.format);
	}
	return moment().tz(settings.timestamp.timezone).format(settings.timestamp.format)
}

function str_repeat(c, l) {
	return (new Array(l + 1)).join(c);
}
