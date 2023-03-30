#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod osc;
use crate::osc::sender::{ osc_setup, osc_send };
use tauri::{WindowBuilder, Runtime};
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};


#[tauri::command]
fn greet(name: &str) -> String {
   format!("Hello, {}!", name)
}


fn main() {
  let osc = CustomMenuItem::new("OSC".to_string(), "OSC (Open Sound Control)");
  let udp = CustomMenuItem::new("UDP".to_string(), "UDP (User Datagram Protocol)");
  let rev = CustomMenuItem::new("REV".to_string(), "REVERSE STEP");
  let focus = CustomMenuItem::new("FOC".to_string(), "FOCUS");
  let submenu_app = Submenu::new("App", Menu::new().add_native_item(MenuItem::Quit));
  let submenu_commu = Submenu::new("Communications", Menu::new().add_item(osc).add_item(udp));
  let submenu_controls = Submenu::new("Controls", Menu::new().add_item(rev).add_item(focus));
  let menu = Menu::new()
    .add_native_item(MenuItem::Copy)
    .add_submenu(submenu_app)
    .add_submenu(submenu_controls)
    .add_submenu(submenu_commu);
  tauri::Builder::default()
    .menu(menu)
    .on_menu_event(|event| {
      match event.menu_item_id() {
        "OSC" => { event.window().emit("menu-osc", true).unwrap(); }
        "UDP" => { },
        "REV" => {  event.window().emit("menu-rev", true).unwrap(); },
        "FOC" => {  event.window().emit("menu-focus", true).unwrap(); }
        _ => {}
      }
    })
    .invoke_handler(tauri::generate_handler![
      greet,
      // osc_setup,
      // osc_send
      ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}