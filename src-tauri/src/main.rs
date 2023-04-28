#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod lib;
mod analyser;
use std::borrow::Borrow;
use std::fmt::format;
use std::sync::Mutex;
use crate::lib::osc::{OscPlugin};
use crate::lib::midi::{ MidiPlugin };
use crate::lib::conf::{ AppConf };
use crate::lib::setup;
use tauri::{
  CustomMenuItem, Menu, MenuItem, Submenu, AboutMetadata,
  Manager, Window, RunEvent, AppHandle, Wry, Assets, Context, WindowMenuEvent
};

pub struct AnuApp {
  osc_states: Mutex<OscPlugin>,
  midi_states: MidiPlugin
}

fn osc_lists() -> &'static [&'static str] {
  &["Default 9000", "SuperCollider 57120", "TidalCycles 6010", "SonicPi 4559"]
}

fn midi_init_lists() -> &'static [&'static str] {
  &["N/A","N/A","N/A","N/A","N/A","N/A"]
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
fn get_osc_menu_state(_window: Window) -> Option<String>{
  let app_conf = AppConf::read();
  app_conf.io_osc
}


fn menu<A: Assets>(ctx: &Context<A>) -> Menu {
  let app_conf = AppConf::read();
  let rev = CustomMenuItem::new("REV".to_string(), "reverse step (r)");
  let focus = CustomMenuItem::new("FOC".to_string(), "focus (f)");
  let metronome = CustomMenuItem::new("METRONOME".to_string(), "Enable Metronome Sound");
  let stay_on_top = CustomMenuItem::new("STAY_ON_TOP".to_string(), "Stay On Top");
  let stay_on_top_menu = if app_conf.stay_on_top { stay_on_top.selected() } else { stay_on_top };
  // let udp = CustomMenuItem::new("UDP".to_string(), "UDP (User Datagram Protocol)");
  
  let osc_submenu = osc_lists().iter().fold(Menu::new(), |menu, &osc_menu| {
    let mut mm = CustomMenuItem::new(osc_menu, osc_menu);
    if let Some(io_osc) = &app_conf.io_osc { 
      if osc_menu == io_osc.as_str() { mm = mm.clone().selected(); } 
    }
    menu.add_item(mm)
  });

  let midi_submenu = midi_init_lists().iter().enumerate().fold(Menu::new(), |menu, (index, &midi_menu )| {
    let mut mm = CustomMenuItem::new(format!("io-midi-{}",index), midi_menu);
    if let Some(io_midi) = &app_conf.io_midi { 
      if midi_menu == io_midi.as_str() { mm = mm.clone().selected(); } 
      mm = mm.clone().disabled(); 
    } else { 
      mm = mm.clone().disabled(); 
    }
    menu.add_item(mm)
  });

  let submenu_midi_conn = Submenu::new("MIDI", midi_submenu);
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
  let state = app.state::<AnuApp>();
  let midi_state_devices = state.midi_states.devices.lock(); 

  match menu_id {
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
    // "OSC"
    id if osc_lists().contains(&id) => { 
      let app_conf = AppConf::read();
      let mut payload = None::<&str>;

      match app_conf.clone().io_osc {
        Some(osc) => { 
          match id == osc {
            true => { menu_handle.get_item(id).set_selected(false).unwrap(); }
            false => {
              for &_osc in osc_lists().iter() {
                menu_handle.get_item(_osc).set_selected(_osc == id).unwrap();
              }
              payload = Some(id);
            }
          }
        }
        None => { 
          menu_handle.get_item(id).set_selected(true).unwrap(); 
          payload = Some(id);
        }
      }

      win.emit("menu-osc", payload).unwrap();  // emit payload to frontend

      // set osc port
      if let Some(_id) = payload {
        let port = _id.split(' ').collect::<Vec<&str>>();
        let p = port[1].parse::<u16>().unwrap();
        state.osc_states.lock().unwrap().set_send_to_port(p);
      }
       
      app_conf.amend(serde_json::json!({ "io_osc": payload })).write(); // update config file (~/.anu/anu.config.json)
    },
    // "MIDI"
    id if midi_state_devices.borrow().as_ref().expect("cannot access to midi_state.devices").contains_key(id) =>  { 
        
      let app_conf = AppConf::read();
      let mut payload = (None::<&str>, "");

      match app_conf.clone().io_midi {
        Some(midi) => {
          match id == midi {
            true => { menu_handle.get_item(id).set_selected(false).unwrap(); }
            false => {
              for &_midi in midi_init_lists().iter() {
                menu_handle.get_item(_midi).set_selected(_midi == id).unwrap();
              }
              payload = (Some(id), midi_state_devices.borrow().as_ref().expect("cannot access to midi_state.devices").get(id).unwrap());
            }
          }
        },
        None => { 
          menu_handle.get_item(id).set_selected(true).unwrap(); 
          payload = (Some(id), midi_state_devices.borrow().as_ref().expect("cannot access to midi_state.devices").get(id).unwrap());
        }
      }

      win.emit("menu-midi", payload).unwrap();
      app_conf.amend(serde_json::json!({ "io_midi": payload.0 })).write(); // update config file (~/.anu/anu.config.json)

    },
    _ => {}
  }
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
  let context = tauri::generate_context!();
  AppConf::read().write();
  tauri::Builder::default()
    .setup(setup::init)
    .menu(menu(&context))
    .manage(AnuApp { osc_states: Default::default(), midi_states: Default::default() })
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