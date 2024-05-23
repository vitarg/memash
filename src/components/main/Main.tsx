import React, { useEffect, useRef, useState } from 'react';
import { getRandomColor } from '../../helpers.ts';

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

    const drawImageOnCanvas = () => {
        if (image) {
            const canvas = canvasRef.current;
            const img = new Image();

            if (typeof image === 'string') {
                img.src = image;
            }

            img.onload = () => {
                const MAX_WIDTH = 500;
                const MAX_HEIGHT = 500;
                let width = img.width;
                let height = img.height;

                if (img.width > MAX_WIDTH) {
                    img.width = MAX_WIDTH;
                }

                if (img.height > MAX_HEIGHT) {
                    img.height = MAX_HEIGHT;
                }

                // Сохраняем пропорции изображения
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                if (canvas) {
                    context?.drawImage(img, 0, 0, width, height);
                }
            };
        }
    };

    const handleFillGreen = () => {
        if (context) {
            context.fillStyle = getRandomColor();
            context.fillRect(0, 0, 500, 500);
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

            <div style={{ display: 'flex', flexDirection: 'column', height: 500, gap: 8 }}>
                <button onClick={handleFillGreen}>Random Color</button>
                <div>
                    <label htmlFor="picture">Upload picture</label>
                    <input
                        onChange={handleChangePicture}
                        type="file"
                        id="picture"
                        aria-label="Upload picture"
                    />
                </div>
            </div>
        </div>
    );
}

export default Main;
