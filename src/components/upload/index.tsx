import React from 'react';

interface UploadProps {
    onChange: (file: File) => void;
}

function Upload({ onChange }: UploadProps) {
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onChange(file);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            onChange(file);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    return (
        <div className="file-input" onDrop={handleDrop} onDragOver={handleDragOver}>
            <label htmlFor="picture">Upload picture</label>
            <input className="file" onChange={handleInputChange} type="file" id="picture" />
        </div>
    );
}

export default Upload;
