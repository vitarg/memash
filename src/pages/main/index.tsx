import React, { useEffect, useRef, useState } from 'react';
import AddText from '@components/add-text';
import Upload from '@components/upload';
import { FaPalette, FaTrash, FaDownload, FaUndo, FaRedo } from 'react-icons/fa';
import useCanvas from '@shared/hooks/use-canvas';
import styles from './styles.module.css';

function Main() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [image, setImage] = useState<string | ArrayBuffer | null>(null);
    const [texts, setTexts] = useState<
        { id: number; text: string; x: number; y: number }[]
    >([]);
    const [history, setHistory] = useState<
        {
            image: string | ArrayBuffer | null;
            texts: { id: number; text: string; x: number; y: number }[];
        }[]
    >([]);
    const [redoStack, setRedoStack] = useState<
        {
            image: string | ArrayBuffer | null;
            texts: { id: number; text: string; x: number; y: number }[];
        }[]
    >([]);
    const [dragging, setDragging] = useState<{
        index: number;
        offsetX: number;
        offsetY: number;
    } | null>(null);

    const pushToHistory = () => {
        setHistory((prev) => [
            ...prev,
            { image, texts: texts.map((t) => ({ ...t })) },
        ]);
        setRedoStack([]);
    };

    const {
        canvasRef,
        canvasWidth,
        canvasHeight,
        fillCanvas,
        clearCanvas,
        downloadImage,
    } = useCanvas({ image, texts, setImage, pushToHistory });

    useEffect(() => {
        const saved = localStorage.getItem('meme');
        if (saved) {
            const { image: savedImage, texts: savedTexts } = JSON.parse(saved);
            if (savedImage) {
                setImage(savedImage);
            }
            if (Array.isArray(savedTexts)) {
                setTexts(savedTexts);
            }
        }
    }, []);

    const handleChangePicture = (file: File) => {
        pushToHistory();
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
            bottom: { x: 40, y: canvasHeight - 40 - 30 },
        };

        pushToHistory();
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

    const handleMouseDown = (
        index: number,
        e: React.MouseEvent<HTMLDivElement>,
    ) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        pushToHistory();
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
                    prev.map((t, i) =>
                        i === dragging.index ? { ...t, x, y } : t,
                    ),
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
        fillCanvas();
    };

    const handleClear = () => {
        clearCanvas();
        setTexts([]);
    };

    const handleUndo = () => {
        setHistory((prev) => {
            if (!prev.length) return prev;
            const last = prev[prev.length - 1];
            setRedoStack((r) => [
                ...r,
                { image, texts: texts.map((t) => ({ ...t })) },
            ]);
            setImage(last.image);
            setTexts(last.texts);
            return prev.slice(0, -1);
        });
    };

    const handleRedo = () => {
        setRedoStack((prev) => {
            if (!prev.length) return prev;
            const last = prev[prev.length - 1];
            setHistory((h) => [
                ...h,
                { image, texts: texts.map((t) => ({ ...t })) },
            ]);
            setImage(last.image);
            setTexts(last.texts);
            return prev.slice(0, -1);
        });
    };

    const handleDownloadImage = () => {
        downloadImage();
    };

    useEffect(() => {
        if (image || texts.length) {
            localStorage.setItem('meme', JSON.stringify({ image, texts }));
        } else {
            localStorage.removeItem('meme');
        }
    }, [image, texts]);

    return (
        <div className={styles.container}>
            <div
                ref={containerRef}
                className={styles.canvasContainer}
                style={{ width: canvasWidth, height: canvasHeight }}
                onDrop={handleDropPicture}
                onDragOver={handleDragOver}
            >
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                    id="myCanvas"
                    width={canvasWidth}
                    height={canvasHeight}
                />

                {texts.map((t, index) => (
                    <div
                        key={t.id}
                        onMouseDown={(e) => handleMouseDown(index, e)}
                        className={styles.text}
                        style={{ left: t.x, top: t.y }}
                    >
                        {t.text}
                    </div>
                ))}
            </div>

            <div className={styles.sidebar}>
                <button onClick={handleFill}>
                    <FaPalette /> Random Color
                </button>

                <Upload onChange={handleChangePicture} />

                <AddText onSubmit={handleAddText} position="top" />

                <AddText onSubmit={handleAddText} position="bottom" />

                <button onClick={handleUndo} disabled={!history.length}>
                    <FaUndo /> Undo
                </button>

                <button onClick={handleRedo} disabled={!redoStack.length}>
                    <FaRedo /> Redo
                </button>

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
