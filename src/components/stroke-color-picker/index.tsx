import { ChangeEvent } from 'react';

interface StrokeColorPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export default function StrokeColorPicker({
    value,
    onChange,
}: StrokeColorPickerProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div>
            <label htmlFor="stroke-color">Stroke Color</label>
            <input
                type="color"
                id="stroke-color"
                name="stroke-color"
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}
