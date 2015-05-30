/*
 *  params: { bpmTimeline (opt), units}
 */
function Transport(params) {

	var _timer = new WAATimer({	
					id: "", //TODO
					audioContext: params.audioContext 
				 });

	var _bpmTimeline = params.bpmTimeline || new BPMTimeline(120);

	var _units = params.units;

	var _tracks = {};


	Object.defineProperties(this, {
		'id' : {
			get: function() {
				return _id;
			}
		}, 
		'time' : {
			get: function() {
				return _timer.time;
			}, 
			set: function() {
				//TODO
			}
		}, 
		'units' : {
			get: function() {
				return _units;
			}
		}
		'bpm' : {
			get: function() {
				//TODO
			}
		}, 
		'bpmTimeline' : {
			get: function() {
				return _bpmTimeline;
			}
		}
	});

	this.start = function() {
		for (var tid in _tracks) {
			_tracks[tid].play();
		}
	}

	this.pause = function() {
		//TODO
	}

	this.stop = function() {
		//TODO
	}

	this.time = function(params) {
		for (var tid in _tracks) {
			_tracks[tid].time = params. //TODO
		}
	}

	// params: {id, trackId, type, start, end}
	this.schedule = function(params) {
		if (params.type == "play") {
			//TODO
		} else 
			throw "Unknown schedule element type";
	}

	this.unschedule = function(params) {
		//TODO
	}

	// params: {id, type}
	this.add_track = function(params) {
		if (params.type == "audio") {
			// TODO
		} if (params.type == "notes") {
			// TODO
		}else 
			throw "Unknown track type";
	}

	// params: {id}
	this.remove_track = function(params) {
		if (_tracks[params.id]) {
			_tracks[params.id].stop();
			_tracks[params.id].clear();
			delete _tracks[params.id];
		} else 
			throw "Unknown track";
	}

	// Just for debug purposes.
	var get_track = function(id) {
		if (_tracks[id])
			return _tracks[id];
		else
			throw "Unknown track";
	}
}