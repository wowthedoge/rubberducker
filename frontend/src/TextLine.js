import { useRef, forwardRef, useEffect, useState } from 'react'
import DragSelect from 'dragselect'
import './App.css';
import { ArcherElement } from 'react-archer';


const TextLine = ({ indent, data, handleClick, createInDB, editInDB, storeNewRef, deleteTextLine, isHighlighted, isPath }) => {

    const inputStyle = {
        width: '50%',
        borderBottom: '1px solid black',
        borderTop: '1px solid black',
        backgroundColor: 'transparent',
        resize: 'none',
        fontSize: '1rem',
        overflow: 'hidden',
        overflowWrap: 'break-word',
        fontFamily: 'monospace',
        color: '#0abdc6',
        borderRadius: '20px',
        borderColor: '#0abdc6',
        padding: '0.2rem',
        paddingLeft: '1rem'

    }

    const textLineStyle = {
        backgroundColor: isHighlighted ? '#0c2251' : 'transparent',
        marginBottom: '3px',
        display: 'flex',
        height: '30px',

    }

    const rightMarkerStyle = {
        height: '100%',
        width: '50px',
        marginLeft: indent > 0? '40px':'0',
        fontFamily: 'monospace',
        color: isPath?'white':'#0abdc6',
    }

    const leftMarkerStyle = {
        height: '100%',
        marginLeft: indent > 1? (indent-1)*40 + 'px':'0'
    }


    const textHasChanged = useRef(false)
    // onBlur
    const handleBlur = () => {
        // if (data.text.length === 0) {
        //     deleteTextLine([data._id])
        // }
        // if text has changed
        if (textHasChanged.current) {
            // if not saved in DB
            if (data._id.length !== 24) {
                textHasChanged.current = false
                createInDB(data._id)
            }
            // if saved in DB
            else {
                textHasChanged.current = false
                editInDB(data._id, data.text, null)
            }
        }
    }

    const handleRef = ref => {
        storeNewRef(data._id, ref)
    }



    const handleChange = (e) => {
        if (!textHasChanged.current) textHasChanged.current = true
        data.text = e.target.value
    }

    const [time, settime] = useState(data.time)

    useEffect(() => {
        if (isPath) {
            const interval = setInterval(() => settime(time+1), 1000)
            if (time%60===0) editInDB(data._id, null, time)
            return () => clearInterval(interval)
        }
            
    })

    const minutes = String(Math.floor(time/60)).padStart(2, '0')
    const seconds = String(time%60).padStart(2, '0')
    
    const relationsList = data.children.map(child => ({
        targetId: child + "MARKER",
        targetAnchor: 'middle',
        sourceAnchor: 'left',
        style: { strokeColor: isPath?'white':'#0abdc6', strokeWidth: 1 },
    })).concat({
        targetId: data._id + "MARKER",
        targetAnchor: 'middle',
        sourceAnchor: 'right',
        style: { strokeColor: isPath?'white':'#0abdc6', strokeWidth: 1 },
    })

    return (
        <div className="box" onClick={() => handleClick(data._id)} onBlur={handleBlur} data-info={data._id} style={textLineStyle}>
            <ArcherElement id={data._id + "MARKER"}>
                <div style={leftMarkerStyle}></div>
            </ArcherElement>


            <ArcherElement
                id={data._id}
                relations={relationsList}>
                {/* <p style={{color:'white'}}>{textLine._id}</p> */}
                <div style={rightMarkerStyle}> {minutes}:{seconds} </div>
            </ArcherElement>
            <input className="TextBox" type="text" defaultValue={data.text} onChange={handleChange} style={inputStyle} ref={ref => handleRef(ref)}>
            </input>
        </div>
    )
}

export { TextLine };