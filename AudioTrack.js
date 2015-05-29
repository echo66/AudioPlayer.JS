/*
 *  params: {id, timer (opt), audioContext, initialBPM (default 120)}
 */
function AudioTrackBaseline(params) {

	if (params.id==undefined) throw "Invalid parameters";

	var _id = params.id;
	var _audioContext = params.audioContext;
	var _audioPlayer  = new AudioPlayer({
							id: params.id+"-player", 
							bufferSize: 512, 
							sampleRate: 44100, 
							audioContext: _audioContext
						});
	var _effects = {};
	var _scheduler = new Scheduler({
				id: params.id, 
				timer: params.timer || new WAATimer({
											id: params.id+"-timer", 
											audioContext: _audioContext}), 
				initialBPM: (params.initialBPM!=undefined)? params.initialBPM : 120, 
				removeCompleted: false,
				units: "beats"
			});
	var _usingOwnTimer = (params.timer)? false : true;
	var _audioToPlay = {}; // {src: [Audio, beats, count]}
	var _units = "beats";

	Object.defineProperties(this, {
		'id' : {
			get: function() { return _id; }
		}, 
		'timer' : {
			get: function() { return _scheduler.get_timer(); }
		}, 
		'audioContext' : {
			get: function() { return _audioContext; }
		}, 
		'units' : {
			get: function() { return _units; }
		}
	});

	function load_audio(src) {
		if (_audioPlayer[src])
			_audioPlayer[src].count++;
		else 
			_audioPlayer[src] = { audio: new Audio(src), count: 1 };
	}

	function unload_audio(src) {
		if (_audioPlayer[src]) {
			_audioPlayer[src].count--;
			if (_audioPlayer[src].count <= 0) {
				// Just in case, pause the audio element and remove the src string.
				_audioPlayer[src].audio.pause();
				_audioPlayer[src].audio.src = undefined;
				delete _audioPlayer[src];
			}
		} else 
			throw "Unknown audio reference";
	}
	
	// params: {src, beats, interval: {start, end, units}, start, units}
	this.schedule = function(params) {

		if (params.src==undefined || params.beats==undefined || params.start==undefined)
			throw "Invalid parameters";

		//TODO
		load_audio(src);
		_scheduler.add({
			start: params.start, 
			stop: params.end, 
			startFn: function(time) {
				_audioPlayer.load({
					audioElement: _audioPlayer[src], 
					beats: params.beats
				});
				_audioPlayer.time = params.interval.start
				_audioPlayer.play();
			}, 
			stopFn: function() {

			}
		});
	}

	// params: {id}
	this.unschedule = function(params) {
		//TODO
	}

	this.add_effect = function(params) {
		//TODO
	}

	this.remove_effect = function(params) {
		//TODO
	}

	this.clear = function() {
		_id = undefined;
		_audioPlayer = undefined;
		_audioContext = undefined;
		_scheduler = undefined;
		_usingOwnTimer = undefined;
	}


	/*
	 *
	 */
	function PlayAudioEvent(params) {
		var _id = params.id;

		var _tolerance = {
			early: params.tolerance.early, 
			late : params.tolerance.late
		};

		var _start = params.start;
		var _stop   = params.stop;

		var _state = 0;
		var _STATE_ENUM = {
			0 : 'NOT_STARTED', 
			1 : 'RUNNING', 
			2 : 'STOPPED'
		};

		var _startFn = params.callbacks.startFn || function(time) {};
		var _stopFn  = params.callbacks.stopFn;
		var _resetFn = params.callbacks.resetFn;
		var _tickFn  = params.callbacks.tickFn;

		var _units = params.units;

		Object.defineProperties(this, {
			'id': {
				value: _id, 
				writable: false
			},

			'isOneShot' : {
				get: function() { return !_stopFn; }
			}, 

			'isResetable' : {
				get: function() { return _resetFn!=undefined; }
			},

			'isTickable' : {
				get: function() { return _tickFn!=undefined; }
			},

			'startTime'		 : {
				value: _start, 
				writable: false
			},

			'earlyStartTime' : {
				get: function() { return _start - _tolerance.early; }
			},

			'lateStartTime'  : {
				get: function() { return _start + _tolerance.late; }
			}, 

			'stopTime'       : {
				value: _stop, 
				writable: false
			}, 

			'state'          : {
				get: function() {
					return _STATE_ENUM[_state];
				}
			},

			'units'          : {
				value: _units,
				writable: false
			}
		});

		this.start = function(time) { _startFn(time); _state = 1; }

		this.tick  = function(time) { _tickFn(time); }

		this.stop  = function(time) { _stopFn(time); _state = 2; }

		this.reset = function() { _resetFn(); _state = 0; }
	}

}