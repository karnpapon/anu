use rosc::{encoder, OscMessage, OscPacket, OscType};
use serde::{Deserialize, Serialize};
use std::net::{SocketAddr, UdpSocket};
use std::sync::Mutex;
use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime, State,
};

use crate::App;

pub struct OscPlugin {
  socket: Mutex<Option<UdpSocket>>,
  send_from_port: Mutex<Option<u16>>,
  send_to_port: Mutex<Option<u16>>,
}

impl Default for OscPlugin {
  fn default() -> Self {
    let Ok(socket) = UdpSocket::bind("127.0.0.1:3400") else {
      return Self { socket: None.into(), send_from_port: None.into(), send_to_port: None.into() };
    };
    OscPlugin {
      socket: Some(socket).into(),
      send_from_port: Some(3400).into(),
      send_to_port: Some(9000).into()
    }
  }
}

impl OscPlugin {
  pub fn set_send_to_port(&mut self, port: u16) {
    println!("set_send_to_port = {:?}", port);
    self.send_to_port = Some(port).into();
  }

  fn send(&self, rpc: RpcOscMessage, send_to: u16) {
    let socket = self.socket.lock().unwrap(); 
    let addr = SocketAddr::from(([127, 0, 0, 1], send_to));
    let args: Vec<OscType> = rpc
      .args
      .iter()
      .map(|arg| {
        let tt = match arg {
          OscValue::Bool(v) => OscType::from(*v),
          OscValue::Float(v) => OscType::Float(*v as f32),
          OscValue::Int(v) => OscType::Int(*v as i32),
          OscValue::String(v) => OscType::from(v.to_string()),
        };
        tt
      })
      .collect();

    let msg_buf = encoder::encode(&OscPacket::Message(OscMessage {
      addr: rpc.path,
      args,
    }))
    .unwrap();
    socket.as_ref().unwrap().send_to(&msg_buf, addr).unwrap();
  }
}

#[derive(Serialize, Deserialize, Debug)]
enum OscValue {
  Bool(bool),
  Float(f64),
  Int(i64),
  String(String),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcOscMessage {
  path: String,
  args: Vec<OscValue>,
}

#[tauri::command]
fn send(rpc: RpcOscMessage, app: State<'_, App>) {
  let osc_states = app.osc_states.lock().unwrap();
  let p = osc_states.send_to_port.lock().unwrap();
  osc_states.send(rpc, p.expect("cannot acquire send_to_port"));
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("osc")
    .invoke_handler(tauri::generate_handler![send])
    .setup(|app| {
      app.manage(OscPlugin::default());
      Ok(())
    })
    .build()
}
