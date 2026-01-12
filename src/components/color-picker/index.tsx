import type { ChangeEvent } from 'react';

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
}

export default function ColorPicker({
    value,
    onChange,
    label,
}: ColorPickerProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="grid gap-2">
            <label htmlFor="font-color" className="text-sm font-medium">
                {label}
            </label>
            <input
                type="color"
                id="font-color"
                name="font-color"
                value={value}
                onChange={handleChange}
                className="w-full h-10 px-1 py-1 bg-muted rounded-lg cursor-pointer"
            />
        </div>
    );
}
