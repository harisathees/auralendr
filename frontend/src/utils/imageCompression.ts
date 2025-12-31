/**
 * Compresses an image file client-side.
 * 
 * @param file The original image file
 * @param maxWidth The maximum width for the compressed image
 * @param quality Quality from 0.0 to 1.0
 * @returns A promise that resolves to the compressed Blob/File
 */
export const compressImage = async (file: File, maxWidth = 800, quality = 0.5): Promise<File> => {
    // If not an image, return as is
    if (!file.type.startsWith('image/')) {
        return file;
    }

    return new Promise((resolve, reject) => {
        // Use createObjectURL instead of FileReader to avoid large base64 strings in memory
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = objectUrl;

        img.onload = () => {
            // Revoke immediately after load to free memory
            URL.revokeObjectURL(objectUrl);

            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Scale down if exceeds maxWidth
            if (width > maxWidth) {
                height = (maxWidth / width) * height;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(file); // Fallback to original
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            // Always use image/jpeg for best compression
            const outputType = 'image/jpeg';
            // Replace extension in name if it's not already .jpg or .jpeg
            let fileName = file.name;
            if (!fileName.toLowerCase().endsWith('.jpg') && !fileName.toLowerCase().endsWith('.jpeg')) {
                const lastDot = fileName.lastIndexOf('.');
                if (lastDot !== -1) {
                    fileName = fileName.substring(0, lastDot) + '.jpg';
                } else {
                    fileName += '.jpg';
                }
            }

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }
                    // Create a new file from the blob
                    const compressedFile = new File([blob], fileName, {
                        type: outputType,
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                },
                outputType,
                quality
            );
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
        };
    });
};
