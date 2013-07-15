(function(){
	var _;

	function Blank (target) {
		this.target = target;
	}

	_ = Blank;

	Blank.define = function(module) {
		var name, value;

		if ('methods' in module) {
			for (name in module.methods) {
				this.constructor.prototype[name] = module.methods[name];
			}
		}

		if ('utils' in module) {
			for (name in module.utils) {
				this[name] = module.utils[name];
			}
		}
	};

	Blank.method = function(name, fn) {
		this.constructor.prototype[name] = fn;
	};

	Blank.methods = function(methods) {
		var name;
		for (name in methods) {
			this.method(name, methods[name]);
		}
	};

	Blank.util = function(name, fn) {
		this[name] = fn;
	};

	Blank.utils = function(utils) {
		var name;
		for (name in utils) {
			this.util(name, utils[name]);
		}
	};

	// Test functions
	
	function isFunction(target) {
		return typeof(target) === 'function';
	};

	function isObject(target) {
		return typeof(target) === 'object';
	};

	function isString(target) {
		return typeof(target) === 'string';
	};

	function isBoolean(target) {
		return typeof(target) === 'boolean';
	};

	function isNumber(target) {
		return typeof(target) === 'number';
	};

	function isArray(target) {
		return isObject(target) && target instanceof Array;
	};

	function isError(target) {
		return isObject(target) && target instanceof Error;
	};

	function isEqual (a, b) {
		return a == b;
	}

	function isNotEqual(a, b) {
		return a != b;
	}

	function isGreater(a, b) {
		return a > b;
	}

	function isLess(a, b) {
		return a < b;
	}

	function isTrue(target) {
		return target === true;
	}

	function isFalse(target) {
		return target === false;
	}

	function Assert() {
		var results;
		results        = [];
		results.total  = 0;
		results.passed = 0;
		results.missed = 0;
		results.ok     = true;
		results.fail   = false;

		this.results = results;
	};

	Assert.prototype.isArray = function(target, message) {
		message = message || '%s is array';
		this._result(isArray(target), this.format(message, target));
	};

	Assert.prototype.isObject = function(target, message) {
		message = message || 'Is object';
		this._result(isObject(target), this.format(message, target));
	};

	Assert.prototype.isFunction = function(target, message) {
		message = message || 'Is function';
		this._result(isFunction(target), this.format(message, target));
	};

	Assert.prototype.isString = function(target, message) {
		message = message || 'Is string';
		this._result(isString(target), this.format(message, target));
	};

	Assert.prototype.isBoolean = function(target, message) {
		message = message || 'Is boolean';
		this._result(isBoolean(target), this.format(message, target));
	};

	Assert.prototype.isNumber = function(target, message) {
		message = message || 'Is number';
		this._result(isNumber(target), this.format(message, target));
	};

	Assert.prototype.isError = function(target, message) {
		message = message || 'Is error';
		this._result(isError(target), this.format(message, target));
	};

	Assert.prototype.isTrue = function(target, message) {
		message = message || 'Is true';
		this._result(isTrue(target), this.format(message, target));
	};

	Assert.prototype.isFalse = function(target, message) {
		message = message || 'Is false';
		this._result(isFalse(target), this.format(message, target));
	};

	Assert.prototype.isEqual = function(a, b, message) {
		message = message || 'Is equal';
		this._result(isEqual(a, b), this.format(message, a, b));
	};

	Assert.prototype.isNotEqual = function(a, b, message) {
		message = message || 'Is not equal';
		this._result(isNotEqual(a, b), this.format(message, a, b));
	};

	Assert.prototype.isGreater = function(a, b, message) {
		message = message || '%d is greater then %d';
		this._result(isGreater(a, b), this.format(message, a, b) );
	};

	Assert.prototype.isLess = function(a, b, message) {
		message = message || '%d is less then %d';
		this._result(isLess(a, b), this.format(message, a, b));
	};

	Assert.prototype.format = function(message, value) {
		var values = toArray(arguments).slice(1).map(function(value){
			return JSON.stringify(value, null);
		});

		values.unshift(message);
		return format.apply(null, values);
	};

	Assert.prototype._result = function(result, message) {
		this.results.total++;

		if (result) {
			this.results.passed++;
		} else {
			this.results.missed++;
			this.results.ok   = false;
			this.results.fail = true;
		}

		this.results.push({
			result  : result,
			message : message
		});
	}

	function test(test, callback) {
		var assert = new Assert();
		test(assert);

		if (typeof callback === 'function') {
			callback(assert.results);
		} else {
			return assert.results;
		}
	}

	Blank.define({
		utils : {
			isFunction : isFunction,
			isObject   : isObject,
			isArray    : isArray,
			isBoolean  : isBoolean,
			isNumber   : isNumber,
			isError    : isError,
			isEqual    : isEqual,
			isNotEqual : isNotEqual,
			test       : test
		}
	});

	// OOPize -----------------------------------------------------------------
	function ProtoObject () {}

	ProtoObject.prototype.super = function(target, method, args) {
		return target[method].apply(this, args);
	};

	ProtoObject.extend = function(source) {
		var fn, parent;
		parent = this;
		if ( ! source.hasOwnProperty('constructor')) {
			fn = function() {
				this.super(parent, 'constructor', arguments);
			}
		} else {
			fn = source.constructor;
			delete source.constructor;
		}

		source.prototype.__proto__ = this.prototype;
		extend(fn.prototype, this.prototype, object);
		extend(fn, this);

		return fn;
	};

	Blank.util('Proto', ProtoObject);

	Blank.util('classify', function(source) {
		return ProtoObject.extend(source)
	});
	

	// MISCELANOUS ------------------------------------------------------------
	
	function toArray(target) {
		return Array.prototype.slice.call(target);
	};

	/**
	 * Format message like a standart console.log do^ replaces %s, %d, %i marks with function argument
	 * 
	 * @param  {String} message Message
	 * @param  {mixed}  value   Value for inserting into string
	 * @return {String}         Formatted string
	 */
	function format (message, value) {
		var values;

		values  = toArray(arguments).slice(1);
		message = message.replace(/%(s|i|d|f)/g, function(v) {
			var replace;
			replace = format[v[1]](values.shift());
			return values.length >= 0 ? replace : '-';
		});

		return message;
	};

	format.s = function(value) {
		// TODO: decide to use JSON stringify or other function
		return stringify(value);
	};

	format.d = format.s;

	format.f = function(value) {
		return parseFloat(value) + '';
	};

	format.i = function(value) {
		return value;
		return parseInt(value) + '';
	};

	function stringify(value) {
		return value + '';
	}

	/**
	 * Convert string to fixed size column
	 * @param  {String}  string String to columnize
	 * @param  {Number}  length Column length
	 * @param  {Boolean} pad    Pad last line
	 * @return {String}         String converted to column
	 */
	function columnize(string, length, pad) {
		var result, slice;
		result = [];
		while (string.length) {
			slice = string.substr(0, length);
			result.push(slice);
			string = string.substr(slice.length);
		}

		if (pad && slice.length < length) {
			while(slice.length < length) {
				slice += pad;
			}

			result[result.length - 1] = slice;
		}

		return result.join('\n');
	};

	function pad(str, length, pad) {
		str = str + '';
		if (length > 0) {
			while(str.length < length) {
				str += pad;
			}
		} else if (length < 0) {
			length *= -1;
			while(str.length < length) {
				str = pad + str;
			}
		}

		return str;
	};

	/**
	 * Create callback nodejs-express-like queue
	 * @param  {Array}        args  Arguments passed to callbacks
	 * @param  {Array}        queue Callbacks queue
	 * @param  {Error|null}   err   Error object
	 */
	function next(args, queue, err) {
		queue = queue.slice();
		args  = (args || []).slice();

		var callback;
		
		if (err) {
			// Search first callback which has 4 arguments: err, req, res, next
			while (queue.length) {
				callback = queue.shift();
				if (callback.length < args.length + 2) {
					continue;
				}

				callback.apply(null, [err].concat(args, next.bind(null, args, queue)));
			}
		} else {
			callback = queue.shift();
			if ( ! callback) return;

			if (callback.length < args.length + 2) {
				callback.apply(null, [].concat(args, next.bind(null, args, queue)));
			} else {
				callback.apply(null, [null].concat(args, next.bind(null, args, queue)));
			}
		}
	};

	Blank.utils({
		toArray   : toArray,
		format    : format,
		columnize : columnize,
		pad       : pad,
		queues    : {
			nextCall : next
		}
	});

	// SHORT HANDS ------------------------------------------------------------
	
	function extend (target, source) {
		var sources, prop;
		sources = Array.prototype.slice.call(arguments, 1);

		while(sources.length) {
			source = sources.shift();
			for (prop in source) {
				target[prop] = source[prop];
			}
		}

		return target;
	};

	/**
	 * Merge objects and use strategy for conflicts
	 * 
	 * @param  {Object}   target   Target to merge in
	 * @param  {Object}   source   Source to merge with target
	 * @param  {Function} strategy Function to resolve conflicts
	 * @return {Object}            Target object
	 */
	function merge (target, source, strategy) {
		var sources, prop, value;
		sources = Array.prototype.slice.call(arguments, 1);

		if (sources.length && typeof sources[sources.length - 1] === 'function') {
			strategy = sources.pop();
		} else {
			strategy = function(a, b) {
				if (isArray(a)) {
					return a.concat(b);
				} else if (isObject(a) && isObject(b)) {
					return merge(a,b, strategy);
				} else {
					return undefined;
				}
			};
		}

		while(sources.length) {
			source = sources.shift();
			for (prop in source) {
				if (strategy && target.hasOwnProperty(prop)) {
					value = strategy(target[prop], source[prop]);
					
					if (typeof value === 'undefined') {
						value = source[prop];
					}

					target[prop] = value;
				} else {
					target[prop] = source[prop];
				}
			}
		}

		return target;
	}

	Blank.utils({
		extend : extend,
		merge  : merge
	});

	Blank.method('extend', function(source) {
		this._target = _.extend(this._target, source);
		return this;
	});
	
	// ENVIRONMENT DETECTION --------------------------------------------------
	
	Blank.define({
		utils : {

			environment : function() {
				var env = {
					type : 'unknown',
					version : undefined,
					v       : undefined
				};

				if (this.isBrowser()) {
					env.type = 'browser';
					// TODO : add version and programm name support
				} else if (this.isNodeJs()) {
					env.type = 'nodejs'
					env.version = env.v = process.version;
				} else {
					env.type = 'unknown'
				}

				return env;
			},

			isBrowser : function() {
				return typeof window !== 'undefined';
			},

			isIE : function() {
				if (typeof this._ie === 'undefined') {
					this._ie = this.isBrowser() && ('ActiveXObject' in window);
				}

				return this._ie;
			},

			browser : function(version, callback) {
				if ( ! this.isBrowser()) return this;

				if (arguments.length === 1) {
					// TODO: add version and browser name support
					callback = version;
					callback();
				} else {
					throw new Error('Version support not added yet');
				}

				return this;
			},

			isNodeJs : function() {
				return typeof process !== 'undefined' && typeof module !== 'undefined' && module.exports;
			},

			nodeJs : function(version, callback) {
				if ( ! this.isNodeJs()) return this;

				if (arguments.length === 1) {
					callback = version;
					callback();
				} else {
					throw new Error('Version support not added yet');
				}

				return this;
			}
		}
	});

	/*
		Browser dependant functions
	 */
	Blank.browser(function() {
		Blank.utils({
			addListener : function(target, event, callback) {
				if (! this.isIE()) {
					target.addEventListener(event, callback);
				} else {
					target.attachEvent(event, callback);
				}
			},

			removeListener : function(target, event, callback) {
				if (! this.isIE()) {
					target.removeEventListener(event, callback);
				} else {
					target.detachEvent(event, callback);
				}
			}
		});

		window.blank = Blank;
		window._     = Blank;

		stringify = function(value) {
			return JSON.stringify(value, null, 4);
		}
	});

	Blank.nodeJs(function(){
		module.exports = Blank;

		stringify = function(v) {
			return require('util').inspect(v, true);
		}
	});

	if (typeof define === 'function') {
		define(function(){ return Blank; });
	}
})();