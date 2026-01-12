import {
    MAX_CANVAS_HEIGHT,
    MAX_CANVAS_WIDTH,
} from '@shared/constants/canvas-constants';
import { getRandomColor } from '@shared/lib/color';
import { useEffect, useRef, useState } from 'react';

interface TextItem {
    id: number;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontFamily: string;
    strokeWidth: number;
    strokeColor: string;
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

    const drawTexts = () => {
        if (!context) return;
        for (const t of texts) {
            context.font = `bold ${t.fontSize || 30}px ${
                t.fontFamily || 'Arial'
            }`;
            context.fillStyle = t.color || 'white';
            context.textBaseline = 'top';
            context.lineWidth = t.strokeWidth || 1;
            context.strokeStyle = t.strokeColor || 'black';
            if (t.strokeWidth > 0) {
                context.strokeText(t.text, t.x, t.y, canvasWidth);
            }
            context.fillText(t.text, t.x, t.y, canvasWidth);
        }
    };

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
                drawTexts();
            };
            img.src = image;
        } else {
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawTexts();
        }
    }, [image, context, texts]);

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

            drawTexts();

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
