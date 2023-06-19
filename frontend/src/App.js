import React, { useState, useEffect, useRef, forwardRef, memo, useCallback } from 'react';
import keyboardJS from 'keyboardjs';
import './App.css';
import { TextLine } from './TextLine'
import { ArcherContainer, ArcherElement } from "react-archer";
import 'reactflow/dist/style.css';


import DragSelect from 'dragselect'

let AppStyle = {
  backgroundColor: '#091833',
  width: '100vw',
  height: '100vh',
}

const App = () => {


  // load history from database
  const initialTextLineId = 1
  const [textLines, setTextLines] = useState([{ _id: initialTextLineId, indent: 0, text: "", parent: null, children: [] }]) //list of TextLineData objects

  useEffect(() => {
    const getPreviousTextLines = async () => {
      await fetch("http://localhost:5050/page")
        .then(dbTextLines => dbTextLines.json())
        .then(dbTextLines => {
          // if there are lines to be loaded
          if (dbTextLines.length > 0) {
            dbTextLines = dfs(dbTextLines)
            // set selected to the last one
            selectedInputId.current = dbTextLines[dbTextLines.length - 1]._id
            setTextLines(dbTextLines)
          }
        })
        .catch(e => console.log(e))
    }
    getPreviousTextLines()
  }, [])


  const dfs = (textLines) => {
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
  /*
  Detect keypress
  add new textLine following currently selected textLine in state textLines
  set newlyAddedId
  rerender
  storeNewRef
  focus on new TextLine
  (upon unfocusing)
  post request to db, create
  update id
  */
  const addTextLine = (isChild) => {
    const selected = textLines.find(tl => tl._id === selectedInputId.current)
    // add only if current selected is not empty
    if (selected.text.length > 0) {
      const newId = textLines.length + 1
      if (isChild) {
        // add below lastChild's lastChild
        // if self has no children, add below self
        let addingIndex = textLines.findIndex(tl => tl._id === selected._id)
        // if self has children, add below lastChild
        if (selected.children.length > 0) {
          const lastChild = textLines.find(tl => tl._id === selected.children[selected.children.length - 1])
          addingIndex = textLines.findIndex(tl => tl._id === lastChild._id)
          // if lastChild has children add below its last child
          if (lastChild.children.length > 0) {
            const lastChildslastChild = textLines.find(tl => tl._id === lastChild.children[lastChild.children.length - 1])
            addingIndex = textLines.findIndex(tl => tl._id === lastChildslastChild._id)
          }
        }
        const parent = selected
        const newTextLines = [...textLines.slice(0, addingIndex + 1),
        { _id: newId, indent: parent.indent + 1, text: "", parent: parent._id, children: [] },
        ...textLines.slice(addingIndex + 1)]
        newTextLines.find(tl => tl._id === parent._id).children.push(newId)
        setTextLines(newTextLines)
      } else { // is sibling
        if (selected.parent === null) return
        // add below lastSibling's lastchild
        const parent = textLines.find(tl => tl._id === selected.parent)
        const lastSibling = textLines.find(tl => tl._id === parent.children[parent.children.length - 1])
        // if last sibling has no children add below last sibling
        let addingIndex = textLines.findIndex(tl => tl._id === lastSibling._id)
        // if last sibling has children add it below the last child
        if (lastSibling.children.length > 0) {
          const lastChild = textLines.find(tl => tl._id === lastSibling.children[lastSibling.children.length - 1])
          addingIndex = textLines.findIndex(tl => tl._id === lastChild._id)
        }
        const newTextLines = [...textLines.slice(0, addingIndex + 1),
        { _id: newId, indent: parent.indent + 1, text: "", parent: parent._id, children: [] },
        ...textLines.slice(addingIndex + 1)]
        newTextLines.find(tl => tl._id === parent._id).children.push(newId)
        setTextLines(newTextLines)
      }
    }
  }
  // scroll to new TextLine
  const endingRef = useRef(null)
  useEffect(() => {
    if (endingRef.current) { endingRef.current.scrollIntoView() }
  })


  // ----- Detect Keypress ----- //
  useEffect(() => {
    const enterHandler = e => {
      addTextLine(true)
    }

    const shiftEnterHandler = e => {
      addTextLine(false)
    }

    const arrowKeyHandler = e => {
      e.preventDefault()
      console.log("pressed", e.key)
      changeHighlights(e.key)
    }

    const deleteHandler = e => {
      deleteTextLines(highlighted)
    }

    const tabHandler = e => {
      e.preventDefault()
      console.log("tab pressed")
    }



    keyboardJS.bind('enter', enterHandler)
    keyboardJS.bind('shift + enter', shiftEnterHandler)
    keyboardJS.bind(['right', 'left', 'up', 'down'], arrowKeyHandler)
    keyboardJS.bind('delete', deleteHandler)
    keyboardJS.bind('tab', tabHandler)

    return () => {
      keyboardJS.unbind('enter', enterHandler)
      keyboardJS.unbind('shift + enter', shiftEnterHandler)
      keyboardJS.unbind(['right', 'left', 'up', 'down'], arrowKeyHandler)
      keyboardJS.unbind('delete', deleteHandler)
      keyboardJS.unbind('tab', tabHandler)



    }
  })

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

  const editInDB = async (id, newText) => {
    await fetch("http://localhost:5050/page", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: id,
        text: newText,
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
          selectedInputId.current = dbTextLines[dbTextLines.length - 1]._id
          setTextLines(dbTextLines)
        }
      })
      .catch(e => console.log(e))
  }



  // ----- TextLine Selecting & Focus ----- //
  const textLineRefs = useRef({}) //{_id: ref}
  const selectedInputId = useRef(initialTextLineId)
  const [highlighted, sethighlighted] = useState([])

  const storeNewRef = (_id, ref) => {
    if (ref !== null && !(_id in textLineRefs.current)) {
      textLineRefs.current[_id] = ref
      ref.focus()
      selectedInputId.current = _id
      sethighlighted(getAllChildren(_id))
    }
  }

  const handleClick = (id) => {
    console.log(textLines.find(tl => tl._id === id))
    selectedInputId.current = id
    sethighlighted(getAllChildren(id))
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
    let replacementIndex = textLines.findIndex(tl => tl._id === selectedInputId.current)
    if (replacementIndex === newTextLines.length) replacementIndex -= 1
    const newSelected = newTextLines[replacementIndex]
    selectedInputId.current = newSelected._id
    textLineRefs.current[newSelected._id].focus()
    const DBids = ids.filter(id => id.length === 24)
    deleteInDB(DBids)
    sethighlighted(getAllChildren(newSelected._id))
    setTextLines(newTextLines)
  }

  const changeHighlights = (key) => {
    const selected = textLines.find(tl => selectedInputId.current === tl._id)
    const parent = textLines.find(tl => tl._id === selected.parent)
    switch (key) {
      case 'ArrowUp':
        // previous sibling, or parent

        if (selected.parent !== null) { // if not at root
          // if currently selected is first child
          if (selected._id === parent.children[0]) {
            // go to parent
            selectedInputId.current = parent._id
            console.log("up, go to parent", parent._id)
            textLineRefs.current[parent._id].focus()
            sethighlighted(getAllChildren(parent._id))
          } else { // if currently selected is not first child
            // go to previous sibling
            const indexAsChild = parent.children.findIndex(c => c === selected._id)
            const previousSiblingId = parent.children[indexAsChild - 1]
            selectedInputId.current = previousSiblingId
            console.log("up, go to previous sibling", previousSiblingId)

            textLineRefs.current[previousSiblingId].focus()
            sethighlighted(getAllChildren(previousSiblingId))
          }
        }

        break
      case 'ArrowDown':
        // next sibling, or sibling of parent

        // if at root, target second textLine
        if (selected._id === textLines[0]._id) {
          selectedInputId.current = textLines[1]._id
          textLineRefs.current[textLines[1]._id].focus()
          sethighlighted(getAllChildren(textLines[1]._id))
          break
        }
        //if parent is root, target sibling of root
        if (parent._id === textLines[0]._id) {
          const root = textLines[0]
          const indexAsChild = root.children.findIndex(c => c === selected._id)
          // if not the last child
          if (indexAsChild !== root.children.length - 1) {
            const siblingId = root.children[indexAsChild + 1]
            selectedInputId.current = siblingId
            textLineRefs.current[siblingId].focus()
            sethighlighted(getAllChildren(siblingId))
            break
          } else { // if the last child
            if (selected.children.length > 0) { // if has children, go to first child
              const firstChildId = selected.children[0]
              selectedInputId.current = firstChildId
              textLineRefs.current[firstChildId].focus()
              sethighlighted(getAllChildren(firstChildId))
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
            selectedInputId.current = siblingOfParentId
            textLineRefs.current[siblingOfParentId].focus()
            sethighlighted(getAllChildren(siblingOfParentId))
          } else {
            // go to next sibling
            const indexAsChild = parent.children.findIndex(c => c === selected._id)
            const nextSiblingId = parent.children[indexAsChild + 1]
            selectedInputId.current = nextSiblingId
            textLineRefs.current[nextSiblingId].focus()
            sethighlighted(getAllChildren(nextSiblingId))
          }
        }
        break
      case 'ArrowLeft':
        //  go to parent
        if (selected.parent !== null) {

          selectedInputId.current = parent._id
          textLineRefs.current[parent._id].focus()
          sethighlighted(getAllChildren(parent._id))
        }
        break
      case 'ArrowRight':
        // go to child
        if (selected.children.length > 0) {
          const childId = selected.children[0]
          selectedInputId.current = childId
          textLineRefs.current[childId].focus()
          sethighlighted(getAllChildren(childId))
        }
        break
      default:
        break
    }
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


  // // ----- Drag Select ----- //
  // const [selectedItems, setSelectedItems] = useState([]);
  // const ds = new DragSelect({
  //   selectables: document.getElementsByClassName("box"),
  //   draggability: false
  // });

  // useEffect(() => {
  //   ds.subscribe("callback", (e) => {
  //     //e.items.forEach(item => console.log("dragSelect: ", item.getAttribute('data-info')))
  //     setSelectedItems(e.items)
  //   });

  //   return () => {
  //     ds.unsubscribe();
  //   };
  // }, []);

  // ----- render ----- //
  return (

    <div className="App" style={AppStyle}>
      <ArcherContainer
        endMarker={false}
        lineStyle='straight'
      >
        <ArcherElement id="dummy"
        >
          <div>dummy</div>
        </ArcherElement>

        {textLines.map((textLine) =>

          <TextLine
            key={textLine._id}
            indent={textLine.indent}
            data={textLine}
            handleClick={handleClick}
            createInDB={createInDB}
            editInDB={editInDB}
            storeNewRef={storeNewRef}
            deleteTextLine={deleteTextLines}
            isHighlighted={highlighted.includes(textLine._id)}
          />
        )}
      </ArcherContainer>
      <div ref={endingRef}></div>
    </div>
  )
}














export default App;
