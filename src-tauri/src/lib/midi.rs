use midir::{MidiOutput, MidiOutputConnection};
use std::{collections::HashMap};
use std::sync::Mutex;
use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime, AppHandle,
};

use crate::AnuApp;

use super::conf::AppConf;

pub struct MidiPlugin {
  pub midi: Mutex<Option<MidiOutput>>,
  pub devices: Mutex<HashMap<String, String>>,
  pub out_device: Mutex<Option<MidiOutputConnection>>,
}

impl Default for MidiPlugin {
  fn default() -> Self {
    let Ok(midi_out) = MidiOutput::new("client-midi-output") else {
      return Self { midi: None.into(), devices: HashMap::new().into(), out_device: None.into() };
    };
    MidiPlugin {
      midi: Some(midi_out).into(),
      devices: HashMap::new().into(),
      out_device: None.into()
    }
  }
}

#[tauri::command]
pub fn list_midi_connections(app: tauri::State<'_, AnuApp>) -> HashMap<String, String> {
  match app.midi_states.midi.lock() {
    Ok(m) => {
      let mut midi_connections = HashMap::new();
      let _midi = m.as_ref().unwrap();
      for (i, p) in _midi.ports().iter().enumerate() {
        let port_name = _midi.port_name(p);
        match port_name {
          Ok(port_name) => {
            midi_connections.insert(format!("io-midi-{}", i), port_name);
          }
          Err(e) => {
            println!("Error getting port name: {}", e);
          }
        }
      }
      midi_connections
    }
    Err(_) => HashMap::new(),
  }
}

#[tauri::command]
pub fn setup_midi_connection_list<R: Runtime>(
  app_state: tauri::State<'_, AnuApp>,
  app_handle: AppHandle<R>,
) -> Result<(), &'static str> {
  let app_conf = AppConf::read();
  let io_midi = match app_conf.io_midi {
    Some(_io_midi) => _io_midi,
    None => "".to_string()
  };
  match app_state.midi_states.devices.lock() {
    Ok(mut midi_devices) => {
      let state = app_state.clone();
      *midi_devices = list_midi_connections(state.clone());
      let midi_devices_conn = list_midi_connections(state);

      // inject midi devices to menubar.
      std::thread::spawn(move || {
        let window = app_handle.get_window("core").unwrap().menu_handle();
        for (key, val) in midi_devices_conn.iter() {
          let ww = window.get_item(key);
          ww.set_title(val).unwrap();
          ww.set_selected(key == &io_midi).unwrap();
          ww.set_enabled(true).unwrap();
        }
      });

      Ok(())
    }
    Err(_) => Err("setup_midi_connection_list::error"),
  }
}

#[tauri::command]
pub fn setup_midi_out(app: tauri::State<'_, AnuApp>) -> Result<String, &'static str> {
  let mut port = None;
  let app_conf = AppConf::read();
  let io_midi = match app_conf.io_midi {
    Some(_io_midi) => _io_midi,
    None => "".to_string()
  };

  if io_midi == *"" { return Ok("--".to_string()) }

  match (
    app.midi_states.devices.lock(),
    app.midi_states.midi.lock(),
    app.midi_states.out_device.lock(),
  ) {
    (Ok(devices), Ok(midi), Ok(mut out)) => {
      let _midi = midi.as_ref().unwrap();
      let target_device = devices.get(&io_midi).expect("cannot get devices value"); 
      for (_, p) in _midi.ports().iter().enumerate() {
        let port_name = _midi.port_name(p).unwrap();
        if &port_name == target_device {
          port = Some(p.clone());
        }
      }

      let midi_out = MidiOutput::new("midi-output").unwrap();
      if let Some(p) = port {
        let conn_out = midi_out.connect(&p, "midi-out-device").unwrap();
        *out = Some(conn_out);
        println!("Connection open. Listen!");
      }

      Ok(target_device.to_string())
    }
    _ => Err("setup_midi_out::error"),
  }
}

#[tauri::command]
pub fn send_midi_out(app: tauri::State<'_, AnuApp>, msg: Vec<u8>) -> Result<(), &'static str> {
  match app.midi_states.out_device.lock() {
    Ok(mut conn_out) => {
      let connection_out: &mut MidiOutputConnection = conn_out.as_mut().unwrap();
      connection_out.send(&msg).unwrap();
      Ok(())
    }
    _ => Err("send_midi_note_out::error"),
  }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("midi")
    .invoke_handler(tauri::generate_handler![
      send_midi_out,
      setup_midi_out,
      setup_midi_connection_list,
      list_midi_connections 
    ])
    .setup(|app| {
      app.manage(MidiPlugin::default());
      Ok(())
    })
    .build()
}
