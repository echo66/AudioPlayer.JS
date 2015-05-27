/*
 * params: {id, bufferSize (default 512), sampleRate (default 44100), audioContext (opt)}
 */
function AudioPlayer(params) {
	
	var _id = params.id;
	var _loopStart = _loopEnd = 0;
	var _loopActive = false;
	var _loopItCount = 0;
	var _pitch = 0;
	var _canPlay = false;
	var _isConnected = false;
	var _bufferSize = (params.bufferSize!=undefined)? params.bufferSize : 512;
	var _sampleRate = (params.sampleRate!=undefined)? params.sampleRate : 44100;
	var _audioContext = (params.audioContext)? params.audioContext : new AudioContext();
	var _audioElement = new Audio();
	var _mediaElementSource = _audioContext.createMediaElementSource(_audioElement);
	var _pitchShifter = new Jungle( _audioContext );
	_pitchShifter.setPitchOffset(_pitch);
	var _auxNode = _audioContext.createScriptProcessor(_bufferSize, 2, 2);
	var _destination;
	var _beats;
	var _bpm;
	var _callbacks = {};

	this.get_audio = function () { return _audioElement; }

	_auxNode.onaudioprocess = function (e) {
		_audioElement.pause();
		if (_canPlay) {

			e.outputBuffer.getChannelData(0).set(e.inputBuffer.getChannelData(0));
			e.outputBuffer.getChannelData(1).set(e.inputBuffer.getChannelData(1));
			
			if (_audioElement.currentTime >= _loopEnd && _loopActive) {
				_audioElement.currentTime = _loopStart;
				_loopItCount += 1;
			}

			_audioElement.play();

		}
	}

	_mediaElementSource.connect(_auxNode);
	_auxNode.connect(_pitchShifter.input);


	Object.defineProperties(this, {
		'id' : {
			get: function() { return _id; }
		},
		'time' : {
			get: function() { return _audioElement.currentTime; },
			set: function(time) { 
				_audioElement.currentTime = (time <= _audioElement.duration && time >= 0)? time : _audioElement.currentTime; 
				_emit("set-time", {id: _id, time: _audioElement.currentTime});
			}
		}, 
		'duration' : {
			get: function() { return _audioElement.duration; }
		}, 
		'stretch' : {
			get: function() { return 1/_audioElement.playbackRate; },
			set: function(factor) { 
				_audioElement.playbackRate = (factor>2)? 0.5 : 1/factor; 
				_emit("time-stretch", {id: _id, factor: factor});
				return _audioElement.playbackRate;
			}
		},
		'pitch' : {
			get: function() { return _pitch; },
			set: function(factor) { 
				_pitch = (factor>=-1 && factor<=1)? factor : _pitch; 
				_pitchShifter.setPitchOffset(_pitch);
				_emit("pitch-shift", {id: _id, factor: _pitch}); 
				return _pitch;
			}
		},
		'context' : {
			get: function() { return _audioContext; }
		},
		'isPlaying' : {
			get: function() { return _canPlay && _isConnected; }
		},
		'isLoaded' : {
			get: function() { return _audioElement.src != "" || _audioElement.src != undefined; }
		},
		'isConnected' : {
			get: function() { return _isConnected; }
		},
		'isLooping' : {
			get: function() { return _loopActive; }
		}
	});

	this.clear = function() {
		_audioElement.pause();
		_audioElement.src = "";
		_mediaElementSource.disconnect();
		_pitchShifter.disconnect();
		_auxNode.disconnect();

		_id = undefined;
		_loopStart = _loopEnd = undefined;
		_loopActive = undefined;
		_loopItCount = undefined;
		_pitch = undefined;
		_canPlay = undefined;
		_isConnected = undefined;
		_bufferSize = undefined;
		_sampleRate = undefined;
		_audioContext = undefined;
		_audioElement = undefined;
		_mediaElementSource = undefined;
		_pitchShifter = undefined;
		_auxNode = undefined;
		_destination = undefined;
		_callbacks = undefined;
		_beats = undefined; 
		_bpm = undefined;
	}

	this.play = function() {
		if (!_canPlay && _isConnected && this.isLoaded) {
			_canPlay = true;
			_audioElement.play();
			_emit("play", {id: _id, time: _audioElement.currentTime});
		} else if (!_isConnected || !this.isLoaded) {
			throw "Cannot start playback without connecting or loading the audio player.";
		}
	}

	this.pause = function () {
		if (_canPlay && _isConnected && this.isLoaded) {
			_canPlay = false;
			_audioElement.pause();
			_emit("pause", {id: _id, time: _audioElement.currentTime});
		} else if (!_isConnected || !this.isLoaded) {
			throw "Cannot pause playback without connecting or loading the audio player.";
		}
	}

	this.stop = function() {
		if (_canPlay && _isConnected && this.isLoaded) {
			_canPlay = false;
			_audioElement.currentTime = 0;
			_emit("stop", {id: _id, time: _audioElement.currentTime});
		} else if (!_isConnected || !this.isLoaded) {
			throw "Cannot stop playback without connecting or loading the audio player.";
		}
	}

	// params: {src|audioElement, beats|bpm}
	this.load = function(params) {
		if (params.beats && Array.isArray(params.beats)) {
			_beats = params.beats.sort();
			for (var i=0; i<_beats.length-1; i++) {
				var start = _beats[i];
				var end   = _beats[i];
				var beatPeriod = end - start;
				var beatBPM = 60 / beatPeriod;
				_beats[i] = [start, end, beatBPM];
			}
		} else if (params.bpm!=undefined && (typeof params.bpm == "string" || typeof params.bpm == "number")) {
			_bpm = params.bpm;
		} else 
			throw "Invalid parameters";

		if (params.src) {
			_canPlay = false;
			_loopActive = false;
			_audioElement.src = params.src;
		} else if (params.audioElement) {
			_canPlay = false;
			_loopActive = false;
			_mediaElementSource.disconnect();
			_audioElement.src = "";
			_audioElement = params.audioElement;
			_mediaElementSource = _audioContext.createMediaElementSource(_audioElement);
			_mediaElementSource.connect(_auxNode);
		} else 
			throw "Invalid parameters"

		_emit("load", {id: _id});
	}

	this.loop = function(params) {
		if (!params) {
			_loopActive = false;
			_loopItCount = 0;
			_emit("stop-loop", {id: _id});
		} else {
			_loopStart = params.start;
			_loopEnd = params.end;
			_loopActive = true;
			_loopItCount = 0;
			_emit("start-loop", {id: _id, start: _loopStart, end: _loopEnd});
		}
	}

	this.unload = function() {
		_canPlay = false;
		_audioElement.src = "";
		_emit("unload", {id: _id});
	}

	this.connect = function (dest) {
		_destination = dest;
		_pitchShifter.output.connect(_destination);
		_isConnected = true;
		_emit("connect", {id: _id, dest: _destination});
	}

	this.disconnect = function() {
		_isConnected = false;
		_pitchShifter.output.disconnect();
		_emit("disconnect", {id: _id});
	}

	var _emit = function(evenType, data) {
		for (var ci in _callbacks[evenType]) 
		_callbacks[evenType][ci](data);
	}

	this.on = function(observerID, eventType, callback) {

		if (!eventType || _callbacks[eventType]==undefined) 
			throw "Unsupported event type";

		if (observerID!=undefined && _callbacks[eventType][observerID]!=undefined) 
			throw "Illegal modification of callback";

		var __id = (observerID==undefined)? _id + "-associate-" + (_idCounter++) : observerID;
		_callbacks[eventType][__id] = callback;

		return __id;
	}

	this.off = function(observerID, eventType) {
		if (!eventType || _callbacks[eventType]==undefined) 
			throw "Unsupported event type";

		delete _callbacks[eventType][observerID];
	}


	 /* Copyright 2012, Google Inc.
	  * All rights reserved.
	  * 
	  * Redistribution and use in source and binary forms, with or without
	  * modification, are permitted provided that the following conditions are
	  * met:
	  * 
	  *     * Redistributions of source code must retain the above copyright
	  * notice, this list of conditions and the following disclaimer.
	  *     * Redistributions in binary form must reproduce the above
	  * copyright notice, this list of conditions and the following disclaimer
	  * in the documentation and/or other materials provided with the
	  * distribution.
	  *     * Neither the name of Google Inc. nor the names of its
	  * contributors may be used to endorse or promote products derived from
	  * this software without specific prior written permission.
	  * 
	  * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
	  * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
	  * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
	  * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
	  * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
	  * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
	  * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
	  * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
	  * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	  * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	  * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	  */

	function Jungle(context) {

	    var DEFAULT_DELAYTIME = 0.100;
	    var DEFAULT_FADETIME = 0.050;
	    var DEFAULT_BUFFERTIME = 0.100;

	    var previousPitch = -1;

	    this.context = context;
	    // Create nodes for the input and output of this "module".
	    var input = context.createGain();
	    var output = context.createGain();
	    this.input = input;
	    this.output = output;
	    
	    // Delay modulation.
	    var mod1 = context.createBufferSource();
	    var mod2 = context.createBufferSource();
	    var mod3 = context.createBufferSource();
	    var mod4 = context.createBufferSource();
	    this.shiftDownBuffer = createDelayTimeBuffer(context, DEFAULT_BUFFERTIME, DEFAULT_FADETIME, false);
	    this.shiftUpBuffer = createDelayTimeBuffer(context, DEFAULT_BUFFERTIME, DEFAULT_FADETIME, true);
	    mod1.buffer = this.shiftDownBuffer;
	    mod2.buffer = this.shiftDownBuffer;
	    mod3.buffer = this.shiftUpBuffer;
	    mod4.buffer = this.shiftUpBuffer;
	    mod1.loop = true;
	    mod2.loop = true;
	    mod3.loop = true;
	    mod4.loop = true;

	    // for switching between oct-up and oct-down
	    var mod1Gain = context.createGain();
	    var mod2Gain = context.createGain();
	    var mod3Gain = context.createGain();
	    mod3Gain.gain.value = 0;
	    var mod4Gain = context.createGain();
	    mod4Gain.gain.value = 0;

	    mod1.connect(mod1Gain);
	    mod2.connect(mod2Gain);
	    mod3.connect(mod3Gain);
	    mod4.connect(mod4Gain);

	    // Delay amount for changing pitch.
	    var modGain1 = context.createGain();
	    var modGain2 = context.createGain();

	    var delay1 = context.createDelay();
	    var delay2 = context.createDelay();
	    mod1Gain.connect(modGain1);
	    mod2Gain.connect(modGain2);
	    mod3Gain.connect(modGain1);
	    mod4Gain.connect(modGain2);
	    modGain1.connect(delay1.delayTime);
	    modGain2.connect(delay2.delayTime);

	    // Crossfading.
	    var fade1 = context.createBufferSource();
	    var fade2 = context.createBufferSource();
	    var fadeBuffer = createFadeBuffer(context, DEFAULT_BUFFERTIME, DEFAULT_FADETIME);
	    fade1.buffer = fadeBuffer
	    fade2.buffer = fadeBuffer;
	    fade1.loop = true;
	    fade2.loop = true;

	    var mix1 = context.createGain();
	    var mix2 = context.createGain();
	    mix1.gain.value = 0;
	    mix2.gain.value = 0;

	    fade1.connect(mix1.gain);    
	    fade2.connect(mix2.gain);
	        
	    // Connect processing graph.
	    input.connect(delay1);
	    input.connect(delay2);    
	    delay1.connect(mix1);
	    delay2.connect(mix2);
	    mix1.connect(output);
	    mix2.connect(output);
	    
	    // Start
	    var t = context.currentTime + 0.050;
	    var t2 = t + DEFAULT_BUFFERTIME - DEFAULT_FADETIME;
	    mod1.start(t);
	    mod2.start(t2);
	    mod3.start(t);
	    mod4.start(t2);
	    fade1.start(t);
	    fade2.start(t2);

	    this.mod1 = mod1;
	    this.mod2 = mod2;
	    this.mod1Gain = mod1Gain;
	    this.mod2Gain = mod2Gain;
	    this.mod3Gain = mod3Gain;
	    this.mod4Gain = mod4Gain;
	    this.modGain1 = modGain1;
	    this.modGain2 = modGain2;
	    this.fade1 = fade1;
	    this.fade2 = fade2;
	    this.mix1 = mix1;
	    this.mix2 = mix2;
	    this.delay1 = delay1;
	    this.delay2 = delay2;


	    this.setDelay = function(delayTime) {
	        this.modGain1.gain.setTargetAtTime(0.5*delayTime, 0, 0.010);
	        this.modGain2.gain.setTargetAtTime(0.5*delayTime, 0, 0.010);
	    }

	    this.setPitchOffset = function(mult) {
	        if (mult>0) { // pitch up
	            this.mod1Gain.gain.value = 0;
	            this.mod2Gain.gain.value = 0;
	            this.mod3Gain.gain.value = 1;
	            this.mod4Gain.gain.value = 1;
	        } else { // pitch down
	            this.mod1Gain.gain.value = 1;
	            this.mod2Gain.gain.value = 1;
	            this.mod3Gain.gain.value = 0;
	            this.mod4Gain.gain.value = 0;
	        }
	        this.setDelay(DEFAULT_DELAYTIME * Math.abs(mult));
	        previousPitch = mult;
	    }

	    this.setDelay(DEFAULT_DELAYTIME);


	    function createFadeBuffer(context, activeTime, fadeTime) {
	        var length1 = activeTime * context.sampleRate;
	        var length2 = (activeTime - 2*fadeTime) * context.sampleRate;
	        var length = length1 + length2;
	        var buffer = context.createBuffer(1, length, context.sampleRate);
	        var p = buffer.getChannelData(0);
	        
	        // console.log("createFadeBuffer() length = " + length);
	        
	        var fadeLength = fadeTime * context.sampleRate;

	        var fadeIndex1 = fadeLength;
	        var fadeIndex2 = length1 - fadeLength;
	        
	        // 1st part of cycle
	        for (var i = 0; i < length1; ++i) {
	            var value;
	            
	            if (i < fadeIndex1) {
	                value = Math.sqrt(i / fadeLength);
	            } else if (i >= fadeIndex2) {
	                value = Math.sqrt(1 - (i - fadeIndex2) / fadeLength);
	            } else {
	                value = 1;
	            }
	            
	            p[i] = value;
	        }

	        // 2nd part
	        for (var i = length1; i < length; ++i) {
	            p[i] = 0;
	        }
	        
	        
	        return buffer;
	    }

	    function createDelayTimeBuffer(context, activeTime, fadeTime, shiftUp) {
	        var length1 = activeTime * context.sampleRate;
	        var length2 = (activeTime - 2*fadeTime) * context.sampleRate;
	        var length = length1 + length2;
	        var buffer = context.createBuffer(1, length, context.sampleRate);
	        var p = buffer.getChannelData(0);

	        // console.log("createDelayTimeBuffer() length = " + length);
	        
	        // 1st part of cycle
	        for (var i = 0; i < length1; ++i) {
	            if (shiftUp)
	              // This line does shift-up transpose
	              p[i] = (length1-i)/length;
	            else
	              // This line does shift-down transpose
	              p[i] = i / length1;
	        }

	        // 2nd part
	        for (var i = length1; i < length; ++i) {
	            p[i] = 0;
	        }

	        return buffer;
	    }
	}
}