use midir::{MidiOutput, MidiOutputConnection};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{Window};

use crate::App;

#[derive(Default)]
pub struct MidiState {
  pub midi: Mutex<Option<MidiOutput>>,
  pub devices: Mutex<HashMap<usize, String>>,
  pub out_device: Mutex<Option<MidiOutputConnection>>,
}

#[tauri::command]
pub fn init_midi(app: tauri::State<'_, App>) {
  let midi_out = MidiOutput::new("client-midi-output").unwrap();
  let mut midi = app.midi_states.midi.lock().unwrap();
  *midi = Some(midi_out);
}

#[tauri::command]
pub fn list_midi_connections(app: tauri::State<'_, App>) -> HashMap<usize, String> {
  match app.midi_states.midi.lock() {
    Ok(m) => {
      let mut midi_connections = HashMap::new();
      let _midi = m.as_ref().unwrap();
      for (i, p) in _midi.ports().iter().enumerate() {
        let port_name = _midi.port_name(p);
        match port_name {
          Ok(port_name) => {
            midi_connections.insert(i, port_name);
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
pub fn setup_midi_connection_list(
  app: tauri::State<'_, App>,
  window: Window,
) -> Result<(), &'static str> {
  match app.midi_states.devices.lock() {
    Ok(mut midi_devices) => {
      let state = app.clone();
      *midi_devices = list_midi_connections(state.clone());
      // let midi_devices_conn = list_midi_connections(state);

      // inject midi devices to menubar.
      // std::thread::spawn(move || {
      //   let osc_submenu =  midi_devices_conn.iter().fold(Menu::new(), |menu, (id, name)| {
      //     menu.add_item(CustomMenuItem::new(id.to_string(), name))
      //   });
      //   window.menu_handle().get_item("MIDI_DEVICES").set_title(title);

      //   // .update_menu_item(self.id, MenuUpdate::SetEnabled(enabled))
      //   // .map_err(Into::into)
      // });

      Ok(())
    }
    Err(_) => Err("setup_midi_connection_list::error"),
  }
}

#[tauri::command]
pub fn setup_midi_out(app: tauri::State<'_, App>) -> Result<String, &'static str> {
  let mut port = None;
  match (
    app.midi_states.devices.lock(),
    app.midi_states.midi.lock(),
    app.midi_states.out_device.lock(),
  ) {
    (Ok(devices), Ok(midi), Ok(mut out)) => {
      let _midi = midi.as_ref().unwrap();
      let target_device = devices.get(&0).unwrap(); //TODO: no hardcode.
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
pub fn send_midi_out(app: tauri::State<'_, App>, msg: Vec<u8>) -> Result<(), &'static str> {
  match app.midi_states.out_device.lock() {
    Ok(mut conn_out) => {
      let connection_out: &mut MidiOutputConnection = conn_out.as_mut().unwrap();
      connection_out.send(&msg).unwrap();
      Ok(())
    }
    _ => Err("send_midi_note_out::error"),
  }
}
