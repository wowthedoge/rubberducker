import React, { useState, useEffect, useRef, forwardRef, memo, useCallback } from 'react';
import keyboardJS from 'keyboardjs';
import './App.css';

let AppStyle = {
  backgroundColor: 'rgba(100, 100, 80, 0.1)',
  width: '100vw',
  height: '100vh',
}

const TextLineData = {
  id: null,
  ref: null,
  indent: 0,
}

const App = () => {

  const initialTextLineId = 1
  const [textLines, setTextLines] = useState([{ id: initialTextLineId, indent: 0 }]) //list of TextLineData objects


  // ----- Add TextLine ----- //
  // add TextLine
  const newlyAddedId = useRef(initialTextLineId)
  const addTextLine = (addIndent) => {
    const indexSelected = textLines.findIndex(textLine => textLine.id === idSelected.current)
    const selected = textLines[indexSelected]
    const newId = textLines.length + 1
    newlyAddedId.current = newId

    if (addIndent) {
      setTextLines([...textLines.slice(0, indexSelected + 1), { id: newId, indent: selected.indent + 1 }, ...textLines.slice(indexSelected + 1)])
    } else {
      setTextLines([...textLines.slice(0, indexSelected + 1), { id: newId, indent: selected.indent }, ...textLines.slice(indexSelected + 1)])
    }
  }
  // // detect Keypress
  useEffect(() => {
    const enterHandler = e => {
      addTextLine(false)
    }

    const shiftEnterHandler = e => {
      addTextLine(true)
    }

    keyboardJS.bind('enter', enterHandler)
    keyboardJS.bind('shift + enter', shiftEnterHandler)
    return () => {
      keyboardJS.unbind('enter', enterHandler)
      keyboardJS.unbind('shift + enter', shiftEnterHandler)
    }
  })
  // scroll to new TextLine
  const endingRef = useRef(null)
  useEffect(() => {
    if (endingRef.current) { endingRef.current.scrollIntoView() }
  })



  // ----- TextLine Selecting & Focus ----- //
  const textLineRefs = useRef([]) //{id, ref}
  const idSelected = useRef(initialTextLineId)

  const storeNewRef = ({ id, ref }) => {
    if (ref != null) {
      textLineRefs.current.push({ id, ref })
      ref.focus()
      idSelected.current = id
    }
  }

  const handleClick = (id) => {
    idSelected.current = id
  }


  // ----- render ----- //
  return (
    <div className="App" style={AppStyle}>
      {textLines.map((textLine) => textLine.id === newlyAddedId.current ?
        <TextLine key={textLine.id}
          indent={textLine.indent}
          data={textLine}
          handleClick={handleClick}
          ref={ref => storeNewRef({ id: textLine.id, ref: ref })}
        /> :
        <TextLine key={textLine.id}
          indent={textLine.indent}
          data={textLine}
          handleClick={handleClick}
        />
      )}
      <div ref={endingRef}></div>
    </div>
  )
}











const TextLine = forwardRef(({ indent, data, handleClick }, ref) => {
  let TextLineStyle = {
    width: '50%',
    borderBottom: '1px solid black',
    borderTop: '1px solid black',
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    padding: '0px',
    resize: 'none',
    minHeight: '10px',
    fontSize: '1.2rem',
    overflow: 'hidden',
    overflowWrap: 'break-word',
    fontFamily: 'monospace',
    marginLeft: indent * 20 + 'px',
  }
  return (
    <div onClick={() => handleClick(data.id)}>
      <input className="TextBox" type="text" value={JSON.stringify(data)} onChange={() => { }} style={TextLineStyle} ref={ref}>
      </input>
    </div>
  )
})

export default App;
