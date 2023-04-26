use crate::AnuApp;

use super::{conf::AppConf};
use log::{info};
use tauri::{utils::config::WindowUrl, window::WindowBuilder, App, Manager};

pub fn init(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
  info!("setup::init");
  let app_conf = AppConf::read();
  let url = app_conf.main_origin.to_string();
  let app = app.handle();
  let state = app.state::<AnuApp>();

  if let Some(io_osc) = app_conf.clone().io_osc {
    let port = io_osc.split(' ').collect::<Vec<&str>>();
    let p = port[1].parse::<u16>().unwrap();
    state.osc_states.lock().unwrap().set_send_to_port(p);
  }

  tauri::async_runtime::spawn(async move {
    let link = &url;
    info!("setup::init::main_window: {}", link);
    let mut main_win = WindowBuilder::new(&app, "core", WindowUrl::App("../../../src".into()))
      .title("anu")
      .resizable(true)
      .fullscreen(false)
      .inner_size(app_conf.main_width, app_conf.main_height)
      .always_on_top(app_conf.stay_on_top);

    #[cfg(target_os = "macos")]
    {
      main_win = main_win
        .title_bar_style(app_conf.clone().titlebar())
        .hidden_title(true);
    }

    main_win.build().unwrap();
  });
  Ok(())
}