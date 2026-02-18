import React, { useState } from 'react';
import { Download, FileText, Database } from 'lucide-react';
import api from '../../../../api/apiClient';
import { useToast } from '../../../../context/Toast/ToastContext';

const DataBackup = () => {
    const [loading, setLoading] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleDownload = async (type: 'raw' | 'readable') => {
        setLoading(type);
        try {
            const response = await api.get(`/backup/export?type=${type}`, {
                responseType: 'blob', // Important for file download
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `auralendr_backup_${type}_${date}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showToast(`Your ${type} backup is downloading.`, 'success');
        } catch (error) {
            console.error("Backup failed", error);
            showToast("Could not generate backup. Please try again.", "error");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex flex-col h-full relative space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Data Backup</h2>
                    <p className="text-muted-foreground text-gray-500 dark:text-gray-400">
                        Export your system data for local backup or analysis.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 flex flex-col items-start gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Raw Data Export</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                            Direct dump of database tables. Includes IDs, foreign keys, and raw timestamps.
                            Best for technical backups and re-importing.
                        </p>
                    </div>
                    <button
                        onClick={() => handleDownload('raw')}
                        disabled={loading !== null}
                        className="w-full mt-auto flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading === 'raw' ? 'Generating...' : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Raw (.zip)
                            </>
                        )}
                    </button>
                </div>

                <div className="p-6 flex flex-col items-start gap-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Readable Data Export</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                            Processed data with resolved names and formatted dates.
                            IDs are replaced with Names where possible. Best for business analysis and reporting.
                        </p>
                    </div>
                    <button
                        onClick={() => handleDownload('readable')}
                        disabled={loading !== null}
                        className="w-full mt-auto flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-600/20"
                    >
                        {loading === 'readable' ? 'Generating...' : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Readable (.zip)
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-sm text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800">
                <p>
                    <strong>Note:</strong> Large datasets may take a few moments to generate.
                    The backup includes: Users, Loans, Pledges, Repledges, Transactions, Payments, and Capital Sources.
                </p>
            </div>
        </div>
    );
};

export default DataBackup;
