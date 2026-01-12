import type { ChangeEvent } from 'react';

interface FontFamilySelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const fonts = [
    'Anton',
    'Arial',
    'Verdana',
    'Times New Roman',
    'Courier New',
    'Georgia',
];

export default function FontFamilySelector({
    value,
    onChange,
}: FontFamilySelectorProps) {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="grid gap-2">
            <label htmlFor="font-family" className="text-sm font-medium">
                Font Family
            </label>
            <select
                id="font-family"
                name="font-family"
                value={value}
                onChange={handleChange}
                className="w-full h-10 px-3 py-2 bg-muted rounded-lg cursor-pointer"
            >
                {fonts.map((font) => (
                    <option key={font} value={font}>
                        {font}
                    </option>
                ))}
            </select>
        </div>
    );
}
