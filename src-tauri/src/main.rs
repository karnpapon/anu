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
use crate::lib::conf::{ AppConf };
use crate::lib::setup;
use tauri::{
  CustomMenuItem, Menu, MenuItem, Submenu, AboutMetadata,
  Manager, Window, RunEvent, AppHandle, Wry, Assets, Context, WindowMenuEvent
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
  let app_conf = AppConf::read();

  let midi = CustomMenuItem::new("MIDI_DEVICES".to_string(), "(empty midi devices)").disabled();
  let rev = CustomMenuItem::new("REV".to_string(), "reverse step (r)");
  let focus = CustomMenuItem::new("FOC".to_string(), "focus (f)");
  let metronome = CustomMenuItem::new("METRONOME".to_string(), "Enable Metronome Sound");
  let stay_on_top = CustomMenuItem::new("STAY_ON_TOP".to_string(), "Stay On Top");
  let stay_on_top_menu = if app_conf.stay_on_top { stay_on_top.selected() } else { stay_on_top };
  // let udp = CustomMenuItem::new("UDP".to_string(), "UDP (User Datagram Protocol)");
  // let note_ratio = CustomMenuItem::new("RESETNOTERATIO".to_string(), "Reset Note Ratio (1:16)");
  
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
  .add_item(stay_on_top_menu)
  // .add_item(note_ratio)
  );
  
  Menu::new() 
    .add_submenu(native_menu)
    .add_submenu(submenu_app)
}

fn on_ready(event: WindowMenuEvent<tauri::Wry>) {
  let win = Some(event.window()).unwrap();
  let app = win.app_handle();
  let menu_id = event.menu_item_id();
  let menu_handle = win.menu_handle();
  let state = app.state::<App>();

  match menu_id {
    // "REV" => {  window_.emit("menu-rev", true).unwrap(); },
    // "RESETNOTERATIO" => {  window_.emit("menu-reset_noteratio", true).unwrap(); },
    "FOC" => {  win.emit("menu-focus", true).unwrap(); },
    "METRONOME" => {  win.emit("menu-metronome", true).unwrap(); },
    "STAY_ON_TOP" => {
      let app_conf = AppConf::read();
      let stay_on_top = !app_conf.stay_on_top;
      menu_handle
        .get_item(menu_id)
        .set_selected(stay_on_top)
        .unwrap();
      win.set_always_on_top(stay_on_top).unwrap();
      app_conf
        .amend(serde_json::json!({ "stay_on_top": stay_on_top }))
        .write();
    },
    id if osc_lists().contains(&id) => { 
      win.emit("menu-osc", Some(id)).unwrap(); 
      let port = id.split(' ').collect::<Vec<&str>>();
      let p = port[1].parse::<u16>().unwrap();
      state.osc_states.lock().unwrap().set_send_to_port(p);
    },
    id if state.midi_states.devices.lock().borrow().as_ref().unwrap().contains_key(&id.parse().unwrap()) =>  { 
      win.emit("menu-midi", Some(id)).unwrap();
    },
    _ => {}
  }
  // });

  // Setup state change events in JavaScript
  // let window_ = window.clone();
  // std::thread::spawn(move || {
  //   // let receiver = receiver.lock().unwrap();
  //   // while let Ok(change) = receiver.recv() {
  //   //     window_.emit("change", Some(change)).unwrap();
  //   // }
  // });
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
  let context = tauri::generate_context!();
  AppConf::read().write();
  tauri::Builder::default()
    .setup(setup::init)
    .menu(menu(&context))
    .manage(App { osc_states: Default::default(), midi_states: Default::default() })
    .invoke_handler(tauri::generate_handler![
      osc_select,
      midi_select,
      get_osc_menu_state
    ])
    .plugin(lib::midi::init())
    .plugin(lib::osc::init())
    .on_menu_event(on_ready)
    .run(context)
    .expect("error while running anu application");
  Ok(())
}