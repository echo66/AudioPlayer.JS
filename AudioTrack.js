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
				//TODO
			}, 
			set: function(newTime) {
				//TODO
			}
		}, 
		'volume' : {
			get: function() {
				//TODO
			}, 
			set: function(volume) {
				//TODO
			}
		}
	});

	this.start = function() {
		_scheduler.start();
	}

	this.stop = function() {
		// TODO
	}

	this.pause = function() {
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

	// params: {id}
	this.unschedule = function(params) {
		_scheduler.remove({id: params.id});
	}

	this.add_effect = function(params) {
		//TODO
	}

	this.remove_effect = function(params) {
		//TODO
	}

	this.get_effects = function(params) {
		//TODO
	}

	// params: {effectId, {paramId: [instruction, ..., instruction]}, rewrite}
	// If effectId is equal to "bpm" and this track does not depend on any transport object 
	// Then change the bpm automation.
	this.set_automation = function(params) {
		//TODO
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