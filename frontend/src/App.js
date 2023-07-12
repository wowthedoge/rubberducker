import React, { useState, useEffect, useRef, forwardRef, memo, useCallback } from 'react'
import './App.css'
import { TextLine } from './TextLine'
import detectKeypress from './keypresses.js'
import { v4 as uuidv4 } from 'uuid'
import DragSelect from 'dragselect'

const App = () => {
    let AppStyle = {
        width: '100vw',
        height: '100vh',
    }

    const fetchedId = useRef(null)

    useEffect(() => {
        const getPreviousSaved = async () => {
            await fetch(process.env.MONGODB_URI + "/page")
                .then(res => res.json())
                .then(res => res[0])
                .then(res => {
                    const dbTextLines = JSON.parse(res.textLines)
                    if (dbTextLines.length > 0) {
                        setTextLines(dbTextLines)
                        fetchedId.current = res._id
                    } 
                })
                .catch(e => console.log(e))
        }
        getPreviousSaved()
    }, [])

    const [textLines, setTextLines] = useState([
        { indent: 0, text: "0", isSelected: false, pathLength: 0, time: 0 },
        { indent: 0, text: "1", isSelected: false, pathLength: 0, time: 0 },
        { indent: 1, text: "2", isSelected: false, pathLength: 0, time: 0 },
        { indent: 1, text: "3", isSelected: false, pathLength: 0, time: 0 },
        { indent: 2, text: "4", isSelected: false, pathLength: 0, time: 0 },
        { indent: 0, text: "5", isSelected: false, pathLength: 0, time: 0 },
    ])

    const selectedIndex = useRef(-1)

    useEffect(() => detectKeypress(
        selectedIndex.current,
        addTextLine,
        increaseIndent,
        decreaseIndent,
        handleBackSpace,
        changeFocus,
        saveInDB,
        test))

    const changeFocus = (direction, index) => {
        if (direction === 'up') {
            index > 0 && selectNew(index - 1)
        }
        if (direction === 'down') {
            index < textLines.length - 1 && selectNew(index + 1)
        }
    }

    const test = (index) => {
        console.log("last child index", calculateLastChildIndex(index))
    }

    const saveInDB = async () => {
        if (fetchedId.current === null) {
            await fetch(process.env.MONGODB_URI + "/page", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    textLines: textLines
                })
            })
                .then(res => res.json())
                .then(res => {fetchedId.current = res.id})
                .catch(e => console.log(e))
        } else {
            await fetch(process.env.MONGODB_URI + "/page", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: fetchedId.current,
                    textLines: JSON.stringify(textLines),
                })

            })
                .catch(e => console.log(e))
        }

    }

    const decreaseIndent = (index) => {
        if (textLines[index].indent > 0) {
            const newTextLines = [...textLines]
            newTextLines[index].indent -= 1
            setTextLines(newTextLines)
            setPath(index)
        } else {
            deleteTextLine(index)
        }
    }

    const increaseIndent = (index) => {

        const newTextLines = [...textLines]
        newTextLines[index].indent += 1
        setTextLines(newTextLines)
        setPath(index)
    }

    const handleBackSpace = (index, e) => {
        if (textLines[index].text.length === 0) {
            e.preventDefault()
            decreaseIndent(index)
        }
    }

    const setPath = (index) => {
        setTextLines(prevTextLines => {
            const newTextLines = [...prevTextLines]
            newTextLines.forEach(tl => tl.pathLength = 0)
            let lastIndent = newTextLines[index].indent
            let length = 0
            for (let i = index; i >= 0; i--) {
                const current = newTextLines[i]
                // found parent
                if (current.indent === lastIndent - 1 && current.text.length > 0) {
                    lastIndent = current.indent
                    current.pathLength = length
                    length = 0
                }
                // terminate
                if (current.indent === 0 && current.text.length > 0) break
                length++
            }
            return newTextLines
        }
        )
    }

    const selectNew = (index) => {
        console.log("selectNew", index)
        selectedIndex.current = index
        setTextLines(prevTextLines => {
            return prevTextLines.map((tl, i) => i === index ?
                { ...tl, isSelected: true } : { ...tl, isSelected: false })
        })
        setPath(index)
    }

    const addTextLine = (index) => {
        const indent = textLines[index].indent
        setTextLines([...textLines.slice(0, index + 1),
        { indent: indent, text: "", isSelected: false, pathLength: 0, time: 0 },
        ...textLines.slice(index + 1)])
        selectNew(index + 1)
    }

    const deleteTextLine = (index) => {
        setTextLines(prevTextLines => {
            const newTextLines = prevTextLines.filter((tl, i) => i !== index)
            selectNew(index - 1)
            return newTextLines
        })
    }

    const setText = (index, text) => {
        setTextLines(textLines.map((tl, i) => i === index ? { ...tl, text: text } : tl))
    }

    const saveTime = (index, time) => {
        setTextLines(prevTextLines => prevTextLines.map((tl, i) => i === index ? { ...tl, time: time } : tl))
    }

    useEffect(() => selectNew(2), [])

    const calculateLastChildIndex = (index) => {
        const indent = textLines[index].indent
        let res = index
        // find last child
        for (let i = index + 1; i < textLines.length; i++) {
            const current = textLines[i]
            // progress if empty
            if (current.text.length === 0) continue
            // found child
            if (current.indent === indent + 1) res = i
            // terminate loop
            if (current.indent === indent) {
                return res
            }
            if (current.indent === 0) {
                return res
            }
        }
        return res
    }

    return (
        <div style={AppStyle}>
            <AppBar />
            {textLines.map((textLine, index) =>
                <TextLine
                    key={uuidv4()}
                    index={index}
                    indent={textLine.indent}
                    text={textLine.text}
                    setText={setText}
                    lastChildIndex={calculateLastChildIndex(index)}
                    isSelected={textLine.isSelected}
                    pathLength={textLine.pathLength}
                    savedTime={textLine.time}
                    selectNew={selectNew}
                    saveTime={saveTime}
                />)}
        </div>
    )
}

const AppBar = () => {
    const AppBarStyle = {
        height: '75px',
        width: '100%',
        borderBottom: '1px solid black',
        paddingLeft: '10%',
        margin: '0',
        fontFamily: "'Oswald', Impact, sans-serif"
    }

    return (
        <div style={AppBarStyle}>
            <h1> RUBBERDUCKER </h1>
        </div>
    )
}

export default App

