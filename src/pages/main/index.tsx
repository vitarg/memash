import AddText from '@components/add-text';
import ColorPicker from '@components/color-picker';
import FontFamilySelector from '@components/font-family-selector';
import FontSizeSlider from '@components/font-size-slider';
import StrokeWidthSlider from '@components/stroke-width-slider';
import Upload from '@components/upload';
import useCanvas from '@shared/hooks/use-canvas';
import { useEffect, useRef, useState } from 'react';
import { FaDownload, FaPalette, FaRedo, FaTrash, FaUndo } from 'react-icons/fa';
import styles from './styles.module.css';

type TextItem = {
    id: number;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontFamily: string;
    strokeWidth: number;
    strokeColor: string;
};

type Layer =
    | { id: 'image'; type: 'image'; visible: boolean }
    | { id: number; type: 'text'; visible: boolean };
type LayerInput =
    | { id: 'image'; type: 'image'; visible?: boolean }
    | { id: number; type: 'text'; visible?: boolean };

const FILTERS = [
    { id: 'none', label: 'None', value: 'none' },
    { id: 'grayscale', label: 'Grayscale', value: 'grayscale(1)' },
    { id: 'sepia', label: 'Sepia', value: 'sepia(1)' },
    { id: 'invert', label: 'Invert', value: 'invert(1)' },
    { id: 'brightness', label: 'Bright', value: 'brightness(1.2)' },
    { id: 'contrast', label: 'Contrast', value: 'contrast(1.2)' },
    { id: 'saturate', label: 'Vivid', value: 'saturate(1.4)' },
];

