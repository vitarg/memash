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

type Layer =
    | { id: 'image'; type: 'image'; visible: boolean }
    | { id: number; type: 'text'; visible: boolean };

interface UseCanvasProps {
    image: string | ArrayBuffer | null;
    texts: TextItem[];
    setImage: (img: string | ArrayBuffer | null) => void;
    pushToHistory: () => void;
    imageFilter?: string;
    layerOrder?: Layer[];
    exportScale?: number;
}

export default function useCanvas({
    image,
    texts,
    setImage,
    pushToHistory,
    imageFilter = 'none',
    layerOrder = [],
    exportScale = 1,
}: UseCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const imageSizeLockedRef = useRef(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(
        null,
    );
    const [canvasWidth, setCanvasWidth] = useState(MAX_CANVAS_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState(MAX_CANVAS_HEIGHT);
    const [maxCanvasSize, setMaxCanvasSize] = useState({
        width: MAX_CANVAS_WIDTH,
        height: MAX_CANVAS_HEIGHT,
    });
    const [devicePixelRatio, setDevicePixelRatio] = useState(
        () => window.devicePixelRatio || 1,
    );

    const drawTextLayer = useCallback(
        (ctx: CanvasRenderingContext2D, text: TextItem) => {
            ctx.font = `bold ${text.fontSize || 30}px ${
                text.fontFamily || 'Anton'
            }`;
            ctx.fillStyle = text.color || 'white';
            ctx.textBaseline = 'top';
            ctx.lineWidth = text.strokeWidth || 1;
            ctx.strokeStyle = text.strokeColor || 'black';
            if (text.strokeWidth > 0) {
                ctx.strokeText(text.text, text.x, text.y, canvasWidth);
            }
            ctx.fillText(text.text, text.x, text.y, canvasWidth);
        },
        [canvasWidth],
    );

    const drawTextsOn = useCallback(
        (ctx: CanvasRenderingContext2D) => {
            for (const t of texts) {
                drawTextLayer(ctx, t);
            }
        },
        [drawTextLayer, texts],
    );

    const drawScene = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            img?: HTMLImageElement,
            options?: { renderText?: boolean },
        ) => {
            const { renderText = true } = options ?? {};
            const textMap = new Map(texts.map((text) => [text.id, text]));

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            if (layerOrder.length === 0) {
                if (img) {
                    ctx.save();
                    ctx.filter = imageFilter;
                    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                    ctx.restore();
                }
                if (renderText) {
                    drawTextsOn(ctx);
                }
                return;
            }

            for (const layer of layerOrder) {
            if (!layer.visible) continue;

            if (layer.type === 'image') {
                if (!img) continue;
                ctx.save();
                ctx.filter = imageFilter;
                    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                    ctx.restore();
                    continue;
                }

                if (renderText) {
                    const text = textMap.get(layer.id);
                    if (text) {
                        drawTextLayer(ctx, text);
                    }
                }
            }
        },
        [
            canvasHeight,
            canvasWidth,
            drawTextLayer,
            drawTextsOn,
            imageFilter,
            layerOrder,
            texts,
        ],
    );

    useEffect(() => {
        setContext(canvasRef.current?.getContext('2d') ?? null);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setDevicePixelRatio(window.devicePixelRatio || 1);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const updateCanvasLimits = () => {
            const horizontalPadding = window.innerWidth < 720 ? 32 : 96;
            const verticalPadding = window.innerWidth < 720 ? 260 : 220;
            const width = Math.min(
                MAX_CANVAS_WIDTH,
                Math.max(280, window.innerWidth - horizontalPadding),
            );
            const height = Math.min(
                MAX_CANVAS_HEIGHT,
                Math.max(280, window.innerHeight - verticalPadding),
            );
            setMaxCanvasSize({ width, height });
        };

        updateCanvasLimits();
        window.addEventListener('resize', updateCanvasLimits);
        return () => window.removeEventListener('resize', updateCanvasLimits);
    }, []);

    useEffect(() => {
        imageSizeLockedRef.current = false;
        imageRef.current = null;
    }, [image]);

    const fitImageToBounds = useCallback(
        (imgWidth: number, imgHeight: number) => {
            let width = imgWidth;
            let height = imgHeight;
            const aspectRatio = width / height;

            if (width > maxCanvasSize.width) {
                width = maxCanvasSize.width;
                height = width / aspectRatio;
            }

            if (height > maxCanvasSize.height) {
                height = maxCanvasSize.height;
                width = height * aspectRatio;
            }

            return { width, height };
        },
        [maxCanvasSize.height, maxCanvasSize.width],
    );

    const setupCanvas = useCallback(
        (
            canvas: HTMLCanvasElement,
            ctx: CanvasRenderingContext2D,
            width: number,
            height: number,
        ) => {
            const scaledWidth = Math.round(width * devicePixelRatio);
            const scaledHeight = Math.round(height * devicePixelRatio);
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        },
        [devicePixelRatio],
    );

    const applyImageSize = useCallback(
        (img: HTMLImageElement) => {
            const fittedSize = fitImageToBounds(img.width, img.height);
            const keepCurrentSize =
                imageSizeLockedRef.current &&
                fittedSize.width >= canvasWidth &&
                fittedSize.height >= canvasHeight;
            const nextWidth = keepCurrentSize ? canvasWidth : fittedSize.width;
            const nextHeight = keepCurrentSize
                ? canvasHeight
                : fittedSize.height;
            setCanvasWidth(nextWidth);
            setCanvasHeight(nextHeight);
            const canvas = canvasRef.current;
            if (!canvas || !context) return;
            setupCanvas(canvas, context, nextWidth, nextHeight);
            drawScene(context, img, { renderText: false });
            imageSizeLockedRef.current = true;
        },
        [
            canvasHeight,
            canvasWidth,
            context,
            drawScene,
            fitImageToBounds,
            setupCanvas,
        ],
    );

    useEffect(() => {
        if (!context) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        if (typeof image === 'string') {
            if (imageRef.current?.src === image && imageRef.current.complete) {
                applyImageSize(imageRef.current);
                return;
            }
            const nextImage = new Image();
            nextImage.onload = () => {
                imageRef.current = nextImage;
                applyImageSize(nextImage);
            };
            nextImage.src = image;
        } else {
            setCanvasWidth(maxCanvasSize.width);
            setCanvasHeight(maxCanvasSize.height);
            setupCanvas(
                canvas,
                context,
                maxCanvasSize.width,
                maxCanvasSize.height,
            );
            drawScene(context, undefined, { renderText: false });
        }
    }, [
        applyImageSize,
        drawScene,
        image,
        context,
        setupCanvas,
        maxCanvasSize.height,
        maxCanvasSize.width,
    ]);

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
        exportCanvas.width = Math.round(canvasWidth * exportScale);
        exportCanvas.height = Math.round(canvasHeight * exportScale);
        const exportContext = exportCanvas.getContext('2d');
        if (!exportContext) return;

        const finalizeDownload = (img?: HTMLImageElement) => {
            exportContext.setTransform(
                exportScale,
                0,
                0,
                exportScale,
                0,
                0,
            );
            drawScene(exportContext, img, { renderText: true });
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
                finalizeDownload(img);
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
