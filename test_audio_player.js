var P = [];
var G = [];
var BPM_REF = 115;
var context = new AudioContext();

// BPM: 140
P[0] = new AudioPlayer({id:"p1", audioContext: context});
G[0] = context.createGain();
G[0].connect(context.destination);
P[0].connect(G[0]);
P[0].load({src: '../soundtouchjs/5.mp3'});
P[0].default_bpm = 140;
P[0].start_time = 0.23;


// BPM: 139.93487548828125
P[1] = new AudioPlayer({id:"p2", audioContext: context});
G[1] = context.createGain();
G[1].connect(context.destination);
P[1].connect(G[1]);
P[1].load({src: '../soundtouchjs/4.mp3'});
P[1].default_bpm = 140.000457763671875;
P[1].start_time = 0.5;


// // BPM: 135.012054443359375
// P[2] = new AudioPlayer({id:"p3", audioContext: context});
// G[2] = context.createGain();
// G[2].connect(context.destination);
// P[2].connect(G[2]);
// P[2].load({src: '../soundtouchjs/3.mp3'});
// P[2].default_bpm = 135.012054443359375;
// P[2].start_time = 1.82;


// // BPM: 127.99884033203125
// P[3] = new AudioPlayer({id:"p4", audioContext: context});
// G[3] = context.createGain();
// G[3].connect(context.destination);
// P[3].connect(G[3]);
// P[3].load({src: '../soundtouchjs/1.mp3'});
// P[3].default_bpm = 127.99884033203125;
// P[3].start_time = 0.1;


// // BPM: 69.39691162109375
// P[4] = new AudioPlayer({id:"p5", audioContext: context});
// G[4] = context.createGain();
// G[4].connect(context.destination);
// P[4].connect(G[4]);
// P[4].load({src: '../soundtouchjs/2.mp3'});
// P[4].default_bpm = 69.39691162109375;
// P[4].start_time = 10.6;


// // BPM: 135.04608154296875
// P[5] = new AudioPlayer({id:"p6", audioContext: context});
// G[5] = context.createGain();
// G[5].connect(context.destination);
// P[5].connect(G[5]);
// P[5].load({src: '../soundtouchjs/6.mp3'});
// P[5].default_bpm = 135.04608154296875;
// P[5].start_time = 28.65;

function init_time_and_stretch() {
	for (var i=0; i<P.length; i++) {
		P[i].time = P[i].start_time;
		P[i].stretch = P[i].default_bpm / BPM_REF;
	}
}

function set_bpm_ref(newBPMRef) {
	BPM_REF = newBPMRef;
	for (var i=0; i<P.length; i++) {
		P[i].stretch = P[i].default_bpm / BPM_REF;
	}
}