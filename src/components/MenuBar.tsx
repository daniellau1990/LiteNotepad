import React from 'react'
import { save } from '@tauri-apps/api/dialog'
import { writeTextFile } from '@tauri-apps/api/fs'

interface MenuBarProps {
  onOpen: () => void
  onSave: () => void
}

const MenuBar: React.FC<MenuBarProps> = ({ onOpen, onSave }) => {
  const handleSaveAs = async () => {
    try {
      const filePath = await save({
        filters: [{
          name: 'Text Files',
          extensions: ['txt', 'md', 'js', 'json', 'ts', 'tsx', 'html', 'css']
        }]
      })
      if (filePath) {
        // Save logic will be implemented
        onSave()
      }
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }

  return (
    <div className="flex items-center px-4 py-2 bg-gray-900 text-gray-300 border-b border-gray-700">
      <div className="flex items-center space-x-6">
        <div className="relative group">
          <button className="px-3 py-1 rounded hover:bg-gray-800 focus:outline-none">
            File
          </button>
          <div className="absolute hidden group-hover:block bg-gray-800 rounded shadow-lg z-10 min-w-40">
            <button 
              onClick={onOpen}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-t"
            >
              Open...
            </button>
            <button 
              onClick={onSave}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Save
            </button>
            <button 
              onClick={handleSaveAs}
              className="block w-full text-left px-4 py-2 hover:bg-gray-700"
            >
              Save As...
            </button>
            <div className="border-t border-gray-700 my-1"></div>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b">
              Exit
            </button>
          </div>
        </div>
        <div className="relative group">
          <button className="px-3 py-1 rounded hover:bg-gray-800 focus:outline-none">
            Edit
          </button>
          <div className="absolute hidden group-hover:block bg-gray-800 rounded shadow-lg z-10 min-w-40">
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-t">
              Undo
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">
              Redo
            </button>
            <div className="border-t border-gray-700 my-1"></div>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">
              Cut
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">
              Copy
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b">
              Paste
            </button>
          </div>
        </div>
        <div className="relative group">
          <button className="px-3 py-1 rounded hover:bg-gray-800 focus:outline-none">
            View
          </button>
          <div className="absolute hidden group-hover:block bg-gray-800 rounded shadow-lg z-10 min-w-40">
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-t">
              Zoom In
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700">
              Zoom Out
            </button>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-b">
              Reset Zoom
            </button>
          </div>
        </div>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <div className="text-sm text-gray-400">
          LiteEdit v0.1.0
        </div>
      </div>
    </div>
  )
}

export default MenuBar