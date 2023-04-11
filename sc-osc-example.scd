// setup PolyBuf
(
b = BufFolders(s, "/Users/karnpaponboonput/Desktop/unorganised-music-master");

/*(
b.selectionAction_({|selectedBuffers|
    Pdefn(\polySelected, Pseq(selectedBuffers, inf))
});
);*/

b.size;
b[\sounds]; 
b[\root]; // Contains all of the audio files at the root level
)

(
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
}).add;

SynthDef(\drm, {|out, pew=1, sustain=1, pan, fed=0, tun|
	var env, sound, freq;
	tun = ((tun>0)*tun) + ((tun<1)*3);
	freq = (tun*10).midicps;
	env = EnvGen.ar(Env.linen(0.01, 0, 1, 1, -3), timeScale:sustain, doneAction:2);
	sound = LPF.ar(SinOscFB.ar(XLine.ar(freq.expexp(10, 2000, 1000, 8000), freq, 0.025/pew), fed), 9000);
	OffsetOut.ar(out, CleanPan.ar(sound, 2, pan, env))
}).add;

SynthDef(\shaper, {
	|out,in, shape = 0.5, amp = 1.0,  amp_compensation_amount = 0.99, lo = 1, hi = 0.5, offset = 0, lo_thresh = 0.5, hi_thresh = 0.5|
	var abs, diff, numChannels = 2;
	var signal = In.ar(in, numChannels);
	shape = min(shape, 1.0 - 4e-10).explin(0.001, 1, 0.0, 0.999999);
	amp_compensation_amount = amp_compensation_amount.linlin(0.0,1.0,0.0001,1.0);
	amp = 1.0 - (amp_compensation_amount * shape / (shape +amp_compensation_amount )) * amp;
	shape = (1.0 * shape) / (1.0 - shape);
	signal = (1 + shape) * signal / (1 + (shape * abs(signal)));
	offset = offset.linlin(0.0,1.0,1.0,5.0);
	hi = hi * offset; lo = lo * offset;
	abs = hi - lo;
	lo_thresh = lo_thresh.linlin(0.0,1.0,-1.0,1.0);
	lo = lo + (abs * lo_thresh);
	hi_thresh = hi_thresh.linlin(0.0,1.0,-1.0,1.0);
	hi = hi - (abs * hi_thresh);
	signal = Fold.ar(signal, lo, hi);
	diff = 1 - (lo - hi + (hi * lo));
	ReplaceOut.ar(out, Limiter.ar(LeakDC.ar(signal * (amp+diff))));
}).add;

SynthDef(\distortion, { 
	|out, dst = 0, in|
	var signal, mod;
	signal = In.ar(in, 2);
	mod = CrossoverDistortion.ar(signal, amp: 0.2, smooth: 0.01);
	mod = mod + (0.1 * dst * DynKlank.ar(`[[60,61,240,3000 + SinOsc.ar(62,mul: 100)],nil,[0.1, 0.1, 0.05, 0.01]], signal));
	mod = (mod.cubed * 8).softclip * 0.5;
	mod = SelectX.ar(dst, [signal, mod]);
	Out.ar(out, mod);
}).add;
);

(
s.newBusAllocators;
~bus_shaper = Bus.audio(s,2);
~bus_dist = Bus.audio(s,2);
~shaper = {Synth(\shaper, [\in: ~bus_shaper.index,\out: ~bus_dist.index])};
~dist = {Synth(\distortion, [\in: ~bus_dist.index, \out: 0], Server.default, \addToTail)};
ServerTree.add(~shaper);
ServerTree.add(~dist);
// ServerTree.remove(~shaper);
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

}, '/anumsgsample', ~anu);

OSCdef(\test, {
  |msg, time, addr, recvPort| 
	(
  Pbind(*[
    instrument: \drm,
    dur: 1 / Pwrand([5, 10], [3, 8].normalizeSum, 1),
    tun: Pdup(Pexprand(1, 8), Pexprand(0.0001, 0.25)),
    fed: Pexprand(0.00001, 2000.0),
    amp: Pdup(Pexprand(1, 5), Pexprand(0.75, 2.0)),
    rel: Pexprand(Pkey(\dur) / (4/3), Pkey(\dur) * 64),
    pan: Pdup(Pexprand(1, 7), Pseq([0.5, 0.75, 1.0, 0.75, 0.5, 0.25, 0.0, 0.25], inf)),
    sustain: Pdup(Pexprand(1, 3), Pexprand(0.1, 2.0)),
    out: ~bus_shaper
    // tri: Pwhite(0.0, 1.0),
    // lpf: 20000 - Pexprand(2000, 20000),
  ]).play
  )

}, '/anumsgkick', ~anu);
)