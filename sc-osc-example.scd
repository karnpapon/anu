// [1]
(
MIDIClient.init;
// s.options.outDevice = "Scarlett 2i4 USB";
s.options.outDevice ="MacBook Pro Speakers";
s.options.numInputBusChannels = 0;
s.boot;

s.waitForBoot{
	n = NanoKontrol();  // https://github.com/karnpapon/NanoKontrol
}
)

// [2]: for using in \demo_corpus
~sampler_engine = MyLivePerformanceTool("/Users/karnpaponboonput/Desktop/samples/soundpharm/FoleyPerc - Loops/");
~sampler_engine.loadPreProcessedData("/Users/karnpaponboonput/Desktop/live-perf-data");


// [3]: setup faders/sliders
// should add it to ServerTree ?
// so it can survive after `Cmd+Period`
(
if(c.notNil){
	(c.faders.size).do{|fader,i| c.faders[i].free};
	(c.knobs.size).do{|knob,i| c.knobs[i].free};
};

n.faders.do{|fader, i |
	fader.onChange = {|fadervalue|
		c.faders.at(i).set(fadervalue/127);
	}
};

n.knobs.do{|knob, i |
	knob.onChange = {|knobvalue|
		c.knobs.at(i).set(knobvalue/127);
	}
};

c = ();  // controlBusses
c.faders = Array.fill(9,{Bus.control(s,1).set(0.0)});
c.knobs = Array.fill(9, {Bus.control(s,1).set(0.25)});
)


// [4]: setup SynthDef
(
SynthDef(\drm, {|out, pew=1, sustain=1, pan, fed=0, tun|
	var env, sound, freq;
	tun = ((tun>0)*tun) + ((tun<1)*3);
	freq = (tun*10).midicps;
	env = EnvGen.ar(Env.linen(0.01, 0, 1, 1, -3), timeScale:sustain, doneAction:2);
	sound = LPF.ar(SinOscFB.ar(XLine.ar(freq.expexp(10, 2000, 1000, 8000), freq, 0.025/pew), fed), 9000);
	OffsetOut.ar(out, CleanPan.ar(sound, 2, pan, env))
}).add;

// testing sound
SynthDef(\metro, {
	var sig = SinOsc.ar(330,0);
	var env = EnvGen.kr(Env.perc(0.01, 0.125, 1, -4), doneAction: 2);
	sig = sig * env;
	Out.ar(0, sig!2);
}).add
)

// [5]: setup mixer (ddwMixerChannel: https://github.com/supercollider-quarks/ddwMixerChannel)
(
~srcMixerChannel = MixerChannel(\src, s, 2, 2, 1);
~src2MixerChannel = MixerChannel(\src2, s, 2, 2, 1);
~reverbMixerChannel = MixerChannel(\rvb, s, 2, 2, level: 1,
	completionFunc: { |chan|
		~rvb = chan.playfx { |outbus|
			var sig = In.ar(outbus, 2);
			FreeVerb2.ar(sig[0], sig[1], mix: 1, room: 0.8, damp: 0.2);
		}
	}
); // reverb is being add here

~delayMixerChannel = MixerChannel(\cld, s, 2, 2, level: 1,
	completionFunc: { |chan|
		~del = chan.playfx {|outbus,maxdelaytime=0.25,decaytime=4|
 Mix.arFill(4, { CombL.ar(In.ar(outbus, 1), maxdelaytime, LFNoise1.kr(Rand(0, 0.1), 0.1, 0.2), decaytime) })
		};
	}
); // delay is being add here
)

// [5.5]: correct group order after `Cmd+Period`
(
~reverbMixerChannel.fadergroup.moveToTail(s.defaultGroup);
~delayMixerChannel.fadergroup.moveToTail(s.defaultGroup);
)

(
~srcMixerChannel.free;
~src2MixerChannel.free;
~reverbMixerChannel.free;
~delayMixerChannel.free;
)

