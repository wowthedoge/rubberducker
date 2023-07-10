import { useEffect, useRef, useState } from "react"


const TextLine = ({ index, indent, text, setText, savedTime, lastChildIndex, isSelected, pathLength, selectNew, saveTime }) => {
    const verticalLineLength = lastChildIndex - index

    const inputStyle = {
        width: '50%',
        height: '100%',
        backgroundColor: 'transparent',
        resize: 'none',
        fontSize: '1rem',
        overflow: 'hidden',
        overflowWrap: 'break-word',
        fontWeight: isSelected || pathLength > 0 ? 'bold' : 'normal',
        color: 'black',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        border: 'none',
        outline: 'none',
        marginLeft: indent * 6 + '%',
        fontFamily: 'Fira Code, monospace',

    }

    const textLineStyle = {
        height: '30px',
        paddingLeft: '10%',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: isSelected ? '#D9D9D9' : 'white',
    }

    const horizontalLineStyle = {
        position: 'relative',
        left: indent > 0 ? 2 + (indent - 1) * 6 + '%' : '-12%',
        top: '15px',
        width: indent > 0 ? '3%' : '11%',
        borderBottom: isSelected || pathLength > 0 ? '3px solid black' : '1px solid black',
    }

    const verticalLineContainer = {
        position: 'relative',
        top: '29.5px',
        left: 2 + indent * 6 + '%',

    }

    const verticalLineFirstHalfLengthPx = () => {
        return pathLength > 0 ? (pathLength - 1) * 30 + 16 : 0
    }

    const verticalLineFirstHalf = {
        borderLeft: '3px solid black',
        margin: '0',
        padding: '0',
        height: verticalLineFirstHalfLengthPx() + 'px'
    }

    const verticalLineSecondHalf = {
        borderLeft: '1px solid black',
        margin: '0',
        padding: '0',
        height: (verticalLineLength * 30 - 14) - verticalLineFirstHalfLengthPx() + 'px'
    }

    const horizontalContainer = {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',  
        height: '100%',
    }

    const timeStyle = {
        fontFamily: 'Fira Code, monospace',

        position: 'absolute',
        top: indent > 0 ? '-10px' : '-18px',
        right: indent > 0 ? '28px' : '0px',
        color: 'gray',
        fontSize: isSelected ? '0.75rem' : '0.6rem',
    }

    const inputRef = useRef(null)

    useEffect(() => {
        if (isSelected) inputRef.current.focus()
    }, [isSelected])

    const handleInput = (e) => {
        setText(index, e.target.value)
    }

    const [time, setTime] = useState(savedTime)

    useEffect(() => {
        if (pathLength > 0 || isSelected) {
            const interval = setInterval(() => {
                setTime(time + 1)
                saveTime(index, time + 1)
            }, 1000)
            return () => clearInterval(interval)
        }
    })

    const hours = String(Math.floor(time / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');

    return (
        <div className="box" style={textLineStyle} data-info={index} onClick={() => { selectNew(index) }}>

            {verticalLineLength > 0 &&
                <div style={verticalLineContainer}>
                    <div style={verticalLineFirstHalf} />
                    <div style={verticalLineSecondHalf} />
                </div>
            }
            <div style={horizontalContainer}>
                {(text.length > 0 || isSelected) && <div style={horizontalLineStyle}>
                    {(isSelected || pathLength > 0) && <div style={timeStyle}>{time>3600&&hours+":"}{minutes}:{seconds}</div>}
                </div>}
                <input type="text" defaultValue={text} style={inputStyle} ref={inputRef} onInput={handleInput} />
            </div>
        </div>
    )
}

export { TextLine }