import {
    MAX_CANVAS_HEIGHT,
    MAX_CANVAS_WIDTH,
} from '@shared/constants/canvas-constants';
import { getRandomColor } from '@shared/lib/color';
import { useCallback, useEffect, useRef, useState } from 'react';

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

    const drawTextsOn = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            for (const t of texts) {
                ctx.font = `bold ${t.fontSize || 30}px ${
                    t.fontFamily || 'Arial'
                }`;
                ctx.fillStyle = t.color || 'white';
                ctx.textBaseline = 'top';
                ctx.lineWidth = t.strokeWidth || 1;
                ctx.strokeStyle = t.strokeColor || 'black';
                if (t.strokeWidth > 0) {
                    ctx.strokeText(t.text, t.x, t.y, canvasWidth);
                }
                ctx.fillText(t.text, t.x, t.y, canvasWidth);
            }
        },
        [canvasWidth, texts],
    );

    const drawTexts = useCallback(() => {
        if (!context) return;
        drawTextsOn(context);
    }, [context, drawTextsOn]);

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
    }, [image, context, drawTexts]);

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
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvasWidth;
        exportCanvas.height = canvasHeight;
        const exportContext = exportCanvas.getContext('2d');
        if (!exportContext) return;

        const finalizeDownload = () => {
            drawTextsOn(exportContext);
            const imageURI = exportCanvas.toDataURL('image/jpeg');
            const link = document.createElement('a');
            link.href = imageURI;
            link.download = 'image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        if (typeof image === 'string') {
            const img = new Image();
            img.onload = () => {
                exportContext.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                finalizeDownload();
            };
            img.src = image;
            return;
        }

        finalizeDownload();
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
