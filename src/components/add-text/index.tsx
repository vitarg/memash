import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
        <div className="flex items-center gap-2">
            <Input
                className="flex-1"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                type="text"
                placeholder={position[0].toUpperCase() + position.slice(1)}
            />
            <Button type="button" onClick={handleSubmit} size="sm" variant="secondary">
                <FaPlus /> Add text
            </Button>
        </div>
    );
}

export default AddText;
