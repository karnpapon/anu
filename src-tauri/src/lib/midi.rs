use midir::{MidiOutput, MidiOutputConnection};
use serde::Serialize;
use std::collections::HashMap;
use std::sync::{Mutex};

#[derive(Default)]
pub struct MidiState {
  pub midi: Mutex<Option<MidiOutput>>,
  pub devices: Mutex<HashMap<usize, String>>,
  pub out_devices: Mutex<Option<MidiOutputConnection>>
}

#[derive(Clone, Serialize)]
struct MidiMessage {
  message: Vec<u8>,
}

#[tauri::command]
pub fn init_midi(midi_state: tauri::State<'_, MidiState>){
  let midi_out = MidiOutput::new("client-midi-output").unwrap(); 
  let mut midi = midi_state.midi.lock().unwrap();
  *midi = Some(midi_out);
}

#[tauri::command]
pub fn list_midi_connections(midi_state: tauri::State<'_, MidiState>) -> HashMap<usize, String> {
  match midi_state.midi.lock() {
    Ok(m) => {
      let mut midi_connections = HashMap::new();
      let _midi = m.as_ref().unwrap();
      for (i, p) in _midi.ports().iter().enumerate() {
        let port_name = _midi.port_name(p);
        match port_name {
          Ok(port_name) => { midi_connections.insert(i, port_name); }
          Err(e) => { println!("Error getting port name: {}", e); }
        }
      }
      midi_connections
    }
    Err(_) => HashMap::new(),
  }
}

#[tauri::command]
pub fn setup_midi_connection_list(midi_state: tauri::State<'_, MidiState>) -> Result<(),&'static str> {
  match midi_state.devices.lock() {
    Ok(mut midi_devices) => {
      let state = midi_state.clone();
      *midi_devices = list_midi_connections(state);
      Ok(())
    }
    Err(_) => Err("setup_midi_connection_list::error"),
  }
}

#[tauri::command]
pub fn setup_midi_out(midi_state: tauri::State<'_, MidiState>) -> Result<String,&'static str> {
  let mut port = None;
  match (midi_state.devices.lock(), midi_state.midi.lock(), midi_state.out_devices.lock()) {
    ( Ok(devices),Ok(midi),Ok(mut out) ) => {
      let _midi = midi.as_ref().unwrap();
      let target_device = devices.get(&0).unwrap(); //TODO: no hardcode.
      for (_, p) in _midi.ports().iter().enumerate() {
        let port_name = _midi.port_name(p).unwrap();
        if &port_name == target_device { port = Some(p.clone()); } 
      };
      
      let midi_out = MidiOutput::new("midi-output").unwrap(); 
      if let Some(p) = port {
        let conn_out = midi_out.connect(&p, "midi-out-device").unwrap();
        *out = Some(conn_out);
        println!("Connection open. Listen!");
      }
      
      Ok(target_device.to_string())
    }
    _ => {
      Err("setup_midi_out::error")
    }
  }
}

#[tauri::command]
pub fn send_midi_out(midi_state: tauri::State<'_, MidiState>, msg: Vec<u8>) -> Result<(),&'static str> {
  match midi_state.out_devices.lock() {
    Ok(mut conn_out) => {
      let connection_out: &mut MidiOutputConnection = conn_out.as_mut().unwrap();
      connection_out.send(&msg).unwrap();
      Ok(())
    }
    _ => {
      Err("send_midi_note_out::error")
    }
  }
}