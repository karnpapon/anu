// setup PolyBuf
(
b = BufFolders(s, "/Users/karnpaponboonput/Desktop/unorganised-music-master");

(
b.selectionAction_({|selectedBuffers|
    Pdefn(\polySelected, Pseq(selectedBuffers, inf))
});

// SynthDef
SynthDef(\polybuf_sampler,{|out=0, amp=0.5, buffer, rate=1|
  var sig = PlayBuf.ar(
    numChannels:2, 
    bufnum:buffer, 
    rate:rate * BufRateScale.kr(buffer), 
    trigger:1.0, 
    startPos:0.0, 
    loop:0.0, 
    doneAction:2
  );
  Out.ar(out, sig)
}).add
);

b.size;
b[\sounds]; 
b[\root]; // Contains all of the audio files at the root level
)

// setup osc msg from anu 
(
~anu = NetAddr("127.0.0.1", 3400); // anu "send_from" port (default 3400)
OSCdef(\test, {
  |msg, time, addr, recvPort| 
	// msg.postln;
	(Pbind(
    \instrument, \polybuf_sampler,
	  \rate, Pwhite(0.5,1.0),
	  \buffer, Pseq([ b[\sounds].asPxrand(1)],1), 
	  \dur, Pfunc{|ev| ev[\buffer].duration * ev[\rate].abs.reciprocal}
	).play;);

}, '/anumsg', ~anu);
)