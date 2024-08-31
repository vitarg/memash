import React, { useEffect, useRef, useState } from 'react';
import AddText from '@components/add-text';
import Upload from '@components/upload';
import { getRandomColor } from '@shared/lib/color';
import { MAX_CANVAS_HEIGHT, MAX_CANVAS_WIDTH } from '@shared/constants/canvas-constants';

function Main() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [context, setContext] = useState<CanvasRenderingContext2D | null | undefined>(null);
    const [image, setImage] = useState<string | ArrayBuffer | null>();

    const handleChangePicture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddText = (text: string, position: 'top' | 'bottom') => {
        const textCoords = {
            top: { x: 40, y: 40 },
            bottom: { x: 40, y: MAX_CANVAS_HEIGHT - 40 - 30 },
        };

        if (context) {
            context.font = 'bold 30px Arial';
            context.fillStyle = 'white';
            context.textBaseline = 'top'; // Установка базовой линии текста
            context.fillText(text, textCoords[position].x, textCoords[position].y, MAX_CANVAS_WIDTH - 16);
            context.strokeStyle = 'black';
            context.lineWidth = 1;
            context.strokeText(text, textCoords[position].x, textCoords[position].y);
        }
    };

    const drawImageOnCanvas = () => {
        if (image) {
            const canvas = canvasRef.current;
            const img = new Image();

            if (typeof image === 'string') {
                img.src = image;
            }

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (img.width > MAX_CANVAS_WIDTH) {
                    img.width = MAX_CANVAS_WIDTH;
                }

                if (img.height > MAX_CANVAS_HEIGHT) {
                    img.height = MAX_CANVAS_HEIGHT;
                }

                // Сохраняем пропорции изображения
                if (width > height) {
                    if (width > MAX_CANVAS_WIDTH) {
                        height *= MAX_CANVAS_WIDTH / width;
                        width = MAX_CANVAS_WIDTH;
                    }
                } else {
                    if (height > MAX_CANVAS_HEIGHT) {
                        width *= MAX_CANVAS_HEIGHT / height;
                        height = MAX_CANVAS_HEIGHT;
                    }
                }

                if (canvas) {
                    context?.drawImage(img, 0, 0, width, height);
                }
            };
        }
    };

    const handleFill = () => {
        if (context) {
            context.fillStyle = getRandomColor();
            context.fillRect(0, 0, 500, 500);
        }
    };

    const handleClear = () => {
        if (context) {
            context.clearRect(0, 0, MAX_CANVAS_WIDTH, MAX_CANVAS_WIDTH);
        }
    };

    const handleDownloadImage = () => {
        const canvas = canvasRef.current;

        if (canvas) {
            const imageURI = canvas.toDataURL('image/jpeg');
            const link = document.createElement('a');
            link.href = imageURI;
            link.download = 'image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    useEffect(() => {
        setContext(canvasRef.current?.getContext('2d'));
    }, []);

    if (image) {
        drawImageOnCanvas();
    }

    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{ background: '#fff' }}
                id="myCanvas"
                width="500"
                height="500"
            />

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: 500,
                    width: 360,
                    gap: 16,
                }}
            >
                <button onClick={handleFill}>Random Color</button>

                <Upload onChange={handleChangePicture} />

                <AddText onSubmit={handleAddText} position="top" />

                <AddText onSubmit={handleAddText} position="bottom" />

                <button onClick={handleClear}>Clear</button>

                <button onClick={handleDownloadImage}>Download</button>
            </div>
        </div>
    );
}

export default Main;
