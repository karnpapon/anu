use super::{conf::AppConf};
use log::{info};
use tauri::{utils::config::WindowUrl, window::WindowBuilder, App};

pub fn init(app: &mut App) -> std::result::Result<(), Box<dyn std::error::Error>> {
  info!("setup::init");
  let app_conf = AppConf::read();
  let url = app_conf.main_origin.to_string();
  // let theme = AppConf::theme_mode();
  // let handle = app.app_handle();
  let app = app.handle();
  tauri::async_runtime::spawn(async move {
    let link = &url;
    info!("setup::init::main_window: {}", link);
    let mut main_win = WindowBuilder::new(&app, "core", WindowUrl::App("../../../src".into()))
      .title("anu")
      .resizable(true)
      .fullscreen(false)
      .inner_size(app_conf.main_width, app_conf.main_height);
      // .theme(Some(theme))
      // .always_on_top(app_conf2.stay_on_top);
      // .user_agent(&app_conf2.ua_window);

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