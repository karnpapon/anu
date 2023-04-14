/* global client, canvas */

function Client(){
  
  const el = tag => document.createElement(tag);
  this.content = new Content(this)
  this.console = new Console(this)
  this.displayer = new Displayer(this)
  this._regexSolver = new RegexSolver();

  // ------------------------------------

  // DOM installation.
  this.el = el("app");
  this.el.style.opacity = 0;
  this.el.id = "client";
  this.el.setAttribute("data-tauri-drag-region", "")
  this.wrapper_el = el("div")
  this.wrapper_el.className = "wrapper-control"
  this.el.appendChild(this.wrapper_el)
  this.parentTarget = document.getElementsByClassName("wrapper-control")
  this.infoDisplay
  document.body.appendChild(this.el);

  // ------------------------------------

  // Ajax.
  this.url = "https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&prop=extracts&exintro&explaintext&redirects=1&titles="
  this.urlEnd = "&redirects=1"
  this.isGettingData = false
  this.enableMetronome = false

  // -----------------------------------

  // Marker.
  // this.matchedPosition = []

  // -----------------------------------

  this.build = function(){
    this.console.build()
    this.displayer.build()
    this.content.build()
    setTimeout(client.show,400)
  }

  this.show = function () {
    client.el.style.opacity = 1;
  }

  this.fetch = function(){
    this.startFetch()
  }

  this.trimmedContents = function(txt){
    let dataText = txt
    let limitedChar = canvas.seequencer.w * canvas.seequencer.h
    let trimmedText = dataText.substring(0, limitedChar)
    return trimmedText
  }

  this._change = () => {
    let searchFrom = canvas.texts
    let textContent = this.trimmedContents(searchFrom)
		// this.dispatchEvent("change");
    if (searchFrom == "") { canvas.clearMarksPos() }
    let exp = { pattern: this.console.regexInput, flags: "g" };
		let o = {pattern:exp.pattern, flags:exp.flags, text: textContent};
		this._regexSolver.solve(o, (result) => client._handleResult(result));
	}

  this._handleResult = (result) => {
    this.result = this._processResult(result);
    this.console.regexErrorElem.innerText = this.result.error ?  `[${this.result.error.name}]: invalid syntax` :  ""
    if (this.result.matches) {
      canvas.clearMarksPos()
      this.result.matches.forEach(match => {
        canvas.p.push(canvas.seequencer.posAt(match.i))
      })
    } else {
      canvas.clearMarksPos()
    }
		// this.dispatchEvent("result");
	}

	this._processResult = function(result) {
    result.matches && result.matches.forEach((o, i)=>o.num=i);
		return result;
	}

  // this.getMatchedPosition = function(){
  //   let searchFrom = canvas.texts
  //   let trimmed = this.trimmedContents(searchFrom)
  //   let re
  //   let match, query

  //   query = this.console.regexInput
  //   // target = query.replace(/[)(]/g, "\\$&");
  //   if(query){
  //     try{ 
  //       re = new RegExp(query, "g")  //TODO: make this configurable.

  //       if(re){
  //         canvas.p = []
  //         this.matchedPosition = []
  //         if (query !== ""){
  //           while( (match = re.exec(trimmed)) != null){
  //             console.log("match", match.length)
  //             this.matchedPosition.push({
  //               index: match.index, 
  //               len: match.length == 2? match[0].length:0 
  //             })
  //           } 
  //         }
      
  //         if(this.matchedPosition){
  //           this.matchedPosition.forEach(pos => {
  //             if (pos.len > 0) {
  //               let len = 0
  //               for (var i = 0; i < pos.len; i++) {
  //                 canvas.p.push(canvas.seequencer.posAt(pos.index + len))
  //                 len++
  //               }
  //             } else {
  //               canvas.p.push(canvas.seequencer.posAt(pos.index))
  //             }
  //           })
  //         }
  //       } else {
  //         canvas.clearMarksPos()
  //       }

  //     } catch(e) { 
  //       console.log("invalid regular expression")
  //     }
  //   }    
  // }

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
    
    client.content.loading.classList.add("loading")

    axios({
      method: "get",
      url: client.url + client.console.fetchSearchInput,
      responseType: "json",
    })
    .then((resp) => {
      var { pages } = resp.data.query
      Object.keys(pages).map((field) => {
        data = pages[field]
      })
      if(data){
        res = data.extract
        client.repaint(res)
        client.console.setTotalLenghtCounterDisplay()
        client.isGettingData = false
        client.content.loading.classList.remove("loading")

        canvas.clearMarksPos()
        canvas.globalIdx = 0 
        canvas.marker.reset()
        canvas.stepcounter.reset()
        canvas.stepcursor.reset()
      }
    })
    .catch((error) => {
      res = `${error}, please try again..`
      client.isGettingData = false
      client.content.loading.classList.remove("loading")
      client.repaint(res)
    });
  }

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
      conversion = 'f' //fallback.
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