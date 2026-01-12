import type { ChangeEvent } from 'react';

interface FontSizeSliderProps {
    value: number;
    onChange: (value: number) => void;
    onPointerDown?: () => void;
}

export default function FontSizeSlider({
    value,
    onChange,
    onPointerDown,
}: FontSizeSliderProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(Number(e.target.value));
    };

    return (
        <div className="grid gap-2">
            <label htmlFor="font-size" className="text-sm font-medium">
                Font Size: {value}px
            </label>
            <input
                type="range"
                id="font-size"
                name="font-size"
                min="10"
                max="100"
                value={value}
                onChange={handleChange}
                onPointerDown={onPointerDown}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );
}
