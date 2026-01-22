import React, { useState, useEffect } from 'react';
import api from '../../api/apiClient';

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    mediaId?: number | null;
    fallbackSrc?: string | null;
}

const SecureImage: React.FC<SecureImageProps> = ({
    mediaId,
    fallbackSrc,
    className,
    alt,
    ...props
}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        let active = true;
        let objectUrl: string | null = null;

        const load = async () => {
            setLoading(true);
            setError(false);

            try {
                // Strategy 1: If mediaId is present, try secure stream
                if (mediaId) {
                    try {
                        const response = await api.get(`/api/media/${mediaId}/stream`, {
                            responseType: 'blob'
                        });

                        if (active) {
                            objectUrl = URL.createObjectURL(response.data);
                            setImageUrl(objectUrl);
                            setLoading(false);
                        }
                        return;
                    } catch (e) {
                        console.warn(`Secure load failed for media ${mediaId}, falling back...`, e);
                        // Fall through to fallbackSrc
                    }
                }

                // Strategy 2: If no mediaId or secure fetch failed, use fallbackSrc
                if (fallbackSrc) {
                    // If fallbackSrc is a relative API path but not /stream, we might need to fetch it too
                    // Use a simple image load check
                    const img = new Image();
                    img.src = fallbackSrc;
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                    });

                    if (active) {
                        setImageUrl(fallbackSrc);
                        setLoading(false);
                    }
                } else {
                    throw new Error("No source available");
                }

            } catch (err) {
                if (active) {
                    console.error("Image load failed", err);
                    setError(true);
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            active = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [mediaId, fallbackSrc]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`} style={{ minHeight: '100px' }}>
                <span className="material-symbols-outlined text-gray-400 animate-spin">progress_activity</span>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 ${className}`} style={{ minHeight: '100px' }}>
                <span className="material-symbols-outlined text-3xl opacity-50">broken_image</span>
                <span className="text-[10px] mt-1">Failed to load</span>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt || "Secure Image"}
            className={className}
            {...props}
        />
    );
};

export default SecureImage;
