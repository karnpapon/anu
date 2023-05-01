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

  function menu_osc(payload){
    if (payload) {
      const osc_port = payload.split(" ")[1].replace(/[()]/g, ''); 
      client.console.isOSCToggled = true
      client.console.oscInfo.innerText = client.console.isOSCToggled
        ? `${osc_port}`
        : "--";
    } else {
      client.console.isOSCToggled = false
      client.console.oscInfo.innerText = "--"; 
    } 
  }

  async function menu_midi(payload){
    await invoke('plugin:midi|setup_midi_out')

    if (payload[1]) {
      client.console.isMIDIOutToggled = true
      client.console.midiInfo.innerText = client.console.isMIDIOutToggled
        ? `${payload[1]}`
        : "--";
    } else {
      client.console.isMIDIOutToggled = false
      client.console.midiInfo.innerText = "--"; 
    } 
  }

  invoke("get_osc_menu_state").then((payload) => menu_osc(payload))
  listen("menu-osc", ({ payload}) => menu_osc(payload));

  listen("menu-midi", ({ payload }) => menu_midi(payload));

  listen("menu-focus", function (msg) {
    client.console.togglePort("FOCUS", client.console);
    canvas.toggleShowMarks();
  });

  listen("menu-metronome", function (msg) {
    client.enableMetronome = !client.enableMetronome
  });
});
