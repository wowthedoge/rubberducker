import React, { useState, useEffect, useRef, forwardRef, memo, useCallback } from 'react';
import './App.css';
import { TextLine } from './TextLine'
import 'reactflow/dist/style.css';
import detectKeypress from './keypresses.js'


import DragSelect from 'dragselect'

let AppStyle = {
  backgroundColor: '#F0EEED',
  width: '100vw',
  height: '100vh',
}

const App = () => {


  const initialTextLineId = 1
  const [textLines, setTextLines] = useState([{ _id: initialTextLineId, indent: 0, text: "", parent: null, children: [] }]) //list of TextLineData objects

  useEffect(() => {
    // load history from database
    const getPreviousTextLines = async () => {
      await fetch("http://localhost:5050/page")
        .then(dbTextLines => dbTextLines.json())
        .then(dbTextLines => {
          // if there are lines to be loaded
          if (dbTextLines.length > 0) {
            dbTextLines = dfs(dbTextLines)
            // set selected to the last one
            selectedId.current = dbTextLines[dbTextLines.length - 1]._id
            setTextLines(dbTextLines)
          }
        })
        .catch(e => console.log(e))
    }
    getPreviousTextLines()
  }, [])


  const dfs = (textLines) => {
    // dfs for displaying lines in order
    const root = textLines.find(tl => tl.parent === null)
    let stack = []
    let res = []
    stack.push(root)
    while (stack.length > 0) {
      const current = stack.shift()
      res.push(current)
      const children = current.children.map(child => textLines.find(tl => tl._id === child))
      stack = children.concat(stack)
    }
    return res
  }


  // ----- Add TextLine ----- //
  const addTextLine = () => {
    const newId = textLines.length + 1
    const selectedIndex = textLines.findIndex(tl => tl._id === selectedId.current)
    const newTextLines = [...textLines.slice(0, selectedIndex + 1),
    { _id: newId, indent: 0, text: "", parent: textLines[0]._id, children: [] },
    ...textLines.slice(selectedIndex + 1)]
    newTextLines[0].children.push(newId)
    setTextLines(newTextLines)
  }

  // scroll to new TextLine
  const endingRef = useRef(null)
  useEffect(() => {
    if (endingRef.current) { endingRef.current.scrollIntoView() }
  })


  // ----- Detect Keypress ----- //
  useEffect(() => detectKeypress(addTextLine, increaseIndent, decreaseIndent, handleBackspace))

  // ----- DB methods ------ //
  // create document in db
  // receives new Id as response
  const createInDB = async (oldId) => {
    // triggered when unfocusing on textLine
    const textLine = textLines.find(tl => tl._id === oldId)
    await fetch("http://localhost:5050/page", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: textLine.text,
        indent: textLine.indent,
        parent: textLine.parent,
      })
    })
      .then(response => response.json())
      .then(dbResponse => updateId(oldId, dbResponse.id))
      .catch(e => console.log(e))
  }

  const editInDB = async (id, newText, time) => {
    await fetch("http://localhost:5050/page", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body:
        JSON.stringify({
          id: id,
          text: newText,
          time: time,
        }),
    })
      .catch(e => console.log(e))
  }

  const deleteInDB = async (ids) => {
    await fetch("http://localhost:5050/page", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids: ids
      }),
    }).then(dbTextLines => dbTextLines.json())
      .then(dbTextLines => {
        // if there are lines to be loaded
        if (dbTextLines.length > 0) {
          dbTextLines = dfs(dbTextLines)
          // set selected to the last one
          selectedId.current = dbTextLines[dbTextLines.length - 1]._id
          setTextLines(dbTextLines)
        }
      })
      .catch(e => console.log(e))
  }

  // update ID in refs and textLines
  const updateId = (oldId, newId) => {
    textLineRefs.current[newId] = textLineRefs.current[oldId]
    delete textLineRefs[oldId]
    setTextLines(textLines.map(textLine => {
      const newTextLine = { ...textLine }
      if (newTextLine._id === oldId) newTextLine._id = newId
      if (newTextLine.parent === oldId) newTextLine.parent = newId
      newTextLine.children = newTextLine.children.map(id => id === oldId ? newId : id)
      return newTextLine
    }))
  }

  const decreaseIndent = () => {
    console.log("decrease indent for", selectedId.current)
    const newTextLines = [...textLines]
    const selected = newTextLines.find(tl => tl._id === selectedId.current)
    if (selected.indent > 0) selected.indent -= 1
    setTextLines(newTextLines)
  }

  const increaseIndent = () => {
    console.log("increase indent for", selectedId.current)
    const newTextLines = [...textLines]
    const selected = newTextLines.find(tl => tl._id === selectedId.current)
    selected.indent += 1
    setTextLines(newTextLines)
  }

  const handleBackspace = () => {
    console.log("handleBackspace")
    const current = textLines.find(tl => tl._id === selectedId.current)
    if (current.text.length === 0) {
      if (current.indent > 0) decreaseIndent()
      else deleteTextLines([selectedId.current])
    }
  }

  // ----- TextLine Selecting & Focus ----- //
  const textLineRefs = useRef({}) //{_id: ref}
  const selectedId = useRef(initialTextLineId)

  const storeNewRef = (_id, ref) => {
    if (ref !== null && !(_id in textLineRefs.current)) {
      textLineRefs.current[_id] = ref
      ref.focus()
      selectedId.current = _id
    }
  }


  const deleteTextLines = (ids) => {

    // prevent deleting root
    ids.filter(id => id !== textLines[0]._id)
    console.log("deleteTextLines", ids)
    const newTextLines = textLines
      .filter(textLine => !ids.includes(textLine._id))
      //remove in children
      .map(textLine => { return { ...textLine, children: textLine.children.filter(c => !ids.includes(c)) } })
    newTextLines.forEach(tl => tl.children.filter(c => !ids.includes(c)))
    ids.forEach(id => delete textLineRefs.current[id])

    // Focusing on a replacement
    let replacementIndex = textLines.findIndex(tl => tl._id === selectedId.current)
    if (replacementIndex === newTextLines.length) replacementIndex -= 1
    const newSelected = newTextLines[replacementIndex]
    selectedId.current = newSelected._id
    textLineRefs.current[newSelected._id].focus()
    const DBids = ids.filter(id => id.length === 24)
    deleteInDB(DBids)
    //sethighlighted(getAllChildren(newSelected._id))
    setTextLines(newTextLines)
  }

  const changeHighlights = (key) => {
    const selected = textLines.find(tl => selectedId.current === tl._id)
    const parent = textLines.find(tl => tl._id === selected.parent)
    switch (key) {
      case 'ArrowUp':
        // previous sibling, or parent

        if (selected.parent !== null) { // if not at root
          // if currently selected is first child
          if (selected._id === parent.children[0]) {
            // go to parent
            selectedId.current = parent._id
            console.log("up, go to parent", parent._id)
            textLineRefs.current[parent._id].focus()
            //sethighlighted(getAllChildren(parent._id))
          } else { // if currently selected is not first child
            // go to previous sibling
            const indexAsChild = parent.children.findIndex(c => c === selected._id)
            const previousSiblingId = parent.children[indexAsChild - 1]
            selectedId.current = previousSiblingId
            console.log("up, go to previous sibling", previousSiblingId)

            textLineRefs.current[previousSiblingId].focus()
            //sethighlighted(getAllChildren(previousSiblingId))
          }
        }

        break
      case 'ArrowDown':
        // next sibling, or sibling of parent

        // if at root, target second textLine
        if (selected._id === textLines[0]._id) {
          selectedId.current = textLines[1]._id
          textLineRefs.current[textLines[1]._id].focus()
          //sethighlighted(getAllChildren(textLines[1]._id))
          break
        }
        //if parent is root, target sibling of root
        if (parent._id === textLines[0]._id) {
          const root = textLines[0]
          const indexAsChild = root.children.findIndex(c => c === selected._id)
          // if not the last child
          if (indexAsChild !== root.children.length - 1) {
            const siblingId = root.children[indexAsChild + 1]
            selectedId.current = siblingId
            textLineRefs.current[siblingId].focus()
            //sethighlighted(getAllChildren(siblingId))
            break
          } else { // if the last child
            if (selected.children.length > 0) { // if has children, go to first child
              const firstChildId = selected.children[0]
              selectedId.current = firstChildId
              textLineRefs.current[firstChildId].focus()
              // sethighlighted(getAllChildren(firstChildId))
              break
            }
          }
          break
        }
        // if currently selected is last child
        if (selected._id !== textLines[textLines.length - 1]._id) { // if not at last textLine

          if (selected._id === parent.children[parent.children.length - 1]) {
            // go to sibling of parent
            const grandparent = textLines.find(tl => tl._id === parent.parent)
            const parentIndex = grandparent.children.findIndex(p => p === parent._id)
            const siblingOfParentId = grandparent.children[parentIndex + 1]
            selectedId.current = siblingOfParentId
            textLineRefs.current[siblingOfParentId].focus()
            // sethighlighted(getAllChildren(siblingOfParentId))
          } else {
            // go to next sibling
            const indexAsChild = parent.children.findIndex(c => c === selected._id)
            const nextSiblingId = parent.children[indexAsChild + 1]
            selectedId.current = nextSiblingId
            textLineRefs.current[nextSiblingId].focus()
            // sethighlighted(getAllChildren(nextSiblingId))
          }
        }
        break
      case 'ArrowLeft':
        //  go to parent
        if (selected.parent !== null) {

          selectedId.current = parent._id
          textLineRefs.current[parent._id].focus()
          // sethighlighted(getAllChildren(parent._id))
        }
        break
      case 'ArrowRight':
        // go to child
        if (selected.children.length > 0) {
          const childId = selected.children[0]
          selectedId.current = childId
          textLineRefs.current[childId].focus()
          // sethighlighted(getAllChildren(childId))
        }
        break
      default:
        break
    }
  }


  const [path, setpath] = useState([])

  const getParentPath = (id) => {
    const newPath = []
    newPath.push(id)
    let current = textLines.find(tl => tl._id === id)
    while (current.parent !== null) {
      newPath.push(current.parent)
      current = textLines.find(tl => tl._id === current.parent)
    }
    setpath(newPath)
  }

  const getAllChildren = (id) => {
    // not in order
    let stack = []
    let res = []
    const first = textLines.find(tl => tl._id === id)
    if (first.children.length === 0) return [first._id]
    stack.push(first)
    while (stack.length > 0) {
      const current = stack.pop()
      stack = stack.concat(current.children.map(c => textLines.find(tl => tl._id === c)))
      res.push(current._id)
    }
    return res // returns all ids (not objects)
  }


  // ----- Drag Select ----- //
  const [selectedItems, setSelectedItems] = useState([]);
  const ds = new DragSelect({
    selectables: document.getElementsByClassName("box"),
    draggability: false
  });

  useEffect(() => {
    ds.subscribe("callback", (e) => {
      if (e.items.length > 0) {
        setSelectedItems(e.items)
        selectedId.current  = e.items[e.items.length-1].getAttribute('data-info')
      }
    });

    return () => {
      ds.unsubscribe();
    };
  }, []);

  // ----- render ----- //
  return (

    <div className="App" style={AppStyle}>
      <AppBar />


        {textLines.map((textLine, index) =>
          <TextLine
            key={textLine._id}
            indent={textLine.indent}
            numbering={index + 1}
            data={textLine}
            createInDB={createInDB}
            editInDB={editInDB}
            storeNewRef={storeNewRef}
            //isHighlighted={highlighted.includes(textLine._id)}
            isPath={path.includes(textLine._id)}
            isSelected={selectedItems.includes(textLine._id)}
          />
        )}
      <div ref={endingRef}></div>
    </div>
  )
}



const AppBar = () => {
  const AppBarStyle = {
    height: '50px',
    background: 'linear-gradient(to bottom, white, gray)',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'Impact',
    fontSize: '1.3rem',
    paddingLeft: '30px',
    WebkitUserSelect: 'none', /* For WebKit-based browsers */
    MozUserSelect: 'none', /* For Firefox */
    msUserSelect: 'none', /* For Microsoft Edge */
    userSelect: 'none',
  }
  return (
    <div style={AppBarStyle}>
      RUBBERDUCKER
    </div>
  )
}










export default App;
