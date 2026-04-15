#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use anyhow::Result;
use std::fs;
use std::io::{Read, Seek, SeekFrom};
use std::path::PathBuf;
use tauri::Manager;

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

#[tauri::command]
fn get_file_size(path: String) -> Result<u64, String> {
    fs::metadata(&path)
        .map(|m| m.len())
        .map_err(|e| format!("Failed to get file size: {}", e))
}

#[tauri::command]
fn get_file_modified_time(path: String) -> Result<i64, String> {
    fs::metadata(&path)
        .and_then(|m| m.modified())
        .map(|t| t.duration_since(std::time::UNIX_EPOCH).unwrap().as_secs() as i64)
        .map_err(|e| format!("Failed to get modified time: {}", e))
}

#[tauri::command]
fn read_file_chunk(path: String, offset: u64, size: u64) -> Result<String, String> {
    let mut file = fs::File::open(&path)
        .map_err(|e| format!("Failed to open file: {}", e))?;
    
    file.seek(SeekFrom::Start(offset))
        .map_err(|e| format!("Failed to seek file: {}", e))?;
    
    let mut buffer = vec![0; size as usize];
    let bytes_read = file.read(&mut buffer)
        .map_err(|e| format!("Failed to read file chunk: {}", e))?;
    
    buffer.truncate(bytes_read);
    String::from_utf8(buffer)
        .map_err(|e| format!("Invalid UTF-8 sequence: {}", e))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            get_file_size,
            get_file_modified_time,
            read_file_chunk
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}