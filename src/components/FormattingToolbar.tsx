import React from 'react'

interface FormattingToolbarProps {
  editorViewRef: React.MutableRefObject<any>
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ editorViewRef }) => {
  const wrapSelection = (wrapper: string) => {
    const view = editorViewRef.current
    if (!view) return

    const { from, to } = view.state.selection.main
    const selectedText = view.state.doc.sliceString(from, to)

    const newText = wrapper + selectedText + wrapper
    view.dispatch({
      changes: { from, to, insert: newText },
      selection: { anchor: from + wrapper.length, head: to + wrapper.length }
    })
    view.focus()
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b border-gray-300">
      <button
        onClick={() => wrapSelection('**')}
        className="px-3 py-1 font-bold bg-white border border-gray-400 rounded hover:bg-gray-200"
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        onClick={() => wrapSelection('*')}
        className="px-3 py-1 italic bg-white border border-gray-400 rounded hover:bg-gray-200"
        title="Italic (Ctrl+I)"
      >
        I
      </button>
    </div>
  )
}

export default FormattingToolbar