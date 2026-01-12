import { ChangeEvent } from 'react';

interface FontSizeSliderProps {
    value: number;
    onChange: (value: number) => void;
}

export default function FontSizeSlider({
    value,
    onChange,
}: FontSizeSliderProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(Number(e.target.value));
    };

    return (
        <div>
            <label htmlFor="font-size">Font Size</label>
            <input
                type="range"
                id="font-size"
                name="font-size"
                min="10"
                max="100"
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}
