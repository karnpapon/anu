function Seeq(){
  
  // components installation.
  const Content = require('./content')
  const Sequencer = require('./sequencer')
  const Console = require('./console')
  const Displayer = require('./displayer')
  const Clock = require('./clock')
  const IO = require('./io')
  const Keys = require('./keys')
  const Metronome = require('./metronome')
  const { $, el, qs, scale, isChar, clamp } = require('./lib/utils')

  this.content = new Content(this)
  this.io = new IO(this)
  this.seq = new Sequencer(this)
  this.keys = new Keys(this)
  this.masterClock = [new Clock(120)] 
  this.metronome = new Metronome(this)
  this.console = new Console(this)
  this.displayer = new Displayer(this)
  this.selectedClock = 0

  // ------------------------------------

  // DOM installation.
  // this.logoSeeq
  this.appWrapper = el("appwrapper")
  this.el = el("app");
  this.el.style.opacity = 0;
  this.el.id = "seeq";
  this.appWrapper.appendChild(this.el)
  this.wrapper_el = el("div")
  this.wrapper_el.className = "wrapper-control"
  this.el.appendChild(this.wrapper_el)
  this.parentTarget = document.getElementsByClassName("wrapper-control")
  this.infoDisplay
  document.body.appendChild(this.appWrapper);

  // ------------------------------------

  // Ajax Request Initialize.
  this.url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles="
  this.urlEnd = "&redirects=1"

  // Ajax Status.
  this.isGettingData = false

  // -----------------------------------

  // text buffers.
  this.switchText = ""
  this.notation = ""

  // -----------------------------------

  // Cursor.
  this.matchedPosition = []

  // this.cursor = [{
  //   position: 0,
  //   isCursorOffsetReverse: false,
  //   isMuted: false,
  //   isRetrigger: false,
  //   up: 0,
  //   down: 0,
  //   note: [],
  //   notelength: [],
  //   velocity: [],
  //   octave: [],
  //   counter: 0,
  //   channel: "",
  //   reverse: false,
  //   UDP: ["D3C"],
  //   OSC: {
  //     path: "play2",
  //     msg: "s [dr] n [22,11,4,5,6,12]"
  //   }
  // }]

  // this.triggerCursor = {
  //   note: [],
  //   notelength: "",
  //   velocity: "",
  //   octave: "",
  //   channel: "",
  //   counter: 0,
  //   UDP: ["73C"]
  // }

  // -----------------------------------

  this.start = function(){
    this.console.build()
    this.displayer.build()
    this.content.build()
    this.metronome.init()
    this.console.toggleInsert()
    this.io.start()
    setTimeout(seeq.show,200)
  }

  this.show = function () {
    seeq.el.style.opacity = 1;
  }

  this.clear = function(){
    this.isPlaying = false
    this.seq.stop()
    // this.data.hltr.removeHighlights();
    // this.content.unmark()
    this.fetchWithoutDisconnect()
  }

  this.nudge = function(){
    this.isPlaying = false
    this.seq.nudged()
  }

  this.fetchWithoutDisconnect = function(){
    this.startFetch()
  }

  this.fetch = function(){
    this.startFetch()

    // disconnect at initial state (`linkBtn` is not actived).
    // to handle clock freely, 
    // otherwise it'll manage to adjust clock to Ableton clock.
    // ( clock will keeping reset to the default, 120 BPM).
    socket.disconnect(0)
    // this.setCursor(this.cursor[0], 0)
    this.play()
    this.metronome.play()
  }

  this.sendOSC = function(osc){
    let osc_input
    seeq.keys.infoInputConfig.innerHTML = `
      <div class="operator-group info"> 
        <lf class="info-header">OSC |</lf> 
        <form id="info-osc" class="info-input">
          <lf> 
            <p>MSG:</p>
            <input id="addosc" class="input-osc" type="text" value=${JSON.stringify( osc.msg )}>
          </lf>
        </form>
      </div> 
      <button type="submit" value="Submit" form="info-osc" class="send-osc">send</button>
    ` 

    addOsc = $('addosc')
    addOsc.addEventListener("input", function (e) { osc_input = this.value })

    qs('form.info-input').addEventListener('submit', function (e) {
      e.preventDefault(); 
      osc.msg = osc_input
    })
  }

  this.setOutputMsg = function(outputMsg){
    let addNote, addLength, addVelocity, addChannel,
    note = outputMsg.note? outputMsg.note:"",
    octave = outputMsg.octave? outputMsg.octave:"",
    length = outputMsg.notelength? outputMsg.notelength:"",
    velocity = outputMsg.velocity? outputMsg.velocity:"",
    ch = outputMsg.channel? outputMsg.channel:""

    var noteWithOct = [];
    
    for (var i = 0; i < note.length; i++) {
      noteWithOct.push(`${ note[i] }${ octave[i]}`)
    }

    let notes = noteWithOct.join()
    let lengths = length.join()
    let velocities = velocity.join()

    seeq.keys.infoInputConfig.innerHTML = `
      <div class="operator-group info"> 
        <lf class="info-header">MIDI |</lf> 
        <form id="info" class="info-input">
          <lf> 
            <p>NTE:</p>
            <input id="addnote" class="input-note" type="text" value=${notes}>
          </lf>
          <lf> 
            <p>LEN:</p>
            <input id="addlength" class="input-note" type="text" value=${lengths}>
          </lf>
          <lf> 
            <p>VEL:</p>
            <input id="addvelocity" class="input-note" type="text" value=${velocities}>
          </lf>
          <lf> 
            <p>CHN:</p>
            <input id="addchannel" class="input-note" type="text" value=${ch}>
          </lf>
        </form>
      </div> 
      <button type="submit" value="Submit" form="info" class="send-midi">send</button>
    `
    addNote = $('addnote')
    addLength = $('addlength')
    addVelocity = $('addvelocity')
    addChannel = $('addchannel')
    
    addNote.addEventListener("input", function (e) { notes = this.value })
    addLength.addEventListener("input", function (e) { lengths = this.value })
    addVelocity.addEventListener("input", function (e) { velocities = this.value })
    addChannel.addEventListener("input", function(e){ ch = this.value })

    qs('form.info-input').addEventListener('submit', function (e) {

      e.preventDefault();

      // -----------------------------------------------
      // data transformation section--------------------

      let noteAndOct = [], len = [], vel = []

      noteAndOct = seeq.parser(notes, 'note')
      len = seeq.parser(lengths, 'length')
      vel = seeq.parser(velocities, 'velocity') 

      let noteOnly = []
      let octOnly = []

      noteAndOct.forEach(item => {
        noteOnly.push(item[0])
        octOnly.push(parseInt( item[1] ))
      })

      // -----------------------------------------------
      // MIDI section-----------------------------------

      outputMsg.note = noteOnly
      outputMsg.octave = octOnly
      outputMsg.notelength = len 
      outputMsg.velocity = vel
      outputMsg.channel = ch

      // -----------------------------------------------
      // UDP section------------------------------------

      let convertedChan = seeq.getUdpValue(parseInt(ch))

      let udpNote = []
      let udpLength = []
      let udpVelocity = []
      outputMsg.UDP = [] //clear first.

      for (var i = 0; i < noteOnly.length; i++) {
        udpLength.push(seeq.getUdpValue(parseInt(len[i])))
        udpNote.push(seeq.getUdpNote(noteOnly[i]))
        udpVelocity.push(seeq.getUDPvalFrom127(parseInt(vel[i])))
      }

      for(var i = 0; i< noteOnly.length; i++){
        outputMsg.UDP.push(`${convertedChan}${octOnly[i]}${udpNote[i]}${udpVelocity[i]}${udpLength[i]}` )
      }

      console.log("UDP msg", outputMsg.UDP)

      // -----------------------------------------------

      seeq.triggerCursor['counter'] = 0
    })

    // return outputMsg
  }

  this.getMatchedPosition = function(){
    var searchFrom = canvas.texts
    let target = this.console.searchValue
    var search = new RegExp(target,"gi")
    var match
    canvas.p = []

    this.matchedPosition = []
    
    if (target !== ""){
      while( match = search.exec(searchFrom)){
        this.matchedPosition.push({
          index: match.index, 
          len: match.length == 2? match[0].length:0 
        })
      } 
    }

    if(this.matchedPosition){
      this.matchedPosition.forEach(pos => {
        if (pos.len > 0) {
          let len = 0
          for (var i = 0; i < pos.len; i++) {
            canvas.p.push(canvas.seequencer.posAt(pos.index + len))
            len++
          }
        } else {
          canvas.p.push(canvas.seequencer.posAt(pos.index))
        }
      })
    }
  }

  this.startFetch = function(){
    this.getData()
  }

  this.repaint = function(res){
    canvas.reset()
    canvas.writeData(res)
    canvas.clock.reset()
    canvas.update()
  }

  this.getData = function() {
    var data = ""
    var res = ""
    
    seeq.content.loading.classList.add("loading")

    axios({
      method: "get",
      url: seeq.url + seeq.console.fetchSearchInput + seeq.urlEnd,
      responseType: "json"
    })
    .then((resp) => {
      var { pages } = resp.data.query
      Object.keys(pages).map((field) => {
        data = pages[field]
      })
      if(data){
        res = data.extract
        seeq.repaint(res)
        seeq.console.setTotalLenghtCounterDisplay()
        seeq.isGettingData = false
        seeq.content.loading.classList.remove("loading")
      }
    })
    .catch((error) => {
      res = `sorry ${error}, please try again..`
      seeq.isGettingData = false
      seeq.content.loading.classList.remove("loading")
      seeq.repaint(res)
    });
  }

  // this.textBaffleFX = function(){
  //   seeq.baffles.reveal(1000);
  // }

  this.splitArrayNoteAndOctave = function(inputText) {
    var output = [];
    var arr = inputText.split(',');
    arr.forEach(function (item) {
        output.push(item.split(/(\d+)/).filter(Boolean));
    });
    return output;
  }

  this.splitSingleNoteAndOctave = function(note){
    var output = []
    output.push(note.split(/(\d+)/).filter(Boolean));
    return output
  }

  this.parser = function( item, type ){
    let res = []
    if(type == 'note'){
      if (item.indexOf(',') > -1) { 
        res = this.splitArrayNoteAndOctave(item)
      } else {
        res = this.splitSingleNoteAndOctave(item)
      }
    } else {
      if (item.indexOf(',') > -1) { 
        res = item.split(',')
      } else {
        res.push(item)
      }
    }

    return res
  }

  this.retrieveInfoDisplay = function(){
    return `<div class="textfx">seeq | livecoding environtment </div>`
  }

  this.clock = function () {
    return this.masterClock[this.selectedClock]
  }

  this.setSpeed = function (bpm) {
    if (this.clock().canSetBpm()) {
      bpm = clamp(bpm, 60, 300)
      this.clock().setBpm(bpm)
    }
  }

  this.modSpeed = function (mod = 0) {
    let bpm = this.clock()
    if (this.clock().canSetBpm()) {
      this.setSpeed(this.clock().getBpm() + mod)
    }
    seeq.seq.setBPMdisplay(bpm) 
  }

  this.getUdpNote = function(note){
    let udpNote
    if (note.length == 2) {
      switch (note) {
        case 'Db':
          udpNote = 'c'
          break;
        case 'Eb':
          udpNote = 'F'
          break;
        case 'Gb':
          udpNote = 'f'
          break;
        case 'Ab':
          udpNote = 'g'
          break;
        case 'Bb':
          udpNote = 'a'
          break;
      }
    } else if (note.length == 1) {
      udpNote = note
    }
    return udpNote
  }

  this.getUdpValue = function(val){
    let conversion, mapRange
    if (val > 9 && val < 17){
      mapRange = val - 10 
      conversion = String.fromCharCode(65 + mapRange ); 
    } else if ( val < 9 && val > (-1) ) {
      conversion = val
    } else {
      conversion = 'D' //fallback.
    }
    return conversion
  }

  this.getUDPvalFrom127 = function(val){
    let limit = 36
    let mapTo36 = Math.floor( scale(val, 0,127,0, limit - 1) )
    let mapToCharRange, temp, itobase36
    if(mapTo36 > 9 && mapTo36 < limit){
      mapToCharRange = mapTo36 - 10
      temp = String.fromCharCode(65 + mapToCharRange );

      // limit to only Char range 
      // range from 37 ~ 131 = A - Z.
      itobase36 = isChar(temp)? temp : mapTo36
    } else if ( mapTo36 < 9) {
      itobase36 = mapTo36
    } else {
      itobase36 = 'D' //fallback.
    }
    return itobase36
  }
}

module.exports = Seeq