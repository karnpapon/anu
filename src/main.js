const seeq = new Seeq();
const canvas = new Canvas();

seeq.build();
canvas.install(seeq.content.el)

window.addEventListener('load', () => { 
  canvas.start(); 
})