use rosc::{encoder, OscMessage, OscPacket, OscType};
use serde::{Deserialize, Serialize};
use std::net::{SocketAddr, UdpSocket};
use std::sync::Mutex;
use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime, State,
};

use crate::App;

use crate::analyser;
use crate::analyser::lexer::Error;

use analyser::lexer::Lexer;
use analyser::parser::{parse_message, Parser, Stmt};
use analyser::token::Tokens;

pub struct OscPlugin {
  socket: Mutex<Option<UdpSocket>>,
  send_from_port: Mutex<Option<u16>>,
  send_to_port: Mutex<Option<u16>>,
}

impl serde::Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: serde::ser::Serializer,
  {
    serializer.serialize_str(self.to_string().as_ref())
  }
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

  fn parse(&self, osc_msg: &str) -> (Vec<Stmt>, Vec<Error>) {
    let (osc_msg_vec, lex_error) = Lexer::analyse(osc_msg);

    let tokens = Tokens::new(&osc_msg_vec);
    let vec = Vec::new();
    let (_, stmt) = Parser::parse_tokens(tokens).unwrap_or((Tokens::new(&vec), Vec::new()));
    (stmt, lex_error)
  }

  fn send_packet(&self, rpc: RpcOscMessage, send_to: u16) -> Result<(), Error>{
    let socket = self.socket.lock().unwrap(); 
    let addr = SocketAddr::from(([127, 0, 0, 1], send_to));
    let msg = rpc.args;
    let (stmt, lex_error) = self.parse(&msg);

    match lex_error.is_empty() {
      true => {
        let argument_msg = stmt.iter().map(|x| match x { Stmt::ExprStmt(v) => parse_message(v) }).collect::<Vec<OscType>>();
        let msg_buf = encoder::encode(&OscPacket::Message(OscMessage {
            addr: rpc.path,
            args: argument_msg,
        }))
        .unwrap();
        socket.as_ref().unwrap().send_to(&msg_buf, addr).unwrap();
        Ok(())
      }
      false => { 
        Err(Error(std::ops::Range { start: 0, end: 0 },format!( "[ERROR]: parsing msg {:?}",  lex_error)) ) 
      } 
    }
  }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcOscMessage {
  path: String,
  args: String,
}

#[tauri::command]
fn send(rpc: RpcOscMessage, app: State<'_, App>) -> Result<(), Error> {
  let osc_states = app.osc_states.lock().unwrap();
  let p = osc_states.send_to_port.lock().unwrap();
  osc_states.send_packet(rpc, p.expect("cannot acquire send_to_port"))?;
  Ok(())
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
