import { ChangeEvent } from 'react';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div>
            <label htmlFor="font-color">Font Color</label>
            <input
                type="color"
                id="font-color"
                name="font-color"
                value={value}
                onChange={handleChange}
            />
        </div>
    );
}
