const client = new Client();
const canvas = new Canvas();
const metronome = new Metronome(canvas);

client.build();
canvas.install(client.content.el);

window.addEventListener("load", () => {
  canvas.init();
  metronome.init();
  const { listen } = window.__TAURI__.event;

  listen("menu-osc", function (msg) {
    console.log("listen::menu-osc");
    client.console.togglePort("OSC", client.console);
    client.console.oscInfo.innerText = client.console.isOSCToggled
      ? `PORT:${canvas.io.osc.port}`
      : "--";
  });
  listen("menu-rev", function (msg) {
    console.log("listen::menu-rev");
    client.console.togglePort("REV", client.console);
  });

  listen("menu-focus", function (msg) {
    console.log("listen::menu-focus");
    client.console.togglePort("FOCUS", client.console);
    canvas.toggleShowMarks();
  });

  listen("menu-metronome", function (msg) {
    console.log("listen::menu-metronome");
    client.enableMetronome = !client.enableMetronome
  });

  listen("menu-reset_noteratio", function (msg) {
    console.log("listen::menu-reset_noteratio");
    metronome.noteRatio = 16
    client.console.currentNumber.innerText = "1:16"
  });
});
