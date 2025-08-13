import React, { useEffect, useRef, useState } from 'react';
import AddText from '@components/add-text';
import Upload from '@components/upload';
import { getRandomColor } from '@shared/lib/color';
import { MAX_CANVAS_HEIGHT, MAX_CANVAS_WIDTH } from '@shared/constants/canvas-constants';
import { FaPalette, FaTrash, FaDownload } from 'react-icons/fa';

function Main() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [context, setContext] = useState<CanvasRenderingContext2D | null | undefined>(null);
    const [image, setImage] = useState<string | ArrayBuffer | null>();
    const [texts, setTexts] = useState<
        { id: number; text: string; x: number; y: number }[]
    >([]);
    const [dragging, setDragging] = useState<
        { index: number; offsetX: number; offsetY: number } | null
    >(null);

    const handleChangePicture = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDropPicture = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleChangePicture(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleAddText = (text: string, position: 'top' | 'bottom') => {
        const textCoords = {
            top: { x: 40, y: 40 },
            bottom: { x: 40, y: MAX_CANVAS_HEIGHT - 40 - 30 },
        };

        setTexts((prev) => [
            ...prev,
            {
                id: Date.now(),
                text,
                x: textCoords[position].x,
                y: textCoords[position].y,
            },
        ]);
    };

    const handleMouseDown = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setDragging({
            index,
            offsetX: e.clientX - rect.left - texts[index].x,
            offsetY: e.clientY - rect.top - texts[index].y,
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (dragging) {
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                const x = e.clientX - rect.left - dragging.offsetX;
                const y = e.clientY - rect.top - dragging.offsetY;
                setTexts((prev) =>
                    prev.map((t, i) => (i === dragging.index ? { ...t, x, y } : t)),
                );
            }
        };

        const handleMouseUp = () => setDragging(null);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [dragging]);


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
        setTexts([]);
    };

    const handleDownloadImage = () => {
        const canvas = canvasRef.current;

        if (canvas && context) {
            const baseImage = context.getImageData(
                0,
                0,
                MAX_CANVAS_WIDTH,
                MAX_CANVAS_HEIGHT,
            );

            texts.forEach((t) => {
                context.font = 'bold 30px Arial';
                context.fillStyle = 'white';
                context.textBaseline = 'top';
                context.fillText(t.text, t.x, t.y, MAX_CANVAS_WIDTH - 16);
                context.strokeStyle = 'black';
                context.lineWidth = 1;
                context.strokeText(t.text, t.x, t.y);
            });

            const imageURI = canvas.toDataURL('image/jpeg');

            context.putImageData(baseImage, 0, 0);

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

    useEffect(() => {
        if (typeof image === 'string' && context) {
            const canvas = canvasRef.current;
            const img = new Image();
            img.src = image;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (img.width > MAX_CANVAS_WIDTH) {
                    img.width = MAX_CANVAS_WIDTH;
                }

                if (img.height > MAX_CANVAS_HEIGHT) {
                    img.height = MAX_CANVAS_HEIGHT;
                }

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
                    context.drawImage(img, 0, 0, width, height);
                }
            };
        }
    }, [image, context]);

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
            <div
                ref={containerRef}
                style={{ position: 'relative', width: 500, height: 500 }}
                onDrop={handleDropPicture}
                onDragOver={handleDragOver}
            >
                <canvas
                    ref={canvasRef}
                    style={{ background: '#fff' }}
                    id="myCanvas"
                    width="500"
                    height="500"
                />

                {texts.map((t, index) => (
                    <div
                        key={t.id}
                        onMouseDown={(e) => handleMouseDown(index, e)}
                        style={{
                            position: 'absolute',
                            left: t.x,
                            top: t.y,
                            color: '#fff',
                            fontWeight: 'bold',
                            fontSize: 30,
                            fontFamily: 'Arial',
                            cursor: 'move',
                            userSelect: 'none',
                            textShadow:
                                '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                        }}
                    >
                        {t.text}
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: 500,
                    width: 360,
                    gap: 16,
                }}
            >
                <button onClick={handleFill}>
                    <FaPalette /> Random Color
                </button>

                <Upload onChange={handleChangePicture} />

                <AddText onSubmit={handleAddText} position="top" />

                <AddText onSubmit={handleAddText} position="bottom" />

                <button onClick={handleClear}>
                    <FaTrash /> Clear
                </button>

                <button onClick={handleDownloadImage}>
                    <FaDownload /> Download
                </button>
            </div>
        </div>
    );
}

export default Main;
