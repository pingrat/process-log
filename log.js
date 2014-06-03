(function() {

	var format = require('util').format,
	    ansi   = require('ansi'),
	    log    = new process.EventEmitter();

	var _cursor       = ansi(process.stderr),
	    _stream       = process.stderr,
	    _colorEnabled = true,
	    _id           = 0,
	    _paused       = false,
	    _buffer       = [],
	    _record       = [],
	    _heading      = (typeof process.name === 'string') ? process.name : '',
	    _level        = 'silent',
	    _levels       = {},
	    _styles       = {},
	    _labels       = {};

	var slice = Array.prototype.slice;

	// Define some getters and setters
	Object.defineProperties(log, {
		'paused': {
			enumerable: true,
			get: function() {
				return _paused;
			}
		},
		'level': {
			enumerable: true,
			get: function() {
				return _level;
			},
			set: function(value) {
				if (value in _levels)
					_level = value;
			}
		},
		'heading': {
			enumerable: true,
			get: function() {
				return _heading;
			},
			set: function(value) {
				if (typeof value === 'string')
					_heading = value;
			}
		}
	});

	// ### log.pause()
	// Temporarily stop printing.
	log.pause = function pause() {
		_paused = true;
	};

	// ### log.resume()
	// Temporarily stop printing.
	log.resume = function resume() {
		if (!_paused) return;
		_paused = false;

		var backlog = _buffer;
		_buffer = [];
		backlog.forEach(function (msg) {
			_render.call(this, msg);
		}, this);
	};

	// ### log.write(text, style)
	// Write `text`, optionally formatted according to `style`, to the
	// current stream.
	log.write = function write(text, style) {
		if (_stream !== _cursor.stream) {
			_cursor = ansi(_stream, { enabled: _colorEnabled })
		}

		style = style || {}
		if (style.fg !== void(0)) {
			// The [ansi](https://github.com/TooTallNate/ansi.js) module also supports colors in hex notation!
			if (/^#[\da-f]{6}$/i.test(style.fg))
				_cursor.fg.hex(style.fg);
			else if (typeof _cursor.fg[style.fg] === 'function')
				_cursor.fg[style.fg]();
		}
		if (style.bg !== void(0)) {
			if (/^#[\da-f]{6}$/i.test(style.bg))
				_cursor.bg.hex(style.bg);
			else if (typeof _cursor.bg[style.bg] === 'function')
				_cursor.bg[style.bg]();
		}
		if (style.bold) _cursor.bold()
		if (style.underline) _cursor.underline()
		if (style.inverse) _cursor.inverse()
		if (style.beep) _cursor.beep()
		_cursor.write(text).reset()
	};

	// ### _format()
	// Private function.
	function _format() {
		var args     = slice.call(arguments),
		    template = args.shift();
		return format.apply(null, [template].concat(args));
	}

	// ### _log()
	// Private function.
	function _log() {
		var args    = slice.call(arguments),
		    level   = args[0],
		    prefix  = args[1],
		    message = _format.apply(this, args.slice(2));

		if (_levels[level] === void(0))
			return this.emit('error', new Error(format('Undefined log level: %O', level)));

		var msg = {
			id: _id++,
			level: level,
			prefix: String(prefix || ''),
			message: message,
			messageRaw: args
		};
		this.emit('log', msg)

		_record.push(msg);

		_render.call(this, msg);
	}

	// ### _render(msg)
	// Private function.
	function _render(msg) {
		if (msg.constructor !== Object)
			return this.emit('error', new Error(format('Unknown message format: %O', msg)));

		if (_levels[msg.level] === undefined) return;
		if (_levels[msg.level] < _levels[_level]) return;
		if (_levels[msg.level] > 0 && !isFinite(_levels[msg.level])) return;

		msg.message
			.split(/\r?\n/g)
			.forEach(function (line) {
				if (_heading) {
					this.write(_heading, _styles.heading)
					this.write(' ')
				}
				this.write(_labels[msg.level], _styles[msg.level]);
				this.write(' ');
				if (msg.prefix) {
					this.write(msg.prefix, _styles.prefix);
					this.write(' ');
				}
				this.write(line + '\n');
			}, this);
	};

	log.addLevel = function addLevel(id, prio, styles, label) {
		if (!label) label = id;
		_levels[id] = prio;
		_styles[id] = styles;
		_labels[id] = label;
		this[id] = (function() {
			var args = slice.call(arguments);
			return _log.apply(this, [id].concat(args));
		}).bind(this);
	};

	log.setStyle = function setStyle(id, styles) {
		_styles[id] = styles;
	}

	log.reset = function reset() {
		Object.keys(_levels)
			.forEach(function(level) {
				delete this[level]
			}, this);
		_levels = {};
		_styles = {};
		_labels = {};
		this.addLevel('silent', Infinity);
		_level = 'silent';
	}

	log.reset();

	log.addLevel('silly', -Infinity, { inverse: true }, 'sill');
	log.addLevel('verbose', 1000, { fg: 'white', bg: 'black', underline: true, bold: true }, 'verb');
	log.addLevel('info', 2000, { fg: '#82b375', bg: 'black' });
	log.addLevel('http', 3000, { fg: '#728c94', bg: 'black' });
	log.addLevel('warn', 4000, { fg: 'black', bg: '#e3e782' }, 'WARN');
	log.addLevel('error', 5000, { fg: 'black', bg: '#cc6666' }, 'ERR!');

	log.setStyle('heading', {fg: '#404040'});
	log.setStyle('prefix', {fg: '#825e82'});

	module.exports = log;

})();
