import { ChangeEvent } from 'react';

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
        <div>
            <label htmlFor="stroke-width">Stroke Width</label>
            <input
                type="range"
                id="stroke-width"
                name="stroke-width"
                min="0"
                max="10"
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}
