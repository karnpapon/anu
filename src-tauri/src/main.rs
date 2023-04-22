#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod lib;
mod analyser;
use std::borrow::Borrow;
use std::sync::Mutex;
use crate::lib::osc::{OscPlugin};
use crate::lib::midi::{ MidiPlugin };
use tauri::{
  CustomMenuItem, Menu, MenuItem, Submenu, AboutMetadata,
  Manager, Window, RunEvent, AppHandle, Wry, Assets, Context
};

pub struct App {
  osc_states: Mutex<OscPlugin>,
  midi_states: MidiPlugin
}

fn osc_lists() -> &'static [&'static str] {
  &["Default 9000", "SuperCollider 57120", "TidalCycles 6010", "SonicPi 4559"]
}

#[tauri::command]
fn osc_select(setting: &'_ str, window: Window) {
  for &osc in osc_lists().iter() {
    window
        .menu_handle()
        .get_item(osc)
        .set_selected(osc == setting)
        .unwrap();
  }
}

// TODO: fix this
#[tauri::command]
fn midi_select(setting: &'_ str, window: Window) {
  for &osc in osc_lists().iter() {
    window
        .menu_handle()
        .get_item(osc)
        .set_selected(osc == setting)
        .unwrap();
  }
}

#[tauri::command]
fn get_osc_menu_state(window: Window){
    let me = window
        .menu_handle()
        .get_item("Default 9000");

  // println!("menu = {:?}", me);
}


fn menu<A: Assets>(ctx: &Context<A>) -> Menu {

  let midi = CustomMenuItem::new("MIDI_DEVICES".to_string(), "(empty midi devices)").disabled();
  // let udp = CustomMenuItem::new("UDP".to_string(), "UDP (User Datagram Protocol)");

  let rev = CustomMenuItem::new("REV".to_string(), "reverse step (r)");
  let focus = CustomMenuItem::new("FOC".to_string(), "focus (f)");
  let metronome = CustomMenuItem::new("METRONOME".to_string(), "Enable Metronome Sound");
  let note_ratio = CustomMenuItem::new("RESETNOTERATIO".to_string(), "Reset Note Ratio (1:16)");
  
  let osc_submenu = osc_lists().iter().fold(Menu::new(), |menu, &osc_menu| {
    menu.add_item(CustomMenuItem::new(osc_menu, osc_menu))
  });
  
  let submenu_midi_conn = Submenu::new("MIDI", Menu::new().add_item(midi));
  let submenu_osc_conn = Submenu::new("OSC (Open Sound Control)", osc_submenu);
  
  let native_menu = Submenu::new("", Menu::new()
  .add_native_item(MenuItem::About(ctx.package_info().name.clone(), AboutMetadata::default()))
  .add_native_item(MenuItem::Services)
  .add_native_item(MenuItem::Separator)
  .add_native_item(MenuItem::Quit));

  let submenu_app = Submenu::new("app", Menu::new()
  .add_item(rev)
  .add_item(focus) 
  .add_native_item(MenuItem::Separator)
  .add_submenu(submenu_midi_conn)
  .add_submenu(submenu_osc_conn)
  .add_native_item(MenuItem::Separator)
  .add_item(metronome)
  .add_item(note_ratio)
  );
  
  Menu::new() 
    .add_submenu(native_menu)
    .add_submenu(submenu_app)
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
      id if osc_lists().contains(&id) => { 
        window_.emit("menu-osc", Some(id)).unwrap(); 
        let port = id.split(' ').collect::<Vec<&str>>();
        let p = port[1].parse::<u16>().unwrap();
        state.osc_states.lock().unwrap().set_send_to_port(p);
      },
      id if state.midi_states.devices.lock().borrow().as_ref().unwrap().contains_key(&id.parse().unwrap()) =>  { 
        window_.emit("menu-midi", Some(id)).unwrap();
      },
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
    .menu(menu(&context))
    .manage(App { osc_states: Default::default(), midi_states: Default::default() })
    .invoke_handler(tauri::generate_handler![
      osc_select,
      midi_select,
      get_osc_menu_state
    ])
    .plugin(lib::midi::init())
    .plugin(lib::osc::init())
    .build(context)?;
        
  app.run(move |handle, event| match event {
    RunEvent::Ready => on_ready(handle),
    _ => {}
  });

  Ok(())
}