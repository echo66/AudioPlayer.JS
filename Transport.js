/*
 *  params: { scheduler (opt), bpmTimeline (opt)}
 */
function Transport(params) {

	var _timer = new WAATimer({	
					id: "", //TODO
					audioContext: params.audioContext 
				 });

	var _bpmTimeline = new BPMTimeline(120);

	var _tracks = {};
	


	this.start = function() {
		//TODO
	}

	this.pause = function() {
		//TODO
	}

	this.stop = function() {
		//TODO
	}

	this.time = function(params) {
		//TODO
	}

	this.bpm = function(params) {
		//TODO
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
			_tracks[params.id].clear();
			delete _tracks[params.id];
		} else 
			throw "Unknown track";
	}

	var get_track = function(id) {
		if (_tracks[id])
			return _tracks[id];
		else
			throw "Unknown track";
	}
}