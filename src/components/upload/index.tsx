import { Button } from '@/components/ui/button';
import type React from 'react';
import { useId } from 'react';

interface UploadProps {
    onChange: (file: File) => void;
}

function Upload({ onChange }: UploadProps) {
    const inputId = useId();

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
        <>
            <input
                className="sr-only"
                onChange={handleInputChange}
                type="file"
                id={inputId}
            />
            <div
                className="rounded-lg border border-dashed border-muted-foreground/50 bg-muted/30 p-4 text-sm text-muted-foreground transition-colors hover:border-muted-foreground"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                <p className="mb-3 text-foreground">Upload picture</p>
                <p className="mb-4 text-xs text-muted-foreground">
                    Drag and drop an image here, or choose a file
                </p>
                <Button
                    asChild
                    variant="outline"
                    className="w-full justify-center"
                >
                    <label htmlFor={inputId}>Select file</label>
                </Button>
            </div>
        </>
    );
}

export default Upload;
