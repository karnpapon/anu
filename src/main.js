const seeq = new Seeq();
const canvas = new Canvas();
const metronome = new Metronome(canvas);

seeq.build();
canvas.install(seeq.content.el);

window.addEventListener("load", () => {
  canvas.init();
  metronome.init();
  const { listen } = window.__TAURI__.event;

  listen("menu-osc", function (msg) {
    console.log("listen::menu-osc");
    seeq.console.togglePort("OSC", seeq.console);
    seeq.console.oscInfo.innerText = seeq.console.isOSCToggled
      ? `PORT:${canvas.io.osc.port}`
      : "--";
  });
  listen("menu-rev", function (msg) {
    console.log("listen::menu-rev");
    seeq.console.togglePort("REV", seeq.console);
  });

  listen("menu-focus", function (msg) {
    console.log("listen::menu-focus");
    seeq.console.togglePort("FOCUS", seeq.console);
    canvas.toggleShowMarks();
  });

  listen("menu-metronome", function (msg) {
    console.log("listen::menu-metronome");
    seeq.enableMetronome = !seeq.enableMetronome
  });
});
