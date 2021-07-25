const seeq = new Seeq();
const canvas = new Canvas();
// window.canvas = canvas // global availability for e.g. udp
// window.seeq = seeq // global availability for e.g. udp

seeq.start();
canvas.install(seeq.content.el)

window.addEventListener('load', () => { 
  canvas.start(); 
})