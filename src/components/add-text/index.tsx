import { useState } from 'react';

interface AddTextProps {
    onSubmit: (text: string) => void;
}

function AddText({ onSubmit }: AddTextProps) {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = () => {
        if (inputValue.trim()) {
            onSubmit(inputValue)
            setInputValue('');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <input
                style={{ width: '60%' }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                type="text"
            />
            <button onClick={handleSubmit}>Add text</button>
        </div>
    );
}

export default AddText;