function Main() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const saveTimeoutRef = useRef<number | null>(null);

    const [image, setImage] = useState<string | ArrayBuffer | null>(null);
    const [texts, setTexts] = useState<TextItem[]>([]);
    const [history, setHistory] = useState<
        {
            image: string | ArrayBuffer | null;
            texts: TextItem[];
            filter: string;
            layers: Layer[];
        }[]
    >([]);
    const [redoStack, setRedoStack] = useState<
        {
            image: string | ArrayBuffer | null;
            texts: TextItem[];
            filter: string;
            layers: Layer[];
        }[]
    >([]);
    const [dragging, setDragging] = useState<{
        textId: number;
        offsetX: number;
        offsetY: number;
        pointerId: number;
    } | null>(null);
    const [selectedTextId, setSelectedTextId] = useState<number | null>(null);
    const [layerOrder, setLayerOrder] = useState<Layer[]>([]);
    const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);

    const [fontSize, setFontSize] = useState(30);
    const [color, setColor] = useState('#ffffff');
    const [fontFamily, setFontFamily] = useState('Anton');
    const [strokeWidth, setStrokeWidth] = useState(1);
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [imageFilter, setImageFilter] = useState('none');
    const [exportScale, setExportScale] = useState(2);

    const pushToHistory = () => {
        setHistory((prev) => [
            ...prev,
            {
                image,
                texts: texts.map((t) => ({ ...t })),
                filter: imageFilter,
                layers: layerOrder.map((layer) => ({ ...layer })),
            },
        ]);
        setRedoStack([]);
    };

    const normalizeLayer = (layer: LayerInput): Layer => ({
        ...layer,
        visible: layer.visible ?? true,
    });

    useEffect(() => {
        setLayerOrder((prev) => {
            const next: Layer[] = [];
            const textIds = new Set(texts.map((t) => t.id));
            const hasImage = Boolean(image);

            for (const layer of prev) {
                if (layer.type === 'image') {
                    if (hasImage) next.push(normalizeLayer(layer));
                    continue;
                }
                if (textIds.has(layer.id)) next.push(normalizeLayer(layer));
            }

            if (hasImage && !next.some((layer) => layer.type === 'image')) {
                next.unshift({ id: 'image', type: 'image', visible: true });
            }

            for (const text of texts) {
                if (!next.some((layer) => layer.id === text.id)) {
                    next.push({ id: text.id, type: 'text', visible: true });
                }
            }

            return next;
        });
    }, [image, texts]);

    const visibleLayerOrder = layerOrder.filter((layer) => layer.visible);

    const orderedTexts =
        visibleLayerOrder.length > 0
            ? visibleLayerOrder
                  .filter((layer) => layer.type === 'text')
                  .map((layer) =>
                      texts.find((text) => text.id === layer.id),
                  )
                  .filter((text): text is TextItem => Boolean(text))
            : texts;

    const layerIndexMap = new Map<string, number>();
    visibleLayerOrder.forEach((layer, index) => {
        const key = layer.type === 'image' ? 'image' : `text-${layer.id}`;
        layerIndexMap.set(key, index);
    });
    const imageLayerIndex = layerIndexMap.get('image');
    const visibleTexts =
        imageLayerIndex === undefined
            ? orderedTexts
            : orderedTexts.filter((text) => {
                  const index = layerIndexMap.get(`text-${text.id}`);
                  return index === undefined || index > imageLayerIndex;
              });

    const {
        canvasRef,
        canvasWidth,
        canvasHeight,
        fillCanvas,
        clearCanvas,
        downloadImage,
    } = useCanvas({
        image,
        texts: orderedTexts,
        setImage,
        pushToHistory,
        imageFilter,
        layerOrder,
        exportScale,
    });

    useEffect(() => {
        const saved = localStorage.getItem('meme');
        if (!saved) return;
        try {
            const {
                image: savedImage,
                texts: savedTexts,
                filter: savedFilter,
                layers: savedLayers,
            } = JSON.parse(saved);
            if (savedImage) {
                setImage(savedImage);
            }
            if (Array.isArray(savedTexts)) {
                setTexts(savedTexts);
            }
            if (typeof savedFilter === 'string') {
                setImageFilter(savedFilter);
            }
            if (Array.isArray(savedLayers)) {
                setLayerOrder(
                    savedLayers.map((layer: LayerInput) =>
                        normalizeLayer(layer),
                    ),
                );
            }
        } catch {
            localStorage.removeItem('meme');
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

    const handlePointerDown = (
        text: TextItem,
        e: React.PointerEvent<HTMLDivElement>,
    ) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        e.preventDefault();
        pushToHistory();
        setDragging({
            textId: text.id,
            offsetX: e.clientX - rect.left - text.x,
            offsetY: e.clientY - rect.top - text.y,
            pointerId: e.pointerId,
        });
        setSelectedTextId(text.id);
    };

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            if (!dragging || e.pointerId !== dragging.pointerId) return;
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left - dragging.offsetX;
            const y = e.clientY - rect.top - dragging.offsetY;
            setTexts((prev) =>
                prev.map((t) =>
                    t.id === dragging.textId ? { ...t, x, y } : t,
                ),
            );
        };

        const handlePointerUp = (e: PointerEvent) => {
            if (!dragging || e.pointerId !== dragging.pointerId) return;
            setDragging(null);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
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
                {
                    image,
                    texts: texts.map((t) => ({ ...t })),
                    filter: imageFilter,
                    layers: layerOrder.map((layer) => ({ ...layer })),
                },
            ]);
            setImage(last.image);
            setTexts(last.texts);
            setImageFilter(last.filter ?? 'none');
            setLayerOrder((last.layers ?? []).map(normalizeLayer));
            return prev.slice(0, -1);
        });
    };

    const handleRedo = () => {
        setRedoStack((prev) => {
            if (!prev.length) return prev;
            const last = prev[prev.length - 1];
            setHistory((h) => [
                ...h,
                {
                    image,
                    texts: texts.map((t) => ({ ...t })),
                    filter: imageFilter,
                    layers: layerOrder.map((layer) => ({ ...layer })),
                },
            ]);
            setImage(last.image);
            setTexts(last.texts);
            setImageFilter(last.filter ?? 'none');
            setLayerOrder((last.layers ?? []).map(normalizeLayer));
            return prev.slice(0, -1);
        });
    };

    const handleDownloadImage = () => {
        downloadImage();
    };

    const handleFontSizeChange = (value: number) => {
        setFontSize(value);
        if (!selectedTextId) return;
        const selectedText = texts.find((t) => t.id === selectedTextId);
        if (!selectedText || selectedText.fontSize === value) return;
        setTexts((prev) =>
            prev.map((t) =>
                t.id === selectedTextId ? { ...t, fontSize: value } : t,
            ),
        );
    };

    const handleFontSizePointerDown = () => {
        if (!selectedTextId) return;
        pushToHistory();
    };

    const handleColorChange = (value: string) => {
        setColor(value);
        if (!selectedTextId) return;
        const selectedText = texts.find((t) => t.id === selectedTextId);
        if (!selectedText || selectedText.color === value) return;
        pushToHistory();
        setTexts((prev) =>
            prev.map((t) =>
                t.id === selectedTextId ? { ...t, color: value } : t,
            ),
        );
    };

    const handleFontFamilyChange = (value: string) => {
        setFontFamily(value);
        if (!selectedTextId) return;
        const selectedText = texts.find((t) => t.id === selectedTextId);
        if (!selectedText || selectedText.fontFamily === value) return;
        pushToHistory();
        setTexts((prev) =>
            prev.map((t) =>
                t.id === selectedTextId ? { ...t, fontFamily: value } : t,
            ),
        );
    };

    const handleStrokeWidthChange = (value: number) => {
        setStrokeWidth(value);
        if (!selectedTextId) return;
        const selectedText = texts.find((t) => t.id === selectedTextId);
        if (!selectedText || selectedText.strokeWidth === value) return;
        setTexts((prev) =>
            prev.map((t) =>
                t.id === selectedTextId ? { ...t, strokeWidth: value } : t,
            ),
        );
    };

    const handleStrokeWidthPointerDown = () => {
        if (!selectedTextId) return;
        pushToHistory();
    };

    const handleStrokeColorChange = (value: string) => {
        setStrokeColor(value);
        if (!selectedTextId) return;
        const selectedText = texts.find((t) => t.id === selectedTextId);
        if (!selectedText || selectedText.strokeColor === value) return;
        pushToHistory();
        setTexts((prev) =>
            prev.map((t) =>
                t.id === selectedTextId ? { ...t, strokeColor: value } : t,
            ),
        );
    };

    const handleFilterChange = (value: string) => {
        if (value === imageFilter) return;
        pushToHistory();
        setImageFilter(value);
    };

    const toggleLayerVisibility = (layer: Layer) => {
        pushToHistory();
        setLayerOrder((prev) =>
            prev.map((item) =>
                item.type === layer.type && item.id === layer.id
                    ? { ...item, visible: !item.visible }
                    : item,
            ),
        );
    };

    const moveLayer = (index: number, direction: -1 | 1) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= layerOrder.length) return;
        pushToHistory();
        setLayerOrder((prev) => {
            const next = [...prev];
            [next[index], next[targetIndex]] = [
                next[targetIndex],
                next[index],
            ];
            return next;
        });
    };

    const handleSelectLayer = (layer: Layer) => {
        if (layer.type === 'text') {
            setSelectedTextId(layer.id);
            return;
        }
        setSelectedTextId(null);
    };

    const getLayerKey = (layer: Layer) =>
        layer.type === 'image' ? 'image' : `text-${layer.id}`;

    const handleLayerDragStart = (layer: Layer) => {
        setDraggedLayerId(getLayerKey(layer));
    };

    const handleLayerDragOver = (
        event: React.DragEvent<HTMLDivElement>,
        layer: Layer,
    ) => {
        event.preventDefault();
        setDropTargetId(getLayerKey(layer));
    };

    const handleLayerDrop = (layer: Layer) => {
        if (!draggedLayerId) return;
        const targetKey = getLayerKey(layer);
        if (targetKey === draggedLayerId) return;
        const fromIndex = layerOrder.findIndex(
            (item) => getLayerKey(item) === draggedLayerId,
        );
        const toIndex = layerOrder.findIndex(
            (item) => getLayerKey(item) === targetKey,
        );
        if (fromIndex < 0 || toIndex < 0) return;
        pushToHistory();
        setLayerOrder((prev) => {
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
        setDropTargetId(null);
    };

    const handleLayerDragEnd = () => {
        setDraggedLayerId(null);
        setDropTargetId(null);
    };

    useEffect(() => {
        if (image || texts.length || imageFilter !== 'none') {
            if (saveTimeoutRef.current) {
                window.clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = window.setTimeout(() => {
                localStorage.setItem(
                    'meme',
                    JSON.stringify({
                        image,
                        texts,
                        filter: imageFilter,
                        layers: layerOrder,
                    }),
                );
            }, 300);
        } else {
            localStorage.removeItem('meme');
        }

        return () => {
            if (saveTimeoutRef.current) {
                window.clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [image, texts, imageFilter, layerOrder]);

    return (
        <div className={styles.container}>
            <section className={styles.stage}>
                <div className={styles.stageHeader}>
                    <div>
                        <p className={styles.stageEyebrow}>Canvas</p>
                        <h2 className={styles.stageTitle}>Build your meme</h2>
                    </div>
                    <p className={styles.stageHint}>
                        Tip: drag text to reposition and resize when selected.
                    </p>
                </div>

                <div className={styles.stageToolbar}>
                    <button
                        type="button"
                        onClick={handleUndo}
                        disabled={!history.length}
                        className={`${styles.actionButton} ${styles.actionButtonCompact}`}
                        aria-label="Undo"
                        title="Undo"
                    >
                        <FaUndo />
                        <span className={styles.actionLabel}>Undo</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleRedo}
                        disabled={!redoStack.length}
                        className={`${styles.actionButton} ${styles.actionButtonCompact}`}
                        aria-label="Redo"
                        title="Redo"
                    >
                        <FaRedo />
                        <span className={styles.actionLabel}>Redo</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleClear}
                        className={`${styles.actionButton} ${styles.actionButtonDanger} ${styles.actionButtonCompact}`}
                        aria-label="Clear canvas"
                        title="Clear"
                    >
                        <FaTrash />
                        <span className={styles.actionLabel}>Clear</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleDownloadImage}
                        className={`${styles.actionButton} ${styles.actionButtonPrimary} ${styles.actionButtonCompact}`}
                        aria-label="Download image"
                        title="Download"
                    >
                        <FaDownload />
                        <span className={styles.actionLabel}>Download</span>
                    </button>
                </div>

                <div className={styles.canvasShell}>
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
                        />

                        {visibleTexts.map((t) => (
                            <div
                                key={t.id}
                                onPointerDown={(e) => handlePointerDown(t, e)}
                                className={`${styles.text} ${
                                    selectedTextId === t.id
                                        ? styles.selected
                                        : ''
                                }`}
                                style={{
                                    left: t.x,
                                    top: t.y,
                                    fontSize: `${t.fontSize}px`,
                                    color: t.color,
                                    fontFamily: t.fontFamily,
                                    touchAction: 'none',
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
                </div>
            </section>

            <aside className={styles.sidebar}>
                <div className={styles.sidebarInner}>
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3>Base image</h3>
                        <p>Upload a file or start with a color wash.</p>
                    </div>
                    <div className={styles.panelGroup}>
                        <button
                            type="button"
                            onClick={handleFill}
                            className={styles.actionButton}
                        >
                            <FaPalette /> Random Color
                        </button>

                        <Upload onChange={handleChangePicture} />
                    </div>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3>Image filter</h3>
                        <p>Apply a look to the base image.</p>
                    </div>
                    <div className={styles.filterGrid}>
                        {FILTERS.map((filter) => (
                            <button
                                key={filter.id}
                                type="button"
                                className={`${styles.filterButton} ${
                                    imageFilter === filter.value
                                        ? styles.filterButtonActive
                                        : ''
                                }`}
                                onClick={() => handleFilterChange(filter.value)}
                                disabled={!image}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3>Export</h3>
                        <p>Choose output resolution.</p>
                    </div>
                    <div className={styles.exportGrid}>
                        {[1, 2, 3].map((scale) => (
                            <button
                                key={scale}
                                type="button"
                                className={`${styles.filterButton} ${
                                    exportScale === scale
                                        ? styles.filterButtonActive
                                        : ''
                                }`}
                                onClick={() => setExportScale(scale)}
                            >
                                {scale}x
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3>Text</h3>
                        <p>Add captions to the top or bottom.</p>
                    </div>
                    <div className={styles.panelGroup}>
                        <AddText onSubmit={handleAddText} position="top" />

                        <AddText onSubmit={handleAddText} position="bottom" />
                    </div>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3>Typography</h3>
                        <p>Dial in size, color, and font.</p>
                    </div>
                    <div className={styles.panelGroup}>
                        <FontSizeSlider
                            value={fontSize}
                            onChange={handleFontSizeChange}
                            onPointerDown={handleFontSizePointerDown}
                        />

                        <ColorPicker
                            value={color}
                            onChange={handleColorChange}
                            label="Font Color"
                        />

                        <FontFamilySelector
                            value={fontFamily}
                            onChange={handleFontFamilyChange}
                        />
                    </div>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3>Stroke</h3>
                        <p>Keep text readable on any background.</p>
                    </div>
                    <div className={styles.panelGroup}>
                        <StrokeWidthSlider
                            value={strokeWidth}
                            onChange={handleStrokeWidthChange}
                            onPointerDown={handleStrokeWidthPointerDown}
                        />

                        <ColorPicker
                            value={strokeColor}
                            onChange={handleStrokeColorChange}
                            label="Stroke Color"
                        />
                    </div>
                </div>

                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <h3>Layers</h3>
                        <p>Reorder text and image layers (lower is on top).</p>
                    </div>
                    <div className={styles.layerList}>
                        {layerOrder.length === 0 ? (
                            <p className={styles.layerEmpty}>
                                Add an image or text to start layering.
                            </p>
                        ) : (
                            layerOrder.map((layer, index) => {
                                const label =
                                    layer.type === 'image'
                                        ? 'Image'
                                        : texts.find(
                                              (text) => text.id === layer.id,
                                          )?.text || 'Text';
                                return (
                                    <div
                                        key={`${layer.type}-${layer.id}`}
                                        className={`${styles.layerRow} ${
                                            layer.type === 'text' &&
                                            selectedTextId === layer.id
                                                ? styles.layerRowActive
                                                : ''
                                        } ${
                                            dropTargetId === getLayerKey(layer)
                                                ? styles.layerRowDrop
                                                : ''
                                        }`}
                                        onClick={() =>
                                            handleSelectLayer(layer)
                                        }
                                        draggable
                                        onDragStart={() =>
                                            handleLayerDragStart(layer)
                                        }
                                        onDragOver={(event) =>
                                            handleLayerDragOver(event, layer)
                                        }
                                        onDrop={() => handleLayerDrop(layer)}
                                        onDragEnd={handleLayerDragEnd}
                                    >
                                        <span className={styles.layerLabel}>
                                            {label}
                                        </span>
                                        <div
                                            className={styles.layerActions}
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleLayerVisibility(layer)
                                                }
                                                aria-label={
                                                    layer.visible
                                                        ? 'Hide layer'
                                                        : 'Show layer'
                                                }
                                            >
                                                {layer.visible
                                                    ? 'Hide'
                                                    : 'Show'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveLayer(index, -1)
                                                }
                                                disabled={index === 0}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    moveLayer(index, 1)
                                                }
                                                disabled={
                                                    index ===
                                                    layerOrder.length - 1
                                                }
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                </div>
            </aside>
        </div>
    );
}

export default Main;
