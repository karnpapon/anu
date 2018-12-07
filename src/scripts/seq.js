function Sequencer(){

  this.row = 32
  this.step = 16*3

  this.build = function(){
    let grid = document.getElementById("gridseq")
    grid.innerHTML = ""

    for( let i = 0; i < this.row; i++){
      let tr_el = document.createElement("tr")
      for( let y = 0; y <  this.step; y++){
        let td_el = document.createElement("td")
        td_el.textContent = "-"
        tr_el.appendChild(td_el)
      }
      grid.appendChild(tr_el)
    }
  }
}