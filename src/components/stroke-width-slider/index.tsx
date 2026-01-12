import type { ChangeEvent } from 'react';

interface StrokeWidthSliderProps {
    value: number;
    onChange: (value: number) => void;
}

export default function StrokeWidthSlider({
    value,
    onChange,
}: StrokeWidthSliderProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(Number(e.target.value));
    };

    return (
        <div className="grid gap-2">
            <label htmlFor="stroke-width" className="text-sm font-medium">
                Stroke Width: {value}px
            </label>
            <input
                type="range"
                id="stroke-width"
                name="stroke-width"
                min="0"
                max="10"
                value={value}
                onChange={handleChange}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );
}
