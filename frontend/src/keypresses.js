
import keyboardJS from 'keyboardjs';

export default function detectKeypress(selectedIndex, addTextLine, increaseIndent, decreaseIndent, handleBackspace, changeFocus, test) {
    const enterHandler = e => {
      addTextLine(selectedIndex)
    }

    const arrowKeyHandler = e => {
      e.preventDefault()
      if (e.key === 'ArrowUp') changeFocus('up', selectedIndex)
      if (e.key === 'ArrowDown') changeFocus('down', selectedIndex)
    }

    const deleteHandler = e => {
      //deleteTextLines(highlighted)
    }

    const backspaceHandler = e => {
      handleBackspace(selectedIndex, e)
    }

    const tabHandler = e => {
      e.preventDefault()
      increaseIndent(selectedIndex)
    }

    const shiftTabHandler = e => {
      e.preventDefault()
      decreaseIndent(selectedIndex)
    }

    const testHandler = e => {
      test(selectedIndex)  
    }

    keyboardJS.bind('enter', enterHandler)
    keyboardJS.bind(['up', 'down'], arrowKeyHandler)
    keyboardJS.bind('delete', deleteHandler)
    keyboardJS.bind('tab', tabHandler)
    keyboardJS.bind('shift + tab', shiftTabHandler)
    keyboardJS.bind('backspace', backspaceHandler)
    keyboardJS.bind('space', testHandler)



    return () => {
      keyboardJS.unbind('enter', enterHandler)
      keyboardJS.unbind(['up', 'down'], arrowKeyHandler)
      keyboardJS.unbind('delete', deleteHandler)
      keyboardJS.unbind('tab', tabHandler)
      keyboardJS.unbind('shift + tab', shiftTabHandler)
      keyboardJS.unbind('backspace', backspaceHandler)
      keyboardJS.unbind('space', testHandler)

    }
  }