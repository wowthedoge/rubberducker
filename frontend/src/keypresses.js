
import keyboardJS from 'keyboardjs';

export default function detectKeypress(addTextLine, increaseIndent, decreaseIndent, handleBackspace) {
    const enterHandler = e => {
      addTextLine()
    }

    const arrowKeyHandler = e => {
      e.preventDefault()
      console.log("pressed", e.key)
      //changeHighlights(e.key)
    }

    const deleteHandler = e => {
      //deleteTextLines(highlighted)
    }

    const backspaceHandler = e => {
      handleBackspace()
    }

    const tabHandler = e => {
      e.preventDefault()
      console.log("tab pressed")
      increaseIndent()
    }

    const shiftTabHandler = e => {
      e.preventDefault()
      console.log("shiftTab pressed")
      decreaseIndent()
    }
    keyboardJS.bind('enter', enterHandler)
    keyboardJS.bind(['up', 'down'], arrowKeyHandler)
    keyboardJS.bind('delete', deleteHandler)
    keyboardJS.bind('tab', tabHandler)
    keyboardJS.bind('shift + tab', shiftTabHandler)
    keyboardJS.bind('backspace', backspaceHandler)


    return () => {
      keyboardJS.unbind('enter', enterHandler)
      keyboardJS.unbind(['up', 'down'], arrowKeyHandler)
      keyboardJS.unbind('delete', deleteHandler)
      keyboardJS.unbind('tab', tabHandler)
      keyboardJS.unbind('shift + tab', shiftTabHandler)
      keyboardJS.unbind('backspace', backspaceHandler)

    }
  }