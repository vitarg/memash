import { useRef, useState, useEffect } from 'react';
import { getRandomColor } from '@shared/lib/color';
import {
    MAX_CANVAS_HEIGHT,
    MAX_CANVAS_WIDTH,
} from '@shared/constants/canvas-constants';

interface TextItem {
    id: number;
    text: string;
    x: number;
    y: number;
}

interface UseCanvasProps {
    image: string | ArrayBuffer | null;
    texts: TextItem[];
    setImage: (img: string | ArrayBuffer | null) => void;
    pushToHistory: () => void;
}

export default function useCanvas({
    image,
    texts,
    setImage,
    pushToHistory,
}: UseCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(
        null,
    );
    const [canvasWidth, setCanvasWidth] = useState(MAX_CANVAS_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState(MAX_CANVAS_HEIGHT);

    useEffect(() => {
        setContext(canvasRef.current?.getContext('2d') ?? null);
    }, []);

    useEffect(() => {
        if (!context) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (typeof image === 'string') {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                const aspectRatio = width / height;

                if (width > MAX_CANVAS_WIDTH) {
                    width = MAX_CANVAS_WIDTH;
                    height = width / aspectRatio;
                }

                if (height > MAX_CANVAS_HEIGHT) {
                    height = MAX_CANVAS_HEIGHT;
                    width = height * aspectRatio;
                }

                canvas.width = width;
                canvas.height = height;
                setCanvasWidth(width);
                setCanvasHeight(height);
                context.clearRect(0, 0, width, height);
                context.drawImage(img, 0, 0, width, height);
            };
            img.src = image;
        } else {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [image, context]);

    const fillCanvas = () => {
        if (context && canvasRef.current) {
            pushToHistory();
            context.fillStyle = getRandomColor();
            context.fillRect(0, 0, canvasWidth, canvasHeight);
            setImage(canvasRef.current.toDataURL());
        }
    };

    const clearCanvas = () => {
        if (context) {
            pushToHistory();
            context.clearRect(0, 0, canvasWidth, canvasHeight);
        }
        setImage(null);
    };

    const downloadImage = () => {
        const canvas = canvasRef.current;
        if (canvas && context) {
            const baseImage = context.getImageData(
                0,
                0,
                canvasWidth,
                canvasHeight,
            );

            texts.forEach((t) => {
                context.font = 'bold 30px Arial';
                context.fillStyle = 'white';
                context.textBaseline = 'top';
                context.fillText(t.text, t.x, t.y, canvasWidth - 16);
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

    return {
        canvasRef,
        canvasWidth,
        canvasHeight,
        fillCanvas,
        clearCanvas,
        downloadImage,
    };
}
