import React, { useState, useEffect } from "react";

interface ImageUploadProps {
    label: string;
    onChange: (file: File | null) => void;
    onRemove?: () => void;
    initialUrl?: string | null;
    className?: string;
    accept?: string;
    maxSizeMB?: number; // Default 2MB
    error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    label,
    onChange,
    onRemove,
    initialUrl,
    className = "",
    accept = "image/jpeg,image/png,image/jpg",
    maxSizeMB = 2,
    error: paramsError,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
    const [internalError, setInternalError] = useState<string | null>(null);

    // Sync initialUrl if it changes and we don't have a new file
    useEffect(() => {
        if (!file && initialUrl) {
            setPreviewUrl(initialUrl);
        }
    }, [initialUrl, file]);

    // Cleanup object URL
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        setInternalError(null);

        if (!selectedFile) return;

        // Validate Size
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            setInternalError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        // Validate Type
        if (!accept.includes(selectedFile.type)) {
            setInternalError("Invalid file type. Please upload an image.");
            return;
        }

        // Revoke old URL if exists
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }

        setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
        onChange(selectedFile);
    };

    const handleRemove = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setFile(null);
        setPreviewUrl(null);
        setInternalError(null);
        onChange(null);
        if (onRemove) onRemove();
    };

    const displayError = paramsError || internalError;

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            <label className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                {label}
            </label>

            <div className={`relative flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-lg transition-colors ${displayError ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}>

                {previewUrl ? (
                    <div className="relative w-full h-full min-h-[160px] p-2">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-md max-h-[200px]"
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                            title="Remove Image"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">close</span>
                        </button>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer py-6">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">cloud_upload</span>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                JPG, PNG (MAX. {maxSizeMB}MB)
                            </p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept={accept}
                            onChange={handleFileChange}
                        />
                    </label>
                )}
            </div>

            {displayError && (
                <span className="text-xs text-red-500 font-medium">{displayError}</span>
            )}
        </div>
    );
};

export default ImageUpload;
