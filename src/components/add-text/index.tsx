import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

interface AddTextProps {
    onSubmit: (text: string, position: 'top' | 'bottom') => void;
    position: 'top' | 'bottom';
}

function AddText({ onSubmit, position }: AddTextProps) {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = () => {
        if (inputValue.trim()) {
            onSubmit(inputValue, position);
            setInputValue('');
        }
    };

    return (
        <div
            style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
        >
            <input
                style={{ width: '60%' }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                type="text"
                placeholder={position[0].toUpperCase() + position.slice(1)}
            />
            <button onClick={handleSubmit}>
                <FaPlus /> Add text
            </button>
        </div>
    );
}

export default AddText;
