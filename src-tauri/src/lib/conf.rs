use log::{error, info};
use serde_json::Value;
use std::{collections::BTreeMap};
use tauri::{Manager, Theme};
use std::{
  collections::HashMap,
  fs::{self, File},
  path::{Path, PathBuf},
  process::Command,
};
use anyhow::Result;

#[cfg(target_os = "macos")]
use tauri::TitleBarStyle;

pub const APP_CONF_PATH: &str = "anu.conf.json";
pub const ORIGIN_URL: &str = "https://github.com/karnpapon/anu";

pub fn app_root() -> PathBuf {
  tauri::api::path::home_dir().unwrap().join(".anu")
}

pub fn exists(path: &Path) -> bool {
  Path::new(path).exists()
}

pub fn create_file(path: &Path) -> Result<File> {
  if let Some(p) = path.parent() {
    fs::create_dir_all(p)?
  }
  File::create(path).map_err(Into::into)
}

macro_rules! pub_struct {
  ($name:ident {$($field:ident: $t:ty,)*}) => {
    #[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
    pub struct $name {
      $(pub $field: $t),*
    }
  }
}

pub_struct!(AppConf {
  titlebar: bool,
  hide_dock_icon: bool,
  // theme: String,
  stay_on_top: bool,
  save_window_state: bool,
  global_shortcut: Option<String>,
  io_osc: Option<String>,
  io_midi: Option<String>,
  default_origin: String,

  // Main Window
  isinit: bool,
  main_close: bool,
  main_origin: String,
  main_width: f64,
  main_height: f64,
});

impl AppConf {
  pub fn new() -> Self {
    info!("conf_init");
    Self {
      titlebar: !cfg!(target_os = "macos"),
      hide_dock_icon: false,
      save_window_state: false,
      io_osc: None,
      io_midi: None,
      isinit: true,
      main_close: false,
      stay_on_top: false,
      main_width: 577.0,
      main_height: 728.0,
      main_origin: ORIGIN_URL.into(),
      default_origin: ORIGIN_URL.into(),
      global_shortcut: None,
    }
  }

  pub fn file_path() -> PathBuf {
    app_root().join(APP_CONF_PATH)
  }

  pub fn read() -> Self {
    match std::fs::read_to_string(Self::file_path()) {
      Ok(v) => {
        if let Ok(v2) = serde_json::from_str::<AppConf>(&v) {
          v2
        } else {
          error!("conf_read_parse_error");
          Self::default()
        }
      }
      Err(err) => {
        error!("conf_read_error: {}", err);
        Self::default()
      }
    }
  }

  pub fn write(self) -> Self {
    let path = &Self::file_path();
    if !exists(path) {
      create_file(path).unwrap();
      info!("conf_create");
    }
    if let Ok(v) = serde_json::to_string_pretty(&self) {
      std::fs::write(path, v).unwrap_or_else(|err| {
        error!("conf_write: {}", err);
        Self::default().write();
      });
    } else {
      error!("conf_ser");
    }
    self
  }

  pub fn amend(self, json: Value) -> Self {
    let val = serde_json::to_value(&self).unwrap();
    let mut config: BTreeMap<String, Value> = serde_json::from_value(val).unwrap();
    let new_json: BTreeMap<String, Value> = serde_json::from_value(json).unwrap();

    for (k, v) in new_json {
      config.insert(k, v);
    }

    match serde_json::to_string_pretty(&config) {
      Ok(v) => match serde_json::from_str::<AppConf>(&v) {
        Ok(v) => v,
        Err(err) => {
          error!("conf_amend_parse: {}", err);
          self
        }
      },
      Err(err) => {
        error!("conf_amend_str: {}", err);
        self
      }
    }
  }

  #[cfg(target_os = "macos")]
  pub fn titlebar(self) -> TitleBarStyle {
    if self.titlebar {
      TitleBarStyle::Transparent
    } else {
      TitleBarStyle::Overlay
    }
  }

  // pub fn theme_mode() -> Theme {
  //   match Self::get_theme().as_str() {
  //     "system" => match dark_light::detect() {
  //       // Dark mode
  //       dark_light::Mode::Dark => Theme::Dark,
  //       // Light mode
  //       dark_light::Mode::Light => Theme::Light,
  //       // Unspecified
  //       dark_light::Mode::Default => Theme::Light,
  //     },
  //     "dark" => Theme::Dark,
  //     _ => Theme::Light,
  //   }
  // }

  // pub fn get_theme() -> String {
  //   Self::read().theme.to_lowercase()
  // }

  // pub fn get_auto_update(self) -> String {
  //   self.auto_update.to_lowercase()
  // }

  // pub fn theme_check(self, mode: &str) -> bool {
  //   self.theme.to_lowercase() == mode
  // }

  pub fn restart(self, app: tauri::AppHandle) {
    tauri::api::process::restart(&app.env());
  }
}

impl Default for AppConf {
  fn default() -> Self {
    Self::new()
  }
}

pub mod cmd {
  use super::AppConf;
  use tauri::{command, AppHandle, Manager};

  #[command]
  pub fn get_app_conf() -> AppConf {
    AppConf::read()
  }

  #[command]
  pub fn reset_app_conf() -> AppConf {
    AppConf::default().write()
  }

  // #[command]
  // pub fn get_theme() -> String {
  //   AppConf::get_theme()
  // }

  #[command]
  pub fn form_confirm(_app: AppHandle, data: serde_json::Value) {
    AppConf::read().amend(serde_json::json!(data)).write();
  }

  // #[command]
  // pub fn form_cancel(app: AppHandle, label: &str, title: &str, msg: &str) {
  //   let win = app.app_handle().get_window(label).unwrap();
  //   tauri::api::dialog::ask(
  //     app.app_handle().get_window(label).as_ref(),
  //     title,
  //     msg,
  //     move |is_cancel| {
  //       if is_cancel {
  //         win.close().unwrap();
  //       }
  //     },
  //   );
  // }

  // #[command]
  // pub fn form_msg(app: AppHandle, label: &str, title: &str, msg: &str) {
  //   let win = app.app_handle().get_window(label);
  //   tauri::api::dialog::message(win.as_ref(), title, msg);
  // }
}