import React, { useState, useEffect } from 'react';
import api from '../../../api/apiClient';

interface SecureAudioProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
    mediaId?: number | null;
    fallbackSrc?: string | null;
}

const SecureAudio: React.FC<SecureAudioProps> = ({
    mediaId,
    fallbackSrc,
    className,
    ...props
}) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
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
                        const response = await api.get(`/media/${mediaId}/stream`, {
                            responseType: 'blob'
                        });

                        if (active) {
                            objectUrl = URL.createObjectURL(response.data);
                            setAudioUrl(objectUrl);
                            setLoading(false);
                        }
                        return;
                    } catch (e) {
                        console.warn(`Secure load failed for audio ${mediaId}, falling back...`, e);
                    }
                }

                // Strategy 2: If no mediaId or secure fetch failed, use fallbackSrc
                if (fallbackSrc) {
                    if (active) {
                        setAudioUrl(fallbackSrc);
                        setLoading(false);
                    }
                } else {
                    throw new Error("No source available");
                }

            } catch (err) {
                if (active) {
                    console.error("Audio load failed", err);
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
            <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 ${className}`}>
                <span className="material-symbols-outlined text-gray-400 animate-spin text-sm">progress_activity</span>
                <span className="text-xs text-gray-500 ml-2">Loading Audio...</span>
            </div>
        );
    }

    if (error || !audioUrl) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 text-gray-400 ${className}`}>
                <span className="material-symbols-outlined text-sm opacity-50">broken_image</span>
                <span className="text-xs ml-2">Audio unavailable</span>
            </div>
        );
    }

    return (
        <audio
            controls
            src={audioUrl}
            className={className}
            {...props}
        />
    );
};

export default SecureAudio;
