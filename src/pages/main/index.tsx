import AddText from '@components/add-text';
import ColorPicker from '@components/color-picker';
import FontFamilySelector from '@components/font-family-selector';
import FontSizeSlider from '@components/font-size-slider';
import StrokeColorPicker from '@components/stroke-color-picker';
import StrokeWidthSlider from '@components/stroke-width-slider';
import Upload from '@components/upload';
import useCanvas from '@shared/hooks/use-canvas';
import { useEffect, useRef, useState } from 'react';
import { FaDownload, FaPalette, FaRedo, FaTrash, FaUndo } from 'react-icons/fa';
import styles from './styles.module.css';

function Main() {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [image, setImage] = useState<string | ArrayBuffer | null>(null);
    const [texts, setTexts] = useState<
        {
            id: number;
            text: string;
            x: number;
            y: number;
            fontSize: number;
            color: string;
            fontFamily: string;
            strokeWidth: number;
            strokeColor: string;
        }[]
    >([]);
    const [history, setHistory] = useState<
        {
            image: string | ArrayBuffer | null;
            texts: {
                id: number;
                text: string;
                x: number;
                y: number;
                fontSize: number;
                color: string;
                fontFamily: string;
                strokeWidth: number;
                strokeColor: string;
            }[];
        }[]
    >([]);
    const [redoStack, setRedoStack] = useState<
        {
            image: string | ArrayBuffer | null;
            texts: {
                id: number;
                text: string;
                x: number;
                y: number;
                fontSize: number;
                color: string;
                fontFamily: string;
                strokeWidth: number;
                strokeColor: string;
            }[];
        }[]
    >([]);
    const [dragging, setDragging] = useState<{
        index: number;
        offsetX: number;
        offsetY: number;
    } | null>(null);
    const [selectedTextId, setSelectedTextId] = useState<number | null>(null);

    const [fontSize, setFontSize] = useState(30);
    const [color, setColor] = useState('#ffffff');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [strokeWidth, setStrokeWidth] = useState(1);
    const [strokeColor, setStrokeColor] = useState('#000000');

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
        const newText = {
            id: Date.now(),
            text,
            x: textCoords[position].x,
            y: textCoords[position].y,
            fontSize,
            color,
            fontFamily,
            strokeWidth,
            strokeColor,
        };
        setTexts((prev) => [...prev, newText]);
        setSelectedTextId(newText.id);
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
        setSelectedTextId(texts[index].id);
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

    const handleFontSizeChange = (value: number) => {
        setFontSize(value);
        if (selectedTextId) {
            setTexts((prev) =>
                prev.map((t) =>
                    t.id === selectedTextId ? { ...t, fontSize: value } : t,
                ),
            );
        }
    };

    const handleColorChange = (value: string) => {
        setColor(value);
        if (selectedTextId) {
            setTexts((prev) =>
                prev.map((t) =>
                    t.id === selectedTextId ? { ...t, color: value } : t,
                ),
            );
        }
    };

    const handleFontFamilyChange = (value: string) => {
        setFontFamily(value);
        if (selectedTextId) {
            setTexts((prev) =>
                prev.map((t) =>
                    t.id === selectedTextId ? { ...t, fontFamily: value } : t,
                ),
            );
        }
    };

    const handleStrokeWidthChange = (value: number) => {
        setStrokeWidth(value);
        if (selectedTextId) {
            setTexts((prev) =>
                prev.map((t) =>
                    t.id === selectedTextId ? { ...t, strokeWidth: value } : t,
                ),
            );
        }
    };

    const handleStrokeColorChange = (value: string) => {
        setStrokeColor(value);
        if (selectedTextId) {
            setTexts((prev) =>
                prev.map((t) =>
                    t.id === selectedTextId ? { ...t, strokeColor: value } : t,
                ),
            );
        }
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
                        className={`${styles.text} ${
                            selectedTextId === t.id ? styles.selected : ''
                        }`}
                        style={{
                            left: t.x,
                            top: t.y,
                            fontSize: `${t.fontSize}px`,
                            color: t.color,
                            fontFamily: t.fontFamily,
                            textShadow: `
                                -${t.strokeWidth}px -${t.strokeWidth}px 0 ${t.strokeColor},
                                ${t.strokeWidth}px -${t.strokeWidth}px 0 ${t.strokeColor},
                                -${t.strokeWidth}px ${t.strokeWidth}px 0 ${t.strokeColor},
                                ${t.strokeWidth}px ${t.strokeWidth}px 0 ${t.strokeColor}
                            `,
                        }}
                    >
                        {t.text}
                    </div>
                ))}
            </div>

            <div className={styles.sidebar}>
                <button type="button" onClick={handleFill}>
                    <FaPalette /> Random Color
                </button>

                <Upload onChange={handleChangePicture} />

                <AddText onSubmit={handleAddText} position="top" />

                <AddText onSubmit={handleAddText} position="bottom" />

                <FontSizeSlider
                    value={fontSize}
                    onChange={handleFontSizeChange}
                />

                <ColorPicker value={color} onChange={handleColorChange} />

                <FontFamilySelector
                    value={fontFamily}
                    onChange={handleFontFamilyChange}
                />

                <StrokeWidthSlider
                    value={strokeWidth}
                    onChange={handleStrokeWidthChange}
                />

                <StrokeColorPicker
                    value={strokeColor}
                    onChange={handleStrokeColorChange}
                />

                <button
                    type="button"
                    onClick={handleUndo}
                    disabled={!history.length}
                >
                    <FaUndo /> Undo
                </button>

                <button
                    type="button"
                    onClick={handleRedo}
                    disabled={!redoStack.length}
                >
                    <FaRedo /> Redo
                </button>

                <button type="button" onClick={handleClear}>
                    <FaTrash /> Clear
                </button>

                <button type="button" onClick={handleDownloadImage}>
                    <FaDownload /> Download
                </button>
            </div>
        </div>
    );
}

export default Main;
