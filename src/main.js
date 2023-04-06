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
    client.console.togglePort("OSC", client.console);
    client.console.oscInfo.innerText = client.console.isOSCToggled
      ? `PORT:${canvas.io.osc.port}`
      : "--";
  });
  listen("menu-rev", function (msg) {
    client.console.togglePort("REV", client.console);
  });

  listen("menu-focus", function (msg) {
    client.console.togglePort("FOCUS", client.console);
    canvas.toggleShowMarks();
  });

  listen("menu-metronome", function (msg) {
    client.enableMetronome = !client.enableMetronome
  });

  listen("menu-reset_noteratio", function (msg) {
    metronome.noteRatio = 16
    client.console.currentNumber.innerText = "1:16"
  });
});
