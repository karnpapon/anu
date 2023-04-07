#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod lib;

use crate::lib::midi::{
  MidiState, 
  list_midi_connections, 
  setup_midi_out, 
  init_midi, 
  setup_midi_connection_list,
  send_midi_out
};
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, AboutMetadata,Manager, Window, RunEvent, AppHandle, Wry};

pub struct App {
  midi_states: MidiState
}

fn osc_lists() -> &'static [&'static str] {
  &["Default (49162)", "SuperCollider (57120)", "TidalCycles (6010)", "SonicPi (4559)"]
}

#[tauri::command]
fn osc_list(setting: &'_ str, window: Window) {
  for &osc in osc_lists().iter() {
    window
        .menu_handle()
        .get_item(osc)
        .set_selected(osc == setting)
        .unwrap();
  }
}

fn menu() -> Menu {
  let midi = CustomMenuItem::new("MIDI_DEVICES".to_string(), "(empty midi devices)").disabled();
  // let udp = CustomMenuItem::new("UDP".to_string(), "UDP (User Datagram Protocol)");

  let rev = CustomMenuItem::new("REV".to_string(), "reverse step (r)");
  let focus = CustomMenuItem::new("FOC".to_string(), "focus (f)");
  let metronome = CustomMenuItem::new("METRONOME".to_string(), "Enable Metronome Sound");
  let note_ratio = CustomMenuItem::new("RESETNOTERATIO".to_string(), "Reset Note Ratio (1:16)");
  let submenu_app = Submenu::new("app", Menu::new().add_item(metronome).add_item(note_ratio));

  let midi_devices_submenu = Submenu::new("MIDI", Menu::new().add_item(midi));
  let osc_submenu = Submenu::new("OSC (Open Sound Control)",  osc_lists().iter().fold(Menu::new(), |menu, &theme| {
    menu.add_item(CustomMenuItem::new(theme, theme))
  }));

  let submenu_commu = Submenu::new("communications", Menu::new().add_submenu(midi_devices_submenu).add_submenu(osc_submenu));
  let submenu_controls = Submenu::new("controls", Menu::new().add_item(rev).add_item(focus));
  let native_menu = Submenu::new("", Menu::new().add_native_item(MenuItem::About("anu".to_string(), AboutMetadata::default())).add_native_item(MenuItem::Quit));
  let menu = Menu::new() 
    .add_submenu(native_menu)
    .add_submenu(submenu_app)
    .add_submenu(submenu_controls)
    .add_submenu(submenu_commu);

  return menu;
}

fn on_ready(handle: &AppHandle<Wry>) {
  let window = handle.get_window("main").unwrap();

  // Setup menu handlers
  let window_ = window.clone();
  let handle_ = handle.clone();

  window.on_menu_event(move |event| {
      let state = handle_.state::<App>();
      match event.menu_item_id() {
        "REV" => {  window_.emit("menu-rev", true).unwrap(); },
        "FOC" => {  window_.emit("menu-focus", true).unwrap(); },
        "METRONOME" => {  window_.emit("menu-metronome", true).unwrap(); },
        "RESETNOTERATIO" => {  window_.emit("menu-reset_noteratio", true).unwrap(); },
        id if osc_lists().contains(&id) => window_.emit("menu-osc", Some(id)).unwrap(),
        _ => {}
      }
  });

  // Setup state change events in JavaScript
  // let window_ = window.clone();
  std::thread::spawn(move || {
      // let receiver = receiver.lock().unwrap();
      // while let Ok(change) = receiver.recv() {
      //     window_.emit("change", Some(change)).unwrap();
      // }
  });
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
  let context = tauri::generate_context!();
  let app = tauri::Builder::default()
        .menu(menu())
        .manage(App { midi_states: Default::default() })
        .invoke_handler(tauri::generate_handler![
          init_midi,
          list_midi_connections,
          setup_midi_connection_list,
          setup_midi_out,
          send_midi_out,
          osc_list
        ])
        .build(context)?;
        
    app.run(move |handle, event| match event {
        RunEvent::Ready => on_ready(handle),
        _ => {}
    });

  Ok(())
}