/*
 *  params: {id, timer (opt), audioContext, initialBPM (opt, default 120), bpmTimeline (opt), units}
 */
function AudioTrackBaseline(params) {

	if (params.id==undefined) throw "Invalid parameters";

	var _id = params.id;
	var _eventIdCounter = 0;
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
				bpmTimeline: params.bpmTimeline || new BPMTimeline(initialBPM), 
				units: params.units
			});
	var _usingOwnTimer = (params.timer)? false : true;
	var _audioToPlay = {}; // {src: [Audio, beats, count]}
	var _units = params.units;

	var _stereoPannerNode = _audioContext.createStereoPanner();
	var _gainNode = _audioContext.createGain();

	_audioPlayer.connect(_gainNode);
	_gainNode.connect(_stereoPannerNode);

	var _lastNode = _stereoPannerNode;


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
		}, 
		'time' : {
			get: function() {
				_scheduler.get_current_time();
			}, 
			set: function(newTime) {
				_scheduler.set_current_time(newTime);
			}
		}, 
		'volume' : {
			get: function() {
				//TODO
			}, 
			set: function(volume) {
				//TODO
				var _volume;
				if (volume < 0)
					_volume = 0;
				else if (volume > 2)
					_volume = 2;
				else
					_volume = volume;
				_gainNode.gain.value = _volume;
				// TODO: change the entire automation for this value 
				// like it would happen in mixmeister.	
			}
		}, 
		'pan' : {
			get: function() {
				return _stereoPannerNode.pan.value;
			}, 
			set: function(panVal) {
				var _panVal;
				if (panVal < -1)
					_panVal = -1;
				else if (panVal > 1)
					_panVal = 1;
				else 
					_panVal = panVal;
				_stereoPannerNode.pan.value = _panVal
				// TODO: change the entire automation for this value 
				// like it would happen in mixmeister.
			}
		}
	});

	this.start = function() {
		_scheduler.start();
	}

	this.stop = function() {
		_scheduler.reset();
		_audioPlayer.stop();
		// TODO
	}

	this.pause = function() {
		_scheduler.pause();
		_audioPlayer.pause();
		// TODO
	}

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
	
	/*
	 *  params: {
	 *    src: String, 
	 *    beats: Array, 
	 *    interval: { 
	 *      start: Number, 
	 *      end: Number, 
	 *      units: String 
	 *    }, 
	 *    start: Number, 
	 *    units: String
	 *  }
	 */
	this.schedule = function(params) {

		if (params.src==undefined || params.beats==undefined || params.start==undefined)
			throw "Invalid parameters";

		load_audio(src);

		_scheduler.add({
			id: _eventIdCounter++, 
			start: params.start, 
			stop: params.end, 
			startFn: function(time) {
				_audioPlayer.load({
					audioElement: _audioToPlay[src], 
					beats: params.beats
				});
				_audioPlayer.time = params.interval.start
				_audioPlayer.play();
			}, 
			stopFn: function() {
				_audioPlayer.stop();
				unload_audio(src);
			}
		});
	}

	this.connect = function(destination) {
		_lastNode.connect(destination);
	}

	this.disconnect = function() {
		_lastNode.disconnect();
	}

	// params: {id}
	this.unschedule = function(params) {
		_scheduler.remove({id: params.id});
	}

	// params: {connectionSpecification, effectType}
	this.add_effect = function(params) {
		//TODO
	}

	// params: {connectionSpecification, effectId}
	this.remove_effect = function(params) {
		//TODO
	}

	this.get_effects = function() {
		//TODO
	}

	// params: {effectId, paramId, value}
	this.set_parameter = function(params) {
		//TODO
	}

	// params: {effectId, {paramId: [instruction, ..., instruction]}, rewrite}
	// If effectId is equal to "bpm" and this track does not depend on any transport object 
	// Then change the bpm automation.
	this.set_automation = function(params) {
		var eid = params.effectId;
		if (eid == "bpm") {
			// TODO
		} else if (eid == "panner") {
			// TODO
		} else if (eid == "volume") {
			// TODO
		} else {
			// TODO
		}
	}

	// params: {effectId}
	this.get_automation = function(params) {
		//TODO
	}

	this.clear = function() {
		_id = undefined;
		_audioPlayer = undefined;
		_audioContext = undefined;
		_scheduler = undefined;
		_usingOwnTimer = undefined;
	}

}