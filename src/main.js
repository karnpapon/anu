const seeq = new Seeq();
const canvas = new Canvas();

seeq.build();
canvas.install(seeq.content.el)

window.addEventListener('load', () => { 
  canvas.start(); 
  const { TauriEvent, listen } = window.__TAURI__.event;
  
  listen( "menu-osc", function (msg) {
      console.log("listen::menu-osc", msg)
      seeq.console.togglePort('OSC', seeq.console)
      seeq.console.oscInfo.innerText = seeq.console.isOSCToggled ? `PORT:${seeq.io.osc.port}` : "--"
    },
  );
  listen( "menu-rev", function (msg) {
    console.log("listen::menu-rev", msg)
    seeq.console.togglePort('REV', seeq.console)
  })

  listen( "menu-focus", function (msg) {
    console.log("listen::menu-focus", msg)
    seeq.console.togglePort('FOCUS', seeq.console)
    canvas.toggleShowMarks()
  });
})
