#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod osc;
use crate::osc::sender::{ osc_setup, osc_send };

#[tauri::command]
fn greet(name: &str) -> String {
   format!("Hello, {}!", name)
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      greet,
      // osc_setup,
      // osc_send
      ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}