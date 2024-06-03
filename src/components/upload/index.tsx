import React from 'react';

interface UploadProps {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function Upload({ onChange }: UploadProps) {
    return (
        <div className="file-input">
            <label htmlFor="picture">Upload picture</label>
            <input className="file" onChange={onChange} type="file" id="picture" />
        </div>
    );
}

export default Upload;
