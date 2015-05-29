// params: {id, type, title, description, units, range, convert}
function Parameter(params) {

	_type = params.type;

	_observers = [];

	_value = default_value;

	Object.defineProperty(this, "value", {
		get: function() {
			return _value;
		},
		set: function(newValue) {
			var T = typeof newValue;
			if (T==_type) {
				oldValue = _value;
				_value = newValue;
				this.notify(oldValue, newValue);
			} else 
				throw "Wrong value type.";
		}
	});

	Object.defineProperty(this, "type", {
		get: function() {
			return _type;
		},
		set: function() {
			throw "Cannot change parameter type after initialization";
		}
	});

	//listener: function({oldValue, newValue})
	this.on = function(eventType, listener) {
		return _observers.push([eventType, listener]);
	};

	this.off = function(eventType, listener) {
		var index;
		index = _observers.indexOf([eventType, listener]);
		return _observers.splice(index, 1);
	};

	this.notify = function() {
		var fun, _i, _len, _ref, _results;
		_ref = _observers;
		_results = [];
		for (_i = 0, _len = _ref.length; _i < _len; _i++) {
			fun = _ref[_i];
			_results.push(fun[1].call(fun[0], this.value));
		}
		return _results;
	};

}