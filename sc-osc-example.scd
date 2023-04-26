// [1]?
(
b = BufFolders(s, "/Users/karnpaponboonput/Desktop/unorganised-music-master");
b.size;
b[\sounds];
b[\root]; // Contains all of the audio files at the root level
)

// [2]
~sampler_engine = MyLivePerformanceTool("/Users/karnpaponboonput/Desktop/samples/soundpharm/FoleyPerc - Loops/");
~sampler_engine.loadPreProcessedData("/Users/karnpaponboonput/Desktop/live-perf-data");

(
// [3]
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

SynthDef(\triode, {
	|out,in, tri=1.0|
	var sig, sc;
	sig = In.ar(in,2);
	sc = tri * 10 + 0.001;
	sig = (sig * (sig > 0)) + (tanh(sig * sc) / sc * (sig < 0));
	ReplaceOut.ar(out, LeakDC.ar(sig));
}).add;

SynthDef(\lpf, {
	|out,in, cutoff = 440, resonance = 0|
	var numChannels = 2;
	var signal = In.ar(in, numChannels);
	var cutoffClipped = cutoff.abs.clip(20, 20000);
	signal = RLPF.ar(signal, cutoffClipped, resonance.linexp(0, 1, 1, 0.001));
	ReplaceOut.ar(out, signal)
}).add;
);

(
~source_group = Group.new;
~fx_group = Group.new(~source_group, \addAfter);
s.newBusAllocators;
~bus_shaper = Bus.audio(s,2);
~bus_dist = Bus.audio(s,2);
~bus_tiode = Bus.audio(s,2);
~bus_lpf = Bus.audio(s,2);
// ~shaper = { p = Synth(\shaper, [\in: ~bus_shaper.index,\out: 0],~fx_group)};
// ~dist = {d = Synth(\distortion, [\in: ~bus_dist.index, \out: ~bus_lpf.index], ~fx_group, \addToTail)};
// ~lpf = {l = Synth(\lpf, [\in: ~bus_lpf.index, \out: 0], ~fx_group, \addToTail)};
// ~triode = {Synth(\triode, [\in: ~bus_dist.index, \out: 0], Server.default, \addToTail)};
// ServerTree.add(~shaper);
// ServerTree.add(~dist);
// ServerTree.add(~lpf);
// ServerTree.add(~triode);

p = Synth(\shaper, [\in: ~bus_shaper.index,\out: ~bus_dist.index],~fx_group);
d = Synth(\distortion, [\in: ~bus_dist.index, \out: ~bus_tiode.index], ~fx_group, \addToTail);
t = Synth(\triode, [\in: ~bus_tiode.index, \out: ~bus_lpf], ~fx_group, \addToTail);
l = Synth(\lpf, [\in: ~bus_lpf.index, \out: 0], ~fx_group, \addToTail);
)

s.plotTree
s.queryAllNodes

ServerTree.remove(~dist);

d.set(\dst, 0)
t.set(\tri, 0);

(
l.set(\cutoff, 4000);
p.set(
	\shape, 0.5,
	\amp_compensation_amount, 0.5,
	\lo_thresh, 0.2,
	\hi_thresh, 0.1,
	\lo, 1,
	\hi, 0.5
);
)



/*(
~drm = Pbind(*[
instrument: \drm,
dur: 1 / Pwrand([5, 10], [3, 8].normalizeSum, inf),
tun: Pdup(Pexprand(1, 8), Pexprand(0.0001, 0.25)),
fed: Pexprand(0.00001, 2000.0),
amp: Pdup(Pexprand(1, 5), Pexprand(0.75, 2.0)),
rel: Pexprand(Pkey(\dur) / (4/3), Pkey(\dur) * 64),
pan: Pdup(Pexprand(1, 7), Pseq([0.5, 0.75, 1.0, 0.75, 0.5, 0.25, 0.0, 0.25], inf)),
legato: Pwrand([Pkey(\dur) * 1.5, Pkey(\dur) * 16], [1, 2].normalizeSum, inf),
sustain: Pdup(Pexprand(1, 3), Pexprand(0.1, 2.0)),
out: ~bus_shaper,
// group: ~source_group
// tri: Pwhite(0.0, 1.0),
]).play
)*/

// Synth("sine")

/*(
// send a synth def to server
SynthDef("sine", { arg out = 0,freq = 440;
	var sig = SinOsc.ar(freq, 0, 0.5);
	var env = EnvGen.kr(Env.perc(0.01,0.1), doneAction: 2);
    Out.ar(out, sig * env);
}).add;
)*/

/*i = Synth(\default, [\out, ~bus_shaper]);
i.free
i.inspect
~drm.stop;
~source_group.free*/

(
~processing = NetAddr("127.0.0.1", 5000);
// ~anu = NetAddr("127.0.0.1", 3400); // anu "send_from" port (default 3400)
)


(
OSCdef(\test_sine, {
	Synth("sine")
}, \test_metro)
)

(
OSCdef(\anu_demo_sampler, {
	|msg, time, addr, recvPort|
	// msg.postln;
	(Pbind(
		\instrument, \polybuf_sampler,
		\rate, Pwhite(0.5,1.0),
		\buffer, Pseq([ b[\sounds].asPxrand(1)],1),
		\dur, Pfunc{|ev| ev[\buffer].duration * ev[\rate].abs.reciprocal}
	).play;);
}, '/demo_sampler');

OSCdef(\anu_demo_kick, {
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
			legato: Pwrand([Pkey(\dur) * 1.5, Pkey(\dur) * 16], [1, 2].normalizeSum, inf),
			sustain: Pdup(Pexprand(1, 3), Pexprand(0.1, 2.0)),
			out: ~bus_shaper,
			group: ~source_group
			// tri: Pwhite(0.0, 1.0),
		]).play
	);

	if(msg[1] == \dense){
		var ss = ["cubeGrid","maze","texts","lines"].choose;
		ss.postln;
		~processing.sendMsg("/proc_osc",0.0,1.0.rand,ss,
			msg[2] ?? { 0.1 }.value,1.0.rand,1.0.rand,1.0.rand,1.0.rand,1.0.rand,1.0,1.0,1.0);
	};

	if(msg[1] == \medium){
		var ss = ["maze","lines", "texts"].choose;
		~processing.sendMsg("/proc_osc",0.0,1.0.rand,ss,
			msg[2] ?? { 0.1 }.value,1.0.rand,1.0.rand,1.0.rand,1.0.rand,1.0.rand,1.0,1.0,1.0);
	};

	if(msg[1] == \all_texts){
		var ss = ["texts","texts2", "texts3", "texts4"].choose;
		~processing.sendMsg("/proc_osc",0.0,1.0.rand,ss,
			msg[2] ?? { 0.8 }.value,1.0.rand,1.0.rand,1.0.rand,1.0.rand,0.8,1.0,1.0,1.0);
	};

	if(msg[1].isSymbol && ( (msg[1] !== \dense) && (msg[1] !== \medium) && (msg[1] !== \all_texts)) ){
		~processing.sendMsg("/proc_osc",0.0,1.0.rand,msg[1].asString,
			msg[2] ?? { 0.8 }.value,1.0.rand,1.0.rand,1.0.rand,1.0.rand,1.0.rand,1.0,1.0,1.0);
	};

}, '/demo_kick');

OSCdef(\anu_demo_trigger, {|msg, time, addr, recvPort|
	~sampler_engine.play_slice(~sampler_engine.indices.rand, ~bus_shaper);
},'/demo_corpus');
)

