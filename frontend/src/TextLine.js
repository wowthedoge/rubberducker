import { useRef, forwardRef, useEffect, useState } from 'react'
import DragSelect from 'dragselect'
import './App.css';
import { ArcherElement } from 'react-archer';

const backgroundColor = "#a7a195"
const textColor = "#303030"
const accentColor = "#055E68"

const TextLine = ({ indent, numbering, data, createInDB, editInDB, storeNewRef, isPath, isSelected }) => {

    const numberingStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#d6b59f',
        height: '100%',
        minWidth: '30px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#73675f ',
        WebkitUserSelect: 'none', /* For WebKit-based browsers */
        MozUserSelect: 'none', /* For Firefox */
        msUserSelect: 'none', /* For Microsoft Edge */
        userSelect: 'none',
    }



    const inputStyle = {
        width: '50%',
        backgroundColor: 'transparent',
        resize: 'none',
        fontSize: '1rem',
        overflow: 'hidden',
        overflowWrap: 'break-word',
        fontFamily: 'monospace',
        color: textColor,
        padding: '0.2rem',
        paddingLeft: '1rem',
        appearance: 'none',
        WebkitAppearance: 'none', // For Safari and other WebKit-based browsers
        MozAppearance: 'none', // For Firefox
        border: 'none', // Optional: remove border
        outline: 'none',
        marginLeft: 60*indent + 'px'

    }

    const textLineStyle = {
        backgroundColor: backgroundColor,
        display: 'flex',
        height: '30px',

    }

    // const markerStyle = {
    //     height: '100%',
    //     width: '20px',
    //     marginLeft: 40*indent + 'px',
    //     borderLeft: '3px solid black',
    //     display: 'flex',
    //     alignItems: 'center',
    // }

    // const innerMarkerStyle = {
    //     marginTop: 'auto',
    //     marginBottom: 'auto',
    //     border: '1px solid black',
    //     width: '100%',
    // }


    const textHasChanged = useRef(false)
    // onBlur
    const handleBlur = () => {
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

    const [time, settime] = useState(isNaN(data.time) ? 0 : data.time)

    useEffect(() => {
        if (isPath) {
            const interval = setInterval(() => settime(time + 1), 1000)
            if (time % 60 === 0) editInDB(data._id, null, time)
            return () => clearInterval(interval)
        }
    })

    const minutes = String(Math.floor(time / 60)).padStart(2, '0')
    const seconds = String(time % 60).padStart(2, '0')

    // const branches = () => {
    //     if (indent > 0) {
    //         return (
    //             <div style={markerStyle}>
    //                 <div style={innerMarkerStyle}> </div>
    //             </div>
    //         )
    //     }

    // }

    return (
        <div className="box" onClick={() => { }} onBlur={handleBlur} data-info={data._id} style={textLineStyle}>

            <div style={numberingStyle}> {numbering} </div>

            <input type="text" defaultValue={data.text} onChange={handleChange} style={inputStyle} ref={ref => handleRef(ref)}>
            </input>
        </div>
    )
}

export { TextLine };