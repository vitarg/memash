import { useEffect, useRef, useState } from 'react';

const getRandomNumber = (from: number, to: number) => {
    return Math.floor(Math.random() * to) + from;
};

const getRandomColor = () => {
    const red = getRandomNumber(0, 256);
    const green = getRandomNumber(0, 256);
    const blue = getRandomNumber(0, 256);

    return `rgb(${red}, ${green}, ${blue})`;
};

function Main() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null | undefined>(null);

    useEffect(() => {
        setContext(canvasRef.current?.getContext('2d'));
    }, []);

    const handleFillGreen = () => {
        if (context) {
            context.fillStyle = getRandomColor();
            context.fillRect(0, 0, 500, 500);
        }
    };

    return (
        <div style={{display: 'flex', gap: 16}}>
            <canvas
                ref={canvasRef}
                style={{background: '#fff'}}
                id="myCanvas"
                width="500"
                height="500"
            />

            <div style={{ display: "flex", flexDirection: 'column' }}>
                <button onClick={handleFillGreen}>
                    Random Color
                </button>
            </div>
        </div>
    );
}

export default Main;
