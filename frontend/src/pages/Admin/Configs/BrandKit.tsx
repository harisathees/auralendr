import React, { useState, useEffect } from "react";
import api from "../../../api/apiClient";
import ImageUpload from "../../../components/Shared/ImageUpload";
import { toast } from "react-hot-toast";
import { Save } from "lucide-react";

interface BrandSettings {
    brand_name: string;
    brand_tagline: string;
    brand_address: string;
    brand_phone: string;
    brand_email: string;
    brand_website: string;
    brand_primary_color: string;
    brand_secondary_color: string;
    brand_logo_url?: string;
}

const BrandKit: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<BrandSettings>({
        brand_name: "",
        brand_tagline: "",
        brand_address: "",
        brand_phone: "",
        brand_email: "",
        brand_website: "",
        brand_primary_color: "#000000",
        brand_secondary_color: "#ffffff",
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoRemoved, setLogoRemoved] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get("/api/brand-settings");
            setSettings((prev) => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error("Failed to fetch brand settings", error);
            toast.error("Failed to load brand configuration");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (file: File | null) => {
        if (file) {
            setLogoFile(file);
            setLogoRemoved(false);
        } else {
            setLogoFile(null);
            // If we are clearing the file input, we don't necessarily mean "remove from server" unless it was explicitly removed.
            // But ImageUpload calls onChange(null) when removed.
            // We should distinguish between "File Removed" (user clicked remove) vs "No file selected".
            // The ImageUpload component handles preview. If onChange(null) is called, it means no file is selected.
            // We can assume if file is null, we might want to remove it IF there was an initial URL and user clicked remove.
        }
    };

    // Wrapper for ImageUpload onRemove to set the flag
    const handleLogoRemove = () => {
        setLogoRemoved(true);
        setLogoFile(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const formData = new FormData();

            Object.entries(settings).forEach(([key, value]) => {
                if (key !== 'brand_logo_url' && value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            if (logoFile) {
                formData.append("brand_logo", logoFile);
            }

            if (logoRemoved && !logoFile) {
                formData.append("brand_logo_remove", "true");
            }

            // Important: Set Content-Type header to undefined to let browser set it with boundary
            await api.post("/api/brand-settings", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Brand settings updated successfully");
            // Refresh to get new URLs etc
            fetchSettings();
            setLogoFile(null);
            setLogoRemoved(false);
        } catch (error) {
            console.error("Failed to save brand settings", error);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading configurations...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brand Kit</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your organization's identity, logos, and colors.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identity Section */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">badge</span>
                        Identity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <ImageUpload
                                label="Brand Logo"
                                initialUrl={settings.brand_logo_url}
                                onChange={handleLogoChange}
                                onRemove={handleLogoRemove}
                                accept="image/png,image/jpeg,image/svg+xml"
                                maxSizeMB={2}
                            />
                            <p className="text-xs text-gray-500 mt-2">Recommended: 500x500px transparent PNG</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    name="brand_name"
                                    value={settings.brand_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. Aura Finance"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline / Slogan</label>
                                <input
                                    type="text"
                                    name="brand_tagline"
                                    value={settings.brand_tagline}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="e.g. Loans made simple"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-500">contact_mail</span>
                        Contact Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="brand_email"
                                value={settings.brand_email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="contact@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                            <input
                                type="text"
                                name="brand_phone"
                                value={settings.brand_phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website URL</label>
                            <input
                                type="url"
                                name="brand_website"
                                value={settings.brand_website}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="https://example.com"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Physical Address</label>
                            <textarea
                                name="brand_address"
                                value={settings.brand_address}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                                placeholder="123 Business St, City, Country"
                            />
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">palette</span>
                        Appearance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    name="brand_primary_color"
                                    value={settings.brand_primary_color}
                                    onChange={handleChange}
                                    className="h-10 w-20 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    name="brand_primary_color"
                                    value={settings.brand_primary_color}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    name="brand_secondary_color"
                                    value={settings.brand_secondary_color}
                                    onChange={handleChange}
                                    className="h-10 w-20 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    name="brand_secondary_color"
                                    value={settings.brand_secondary_color}
                                    onChange={handleChange}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all uppercase"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default BrandKit;
