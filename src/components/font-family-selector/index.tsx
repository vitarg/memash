import { ChangeEvent } from 'react';

interface FontFamilySelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const fonts = ['Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia'];

export default function FontFamilySelector({
    value,
    onChange,
}: FontFamilySelectorProps) {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    return (
        <div>
            <label htmlFor="font-family">Font Family</label>
            <select
                id="font-family"
                name="font-family"
                value={value}
                onChange={handleChange}
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
