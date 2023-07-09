import { useEffect, useRef } from "react"


const TextLine = ({ index, indent, text, setText, lastChildIndex, isSelected, pathLength, selectNew }) => {

    const verticalLineLength = lastChildIndex - index

    const inputStyle = {
        width: '50%',
        height: '100%',
        backgroundColor: 'transparent',
        resize: 'none',
        fontSize: '1rem',
        overflow: 'hidden',
        overflowWrap: 'break-word',
        fontFamily: 'Fira Code, monospace',
        fontWeight: isSelected || pathLength > 0 ? 'bold' : 'normal',
        color: 'black',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        border: 'none',
        outline: 'none',
        marginLeft: indent * 6 + '%',
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
        //height: verticalLineLength * 30 - 14 + 'px',
        top: '29.5px',
        left: 2 + indent * 6 + '%',
        
    }

    const verticalLineFirstHalfLengthPx = () => {
        const firsthalf = pathLength > 0? (pathLength-1)*30+16:0
        if (index === 0) {
        
            console.log("firsthalf", text, firsthalf)
            console.log("secondhalf", text, (verticalLineLength*30-18)-firsthalf)
        }
        return firsthalf
    }

    const verticalLineFirstHalf = {
        borderLeft: '3px solid black',
        height: verticalLineFirstHalfLengthPx() + 'px'
    }

    const verticalLineSecondHalf = {
        borderLeft: '1px solid black',
        height: (verticalLineLength*30-14)-verticalLineFirstHalfLengthPx() + 'px'
    }

    const container = {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
    }

    const inputRef = useRef(null)

    useEffect(() => {
        if (isSelected) inputRef.current.focus()
    }, [isSelected])

    useEffect(() => {}, [lastChildIndex, index, pathLength])


    const handleInput = (e) => {
        setText(index, e.target.value)
    }

    return (
        <div className="box" style={textLineStyle} onClick={() => {
            selectNew(index)
        }}>

            {verticalLineLength > 0 &&
                <div style={verticalLineContainer}>
                    <div style={verticalLineFirstHalf} />
                    <div style={verticalLineSecondHalf} />
                </div>
            }
            <div style={container}>
                {(text.length > 0 || isSelected) && <div style={horizontalLineStyle} />}
                <input type="text" defaultValue={text} style={inputStyle} ref={inputRef} onInput={handleInput} />
            </div>
        </div>
    )
}

export { TextLine }