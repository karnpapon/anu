const client = new Client();
const canvas = new Canvas();
const loading = new Loading()
const metronome = new Metronome(canvas);

client.build();
loading.build();
canvas.install();

window.addEventListener("load", () => {
  canvas.init();
  metronome.init();
  const { invoke, event } = window.__TAURI__;
  const { listen } = event;

  listen("menu-osc", function (msg) {
    if (!msg.payload) return
    const { payload } = msg
    const osc_port = payload.split(" ")[1].replace(/[()]/g, ''); 
    client.console.isOSCToggled = true
    // canvas.io.osc.select(osc_port)
    invoke('osc_select', { setting: payload });
    client.console.oscInfo.innerText = client.console.isOSCToggled
      ? `${osc_port}`
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
    metronome.noteRatio = 1
    client.console.currentNumber.innerText = "1:16"
  });
});