// [6]: setup fx chains;
(
~shaper = ~srcMixerChannel.playfx({ |outbus,in, shape = 0.5, amp = 1.0,  amp_compensation_amount = 0.99, lo = 1, hi = 0.5, offset = 0, lo_thresh = 0.5, hi_thresh = 0.5|
	var abs, diff, numChannels = 2;
	var sig = In.ar(outbus, numChannels);
	shape = min(shape, 1.0 - 4e-10).explin(0.001, 1, 0.0, 0.999999);
	amp_compensation_amount = amp_compensation_amount.linlin(0.0,1.0,0.0001,1.0);
	amp = 1.0 - (amp_compensation_amount * shape / (shape +amp_compensation_amount )) * amp;
	shape = (1.0 * shape) / (1.0 - shape);
	sig = (1 + shape) * sig / (1 + (shape * abs(sig)));
	offset = offset.linlin(0.0,1.0,1.0,5.0);
	hi = hi * offset; lo = lo * offset;
	abs = hi - lo;
	lo_thresh = lo_thresh.linlin(0.0,1.0,-1.0,1.0);
	lo = lo + (abs * lo_thresh);
	hi_thresh = hi_thresh.linlin(0.0,1.0,-1.0,1.0);
	hi = hi - (abs * hi_thresh);
	sig = Fold.ar(sig, lo, hi);
	diff = 1 - (lo - hi + (hi * lo));
	Limiter.ar(LeakDC.ar(sig * (amp+diff)));
});

~dist = ~srcMixerChannel.playfx({ |outbus, dst = 0|
	var sig, mod;
	sig = In.ar(outbus, 2);
	mod = CrossoverDistortion.ar(sig, amp: 0.2, smooth: 0.01);
	mod = mod + (0.1 * dst * DynKlank.ar(`[[60,61,240,3000 + SinOsc.ar(62,mul: 100)],nil,[0.1, 0.1, 0.05, 0.01]], sig));
	mod = (mod.cubed * 8).softclip * 0.5;
	mod = SelectX.ar(dst, [sig, mod]);
});

~triode = ~srcMixerChannel.playfx({
	|outbus,in, tri=1.0|
	var sig, sc;
	sig = In.ar(outbus,2);
	sc = tri * 10 + 0.001;
	sig = (sig * (sig > 0)) + (tanh(sig * sc) / sc * (sig < 0));
	LeakDC.ar(sig);
});

~lpf = ~srcMixerChannel.playfx({
	|outbus,in, cutoff = 0.5, resonance = 0|
	var numChannels = 2;
	var sig = In.ar(outbus, numChannels);
	var cutoffClipped = cutoff.linexp(0.0, 1.0, 40, 20000);
	sig = RLPF.ar(sig, cutoffClipped, resonance.linexp(0, 1, 1, 0.001));
});
)

// [7]: send to reverb
// this will create new instance and push to nodeTree every evaluation.
// so, better run once (or don't forget to cleanup first).
~postsend = ~srcMixerChannel.newPostSend(~reverbMixerChannel, 0.9);
~postsend.free

// ~postsend2 = ~src2MixerChannel.newPostSend(~reverbMixerChannel, 0.9);
~postsend2 = ~src2MixerChannel.newPostSend(~delayMixerChannel, 0.9);


// [8]: map Korg NanoKontrol (faders/slides)
(
~srcMixerChannel.synth.set(\level, c.faders.at(0).asMap); // fader[0] -> src level [\demo_kick]
~src2MixerChannel.synth.set(\level, c.faders.at(1).asMap); // fader[1] -> src2 level [\demo_corpus]
~lpf.set(\cutoff, c.knobs.at(8).asMap); // knob[8] -> cutoff level
~postsend.sendSynth.set(\level, c.knobs.at(0).asMap); // knob[1] -> sendLevel
~postsend2.sendSynth.set(\level, c.knobs.at(1).asMap); // knob[1] -> sendLevel
~postsend2.sendSynth.set(\level, c.faders.at(2).asMap); // fader[2] -> sendLevel
~dist.set(\dst, c.knobs.at(2).asMap); // knob[2] -> distortion level
~triode.set(\tri, c.knobs.at(3).asMap); // knob[3] -> triode level
~shaper.set(\offset, c.knobs.at(4).asMap); // knob[4] -> shaper::shape level
~shaper.set(\lo, c.knobs.at(5).asMap); // knob[5] -> shaper::lo level
~shaper.set(\hi, c.knobs.at(6).asMap); // knob[6] -> shaper::hi level
~shaper.set(\lo_thresh, c.knobs.at(7).asMap); // knob[7] -> shaper::lo_thresh level
// ~shaper.set(\hi_thresh, c.knobs.at(8).asMap); // knob[8] -> shaper::hi_thresh level
)
s.meter
s.plotTree
// for testing
(
~srcMixerChannel.play(
	(
		Pbind(*[
			instrument: \drm,
			dur: 1 / Pwrand([5, 10], [3, 8].normalizeSum, 64*4),
			tun: Pdup(Pexprand(1, 8), Pexprand(0.0001, 0.25)),
			fed: Pexprand(0.00001, 2000.0),
			amp: Pdup(Pexprand(1, 5), Pexprand(0.75, 2.0)),
			rel: Pexprand(Pkey(\dur) / (4/3), Pkey(\dur) * 64),
			pan: Pdup(Pexprand(1, 7), Pseq([0.5, 0.75, 1.0, 0.75, 0.5, 0.25, 0.0, 0.25], inf)),
			legato: Pwrand([Pkey(\dur) * 1.5, Pkey(\dur) * 16], [1, 2].normalizeSum, inf),
			sustain: Pdup(Pexprand(1, 3), Pexprand(0.1, 2.0)),
		])
	);
)
)


~cld.set(\freeze, 0)
~cld.set(\freeze, 1)
(~src2MixerChannel.play({ |indices, index, src|
	{
		var startsamp = Index.kr(indices,index);
		var stopsamp =  Index.kr(indices,index+1);
		var phs = Phasor.ar(0,BufRateScale.ir(src),startsamp,stopsamp);
		var sig = BufRd.ar(1,src,phs);
		var dursecs = (stopsamp - startsamp) / BufSampleRate.ir(src);
		var env;
		dursecs = min(dursecs,1);
		env = EnvGen.kr(Env([0,1,1,0],[0.03,dursecs-0.06,0.03]),doneAction:2);
		sig = sig.dup * env;
	}
}, args: [
	\src, ~sampler_engine.get_src,
	\indices, ~sampler_engine.get_indices,
	\index, ~sampler_engine.get_indices.numFrames.rand
])
)

// [9]: connect to anu_processing (https://github.com/karnpapon/anu-processing)
(
~processing = NetAddr("127.0.0.1", 5000);
// ~anu = NetAddr("127.0.0.1", 3400); // anu "send_from" port (default 3400)
)

// [10]: init osc definitions.
(
OSCdef(\anu_demo_kick, {
	|msg, time, addr, recvPort|
	(
		~srcMixerChannel.play(
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
				])
			);
		);
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

OSCdef(\anu_demo_corpus, {|msg, time, addr, recvPort|
	(~src2MixerChannel.play({ |indices, index, src|
		{
			var startsamp = Index.kr(indices,index);
			var stopsamp =  Index.kr(indices,index+1);
			var phs = Phasor.ar(0,BufRateScale.ir(src),startsamp,stopsamp);
			var sig = BufRd.ar(1,src,phs);
			var dursecs = (stopsamp - startsamp) / BufSampleRate.ir(src);
			var env;
			dursecs = min(dursecs,1);
			env = EnvGen.kr(Env([0,1,1,0],[0.03,dursecs-0.06,0.03]),doneAction:2);
			sig = sig.dup * env;
		}
	}, args: [
		\src, ~sampler_engine.get_src,
		\indices, ~sampler_engine.get_indices,
		\index, ~sampler_engine.get_indices.numFrames.rand
	])
	)
},'/demo_corpus');

OSCdef(\anu_demo_ss, {|msg, time, addr, recvPort|
	(Synth(\metro));
},'/demo_ss');
)

