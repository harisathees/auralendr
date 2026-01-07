import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import apiClient from "../../../../../api/apiClient";

interface ReceiptField {
    id: string;
    type: 'text' | 'image';
    label: string;
    dataKey: string;
    fontSize?: number;
    fontWeight?: "normal" | "medium" | "bold" | "black";
    align: "left" | "center" | "right";
    visible: boolean;
    x: number;
    y: number;
    width: number;
    height?: number;
    imageUrl?: string;
}

const DEFAULT_FIELDS: ReceiptField[] = [
    { id: '1', type: 'text', label: 'Pledge No', dataKey: 'pledge_no', x: 10, y: 40, width: 80, fontSize: 14, fontWeight: 'bold', align: 'left', visible: true },
    { id: '2', type: 'text', label: 'Date', dataKey: 'date', x: 110, y: 40, width: 80, fontSize: 12, fontWeight: 'normal', align: 'right', visible: true },
    { id: '3', type: 'text', label: 'Company Name', dataKey: 'company_name', x: 0, y: 10, width: 210, fontSize: 24, fontWeight: 'black', align: 'center', visible: true },
    { id: 'logo', type: 'image', label: 'Company Logo', dataKey: 'logo', x: 90, y: 25, width: 30, height: 30, visible: true, align: 'center' },
    { id: '4', type: 'text', label: 'Customer Name', dataKey: 'customer_name', x: 10, y: 75, width: 190, fontSize: 12, fontWeight: 'bold', align: 'left', visible: true },
    { id: '5', type: 'text', label: 'Loan Amount', dataKey: 'amount', x: 10, y: 110, width: 190, fontSize: 18, fontWeight: 'black', align: 'left', visible: true },
];

const ReceiptTemplateNew: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<"layout" | "fields" | "styles">("fields");
    const [templateName, setTemplateName] = useState("Standard Receipt Template");
    const [margin, setMargin] = useState({ top: 10, right: 10, bottom: 10, left: 10 });
    const [fields, setFields] = useState<ReceiptField[]>(DEFAULT_FIELDS);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [saving, setSaving] = useState(false);

    // Interaction State
    const [interaction, setInteraction] = useState<{
        type: 'drag' | 'resize-left' | 'resize-right' | 'resize-font' | 'resize-height' | null;
        fieldId: string | null;
        startX: number;
        startY: number;
        startFieldX: number;
        startFieldY: number;
        startFieldW: number;
        startFieldH: number;
        startFieldFS: number;
    }>({
        type: null,
        fieldId: null,
        startX: 0,
        startY: 0,
        startFieldX: 0,
        startFieldY: 0,
        startFieldW: 0,
        startFieldH: 10,
        startFieldFS: 12
    });

    const MM_TO_PX = 3.78;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!interaction.type || !interaction.fieldId) return;

            const deltaX = (e.clientX - interaction.startX) / (scale);
            const deltaY = (e.clientY - interaction.startY) / (scale);

            const deltaXMM = deltaX / MM_TO_PX;
            const deltaYMM = deltaY / MM_TO_PX;

            setFields(prev => prev.map(f => {
                if (f.id !== interaction.fieldId) return f;

                if (interaction.type === 'drag') {
                    return {
                        ...f,
                        x: Math.round(Math.max(0, interaction.startFieldX + deltaXMM) * 1000) / 1000,
                        y: Math.round(Math.max(0, interaction.startFieldY + deltaYMM) * 1000) / 1000
                    };
                } else if (interaction.type === 'resize-right') {
                    return {
                        ...f,
                        width: Math.round(Math.max(5, interaction.startFieldW + deltaXMM) * 1000) / 1000
                    };
                } else if (interaction.type === 'resize-left') {
                    const newWidth = Math.max(5, interaction.startFieldW - deltaXMM);
                    // Adjust X to maintain right edge position
                    const widthDiff = newWidth - interaction.startFieldW;
                    return {
                        ...f,
                        width: Math.round(newWidth * 1000) / 1000,
                        x: Math.round((interaction.startFieldX - widthDiff) * 1000) / 1000
                    };
                } else if (interaction.type === 'resize-height') {
                    return {
                        ...f,
                        height: Math.round(Math.max(5, interaction.startFieldH + deltaYMM) * 1000) / 1000
                    };
                } else if (interaction.type === 'resize-font') {
                    // Vertical drag for font size (drag down = increase)
                    return {
                        ...f,
                        fontSize: Math.max(6, Math.min(72, interaction.startFieldFS + (deltaY / 2)))
                    };
                }
                return f;
            }));
        };

        const handleMouseUp = () => {
            setInteraction(prev => ({ ...prev, type: null, fieldId: null }));
        };

        if (interaction.type) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [interaction, scale]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedFieldId) return;

            // Guard: Don't move if user is typing in an input or textarea
            const isTyping = document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA';
            if (isTyping) return;

            const step = e.shiftKey ? 5 : 1; // 5mm with shift, 1mm regular

            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault(); // Prevent page scroll

                setFields(prev => prev.map(f => {
                    if (f.id !== selectedFieldId) return f;

                    switch (e.key) {
                        case 'ArrowUp': return { ...f, y: Math.round(Math.max(0, f.y - step) * 1000) / 1000 };
                        case 'ArrowDown': return { ...f, y: Math.round((f.y + step) * 1000) / 1000 };
                        case 'ArrowLeft': return { ...f, x: Math.round(Math.max(0, f.x - step) * 1000) / 1000 };
                        case 'ArrowRight': return { ...f, x: Math.round((f.x + step) * 1000) / 1000 };
                        default: return f;
                    }
                }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedFieldId]);

    const handlePublish = async () => {
        setSaving(true);
        try {
            const payload = {
                name: templateName,
                papersize: { width: configWidth, height: configHeight, unit: 'mm' },
                orientation: configOrientation,
                margin: margin,
                layout_config: fields,
                status: 'active'
            };

            console.log("Publishing template:", payload);
            await apiClient.post("/receipt-templates", payload);
            toast.success("Template published successfully!");
            navigate("/admin/configs/templates/receipt"); // Go back to list
        } catch (error) {
            console.error(error);
            toast.error("Failed to publish template");
        } finally {
            setSaving(false);
        }
    };
    const containerRef = React.useRef<HTMLDivElement>(null);
    const paperRef = React.useRef<HTMLDivElement>(null);

    // Get dimensions from URL or default to A4
    const baseWidth = Number(searchParams.get("w")) || 210;
    const baseHeight = Number(searchParams.get("h")) || 297;
    const configOrientation = searchParams.get("o") || "portrait";

    const configWidth = configOrientation === "landscape" ? Math.max(baseWidth, baseHeight) : Math.min(baseWidth, baseHeight);
    const configHeight = configOrientation === "landscape" ? Math.min(baseWidth, baseHeight) : Math.max(baseWidth, baseHeight);

    useEffect(() => {
        const calculateScale = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth - 96; // 48px padding on each side
                const paperWidthPx = configWidth * 3.78; // 1mm ≈ 3.78px

                if (paperWidthPx > containerWidth) {
                    setScale(containerWidth / paperWidthPx);
                } else {
                    setScale(1);
                }
            }
        };

        calculateScale();
        window.addEventListener("resize", calculateScale);
        return () => window.removeEventListener("resize", calculateScale);
    }, [configWidth]);

    return (
        <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] pb-24">
            {/* Navigation Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
                <div className="max-w-[1920px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/configs"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="material-symbols-outlined text-blue-600 text-sm">edit</span>
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    className="bg-transparent border-none p-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 focus:outline-none w-64"
                                    placeholder="Enter template name..."
                                />
                                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-wider">Draft</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Configuring {configWidth}x{configHeight}mm ({configOrientation}) canvas</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            Discard
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={saving}
                            className="h-10 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-sm">publish</span>
                            )}
                            Publish Changes
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1920px] mx-auto w-full p-6 grid grid-cols-12 gap-6 overflow-hidden">
                {/* Left Sidebar: Components & Settings */}
                <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-6">
                    {/* Mode Selector */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-1.5 border border-slate-200/60 dark:border-slate-800 flex shadow-sm">
                        {(["layout", "fields", "styles"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSelectedTab(tab)}
                                className={`
                                    flex-1 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all
                                    ${selectedTab === tab
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }
                                `}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Settings Panel */}
                    {selectedTab !== "layout" && (
                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-8">
                                {/* Fields Tab Content */}
                                {selectedTab === "fields" && (
                                    <section className="animate-in fade-in slide-in-from-left-4 duration-300">
                                        {selectedFieldId ? (
                                            <div className="space-y-6">
                                                <button
                                                    onClick={() => setSelectedFieldId(null)}
                                                    className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-4 hover:underline"
                                                >
                                                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                                                    Back to List
                                                </button>

                                                {(() => {
                                                    const field = fields.find(f => f.id === selectedFieldId);
                                                    if (!field) return null;

                                                    const updateField = (updates: Partial<ReceiptField>) => {
                                                        setFields(fields.map(f => f.id === selectedFieldId ? { ...f, ...updates } : f));
                                                    };

                                                    return (
                                                        <div className="space-y-6">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Display Label & Key</label>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <input
                                                                        type="text"
                                                                        value={field.label}
                                                                        onChange={(e) => updateField({ label: e.target.value })}
                                                                        placeholder="Label"
                                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={field.dataKey}
                                                                        onChange={(e) => updateField({ dataKey: e.target.value })}
                                                                        placeholder="Data Key"
                                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Field Type</label>
                                                                <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1 gap-1">
                                                                    {(['text', 'image'] as const).map((type) => (
                                                                        <button
                                                                            key={type}
                                                                            onClick={() => updateField({
                                                                                type,
                                                                                // Set defaults if switching
                                                                                ...(type === 'text' ? { fontSize: 12, fontWeight: 'normal' } : { height: 30 })
                                                                            })}
                                                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all capitalize ${field.type === type ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-400"}`}
                                                                        >
                                                                            {type}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {field.type === 'text' ? (
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Typography</label>
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="relative">
                                                                            <input
                                                                                type="number"
                                                                                value={field.fontSize}
                                                                                onChange={(e) => updateField({ fontSize: Number(e.target.value) })}
                                                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                                            />
                                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">PX</span>
                                                                        </div>
                                                                        <select
                                                                            value={field.fontWeight}
                                                                            onChange={(e) => updateField({ fontWeight: e.target.value as any })}
                                                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                                        >
                                                                            <option value="normal">Normal</option>
                                                                            <option value="medium">Medium</option>
                                                                            <option value="bold">Bold</option>
                                                                            <option value="black">Black</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Image URL (Optional placeholder)</label>
                                                                    <input
                                                                        type="text"
                                                                        value={field.imageUrl || ""}
                                                                        onChange={(e) => updateField({ imageUrl: e.target.value })}
                                                                        placeholder="https://example.com/logo.png"
                                                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                                    />
                                                                </div>
                                                            )}

                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Alignment</label>
                                                                <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1 gap-1">
                                                                    {(['left', 'center', 'right'] as const).map((align) => (
                                                                        <button
                                                                            key={align}
                                                                            onClick={() => updateField({ align })}
                                                                            className={`flex-1 py-2 rounded-lg transition-all ${field.align === align ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-400"}`}
                                                                        >
                                                                            <span className="material-symbols-outlined text-lg">{`format_align_${align}`}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Position & Length (mm)</label>
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    <div className="space-y-1">
                                                                        <span className="text-[9px] font-bold text-slate-400">X</span>
                                                                        <input
                                                                            type="number"
                                                                            value={field.x}
                                                                            onChange={(e) => updateField({ x: Number(e.target.value) })}
                                                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <span className="text-[9px] font-bold text-slate-400">Y</span>
                                                                        <input
                                                                            type="number"
                                                                            value={field.y}
                                                                            onChange={(e) => updateField({ y: Number(e.target.value) })}
                                                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold"
                                                                        />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <span className="text-[9px] font-bold text-slate-400">Width</span>
                                                                        <input
                                                                            type="number"
                                                                            value={field.width}
                                                                            onChange={(e) => updateField({ width: Number(e.target.value) })}
                                                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold"
                                                                        />
                                                                    </div>
                                                                    {field.type === 'image' && (
                                                                        <div className="space-y-1">
                                                                            <span className="text-[9px] font-bold text-slate-400">Height</span>
                                                                            <input
                                                                                type="number"
                                                                                value={field.height || 30}
                                                                                onChange={(e) => updateField({ height: Number(e.target.value) })}
                                                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold opacity-100"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                                                <span className="text-xs font-bold text-slate-600">Visible on Receipt</span>
                                                                <button
                                                                    onClick={() => updateField({ visible: !field.visible })}
                                                                    className={`w-12 h-6 rounded-full transition-all relative ${field.visible ? "bg-blue-600" : "bg-slate-300"}`}
                                                                >
                                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${field.visible ? "right-1" : "left-1"}`}></div>
                                                                </button>
                                                            </div>

                                                            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm('Are you sure you want to delete this field?')) {
                                                                            setFields(fields.filter(f => f.id !== selectedFieldId));
                                                                            setSelectedFieldId(null);
                                                                        }
                                                                    }}
                                                                    className="flex-1 py-3 rounded-xl border border-red-100 dark:border-red-900/30 text-red-600 font-bold text-xs hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                                    Delete Field
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px]">Field List</h3>
                                                    <button
                                                        onClick={() => {
                                                            const newField: ReceiptField = {
                                                                id: Date.now().toString(),
                                                                type: 'text',
                                                                label: 'New Field',
                                                                dataKey: 'key',
                                                                x: 10,
                                                                y: 20,
                                                                width: 100,
                                                                fontSize: 12,
                                                                fontWeight: 'normal',
                                                                align: 'left',
                                                                visible: true
                                                            };
                                                            setFields([...fields, newField]);
                                                            setSelectedFieldId(newField.id);
                                                        }}
                                                        className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">add</span>
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {fields.map((field) => (
                                                        <div
                                                            key={field.id}
                                                            className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${selectedFieldId === field.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm" : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                                                            onClick={() => setSelectedFieldId(field.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${field.visible ? "bg-blue-50 dark:bg-blue-900/20" : "bg-slate-100 dark:bg-slate-800 opacity-50"}`}>
                                                                    <span className={`material-symbols-outlined text-lg ${field.visible ? "text-blue-600" : "text-slate-400"}`}>
                                                                        {field.visible ? "check_circle" : "visibility_off"}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{field.label}</div>
                                                                    <div className="text-[10px] text-slate-400 font-mono">#{field.dataKey}</div>
                                                                </div>
                                                            </div>
                                                            <span className="material-symbols-outlined text-slate-300 group-hover:text-blue-500 transition-all">chevron_right</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </section>
                                )}

                                {selectedTab === "styles" && (
                                    <section className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
                                        <div>
                                            <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-4">Canvas Settings</h3>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/50">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="material-symbols-outlined text-blue-600">info</span>
                                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Fixed Layout</span>
                                                </div>
                                                <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                                                    Dimensions and orientation are fixed once the canvas is created. To change them, return to the setup page.
                                                </p>
                                            </div>

                                            <div className="mt-8">
                                                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-4">Page Margins (mm)</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {(['top', 'bottom', 'left', 'right'] as const).map((dir) => (
                                                        <div key={dir}>
                                                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">{dir}</label>
                                                            <input
                                                                type="number"
                                                                value={margin[dir]}
                                                                onChange={(e) => setMargin({ ...margin, [dir]: Number(e.target.value) })}
                                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center py-4 border-t border-slate-100 dark:border-slate-800">
                                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <span className="material-symbols-outlined text-slate-300 text-2xl">palette</span>
                                            </div>
                                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Style Editor</h3>
                                            <p className="text-[10px] text-slate-500 mt-1 italic">Typography and color customization coming soon...</p>
                                        </div>
                                    </section>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Area: Interactive Preview */}
                <div
                    ref={containerRef}
                    className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden relative"
                >
                    {/* Preview Toolbar */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                                <button className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm"><span className="material-symbols-outlined text-lg">computer</span></button>
                                <button className="p-1.5 rounded-lg text-slate-500"><span className="material-symbols-outlined text-lg">tablet</span></button>
                                <button className="p-1.5 rounded-lg text-slate-500"><span className="material-symbols-outlined text-lg">smartphone</span></button>
                            </div>
                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Live Canvas ({configOrientation}) {scale < 1 && <span className="text-amber-500 ml-1">({Math.round(scale * 100)}%)</span>}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-lg text-slate-500">zoom_out</span>
                            </button>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{Math.round(scale * 100)}%</span>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                <span className="material-symbols-outlined text-lg text-slate-500">zoom_in</span>
                            </button>
                        </div>
                    </div>

                    {/* Infinite Canvas */}
                    <div
                        className="flex-1 bg-slate-50 dark:bg-slate-950 p-12 overflow-auto flex justify-center items-start pattern-grid hide-scrollbar"
                        onMouseDown={() => setSelectedFieldId(null)}
                    >
                        <div
                            ref={paperRef}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="bg-white shadow-2xl shadow-slate-200/50 dark:shadow-none transform origin-top transition-all relative flex flex-col"
                            style={{
                                width: `${configWidth}mm`,
                                height: `${configHeight}mm`,
                                padding: `${margin.top}mm ${margin.right}mm ${margin.bottom}mm ${margin.left}mm`,
                                transform: `scale(${scale})`,
                                marginBottom: `-${(1 - scale) * configHeight}mm` // Pull up bottom space
                            }}
                        >
                            {/* Inner Canvas Area (Relative for absolute fields) */}
                            <div className="relative flex-1">
                                {fields.filter(f => f.visible).map((field) => (
                                    <div
                                        key={field.id}
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setSelectedFieldId(field.id);
                                            setSelectedTab("fields");
                                            setInteraction({
                                                type: 'drag',
                                                fieldId: field.id,
                                                startX: e.clientX,
                                                startY: e.clientY,
                                                startFieldX: field.x,
                                                startFieldY: field.y,
                                                startFieldW: field.width,
                                                startFieldH: field.height || 10,
                                                startFieldFS: field.fontSize || 12
                                            });
                                        }}
                                        className={`absolute cursor-move active:cursor-grabbing group transition-shadow ${selectedFieldId === field.id ? "ring-2 ring-blue-500 z-10 shadow-xl" : "hover:bg-slate-50/50"}`}
                                        style={{
                                            left: `${field.x}mm`,
                                            top: `${field.y}mm`,
                                            width: `${field.width}mm`,
                                            textAlign: field.align,
                                        }}
                                    >
                                        {/* Resize Handles */}
                                        {selectedFieldId === field.id && (
                                            <>
                                                {/* Left Handle */}
                                                <div
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        setInteraction({
                                                            type: 'resize-left',
                                                            fieldId: field.id,
                                                            startX: e.clientX,
                                                            startY: e.clientY,
                                                            startFieldX: field.x,
                                                            startFieldY: field.y,
                                                            startFieldW: field.width,
                                                            startFieldH: field.height || 10,
                                                            startFieldFS: field.fontSize || 12
                                                        });
                                                    }}
                                                    className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 cursor-ew-resize bg-white border-2 border-blue-500 rounded-full z-20 hover:scale-125 transition-transform shadow-sm"
                                                />

                                                {/* Right Handle */}
                                                <div
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        setInteraction({
                                                            type: 'resize-right',
                                                            fieldId: field.id,
                                                            startX: e.clientX,
                                                            startY: e.clientY,
                                                            startFieldX: field.x,
                                                            startFieldY: field.y,
                                                            startFieldW: field.width,
                                                            startFieldH: field.height || 10,
                                                            startFieldFS: field.fontSize || 12
                                                        });
                                                    }}
                                                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 cursor-ew-resize bg-white border-2 border-blue-500 rounded-full z-20 hover:scale-125 transition-transform shadow-sm"
                                                />

                                                {/* Bottom Handle (Font Size / Height) */}
                                                <div
                                                    onMouseDown={(e) => {
                                                        e.stopPropagation();
                                                        setInteraction({
                                                            type: field.type === 'image' ? 'resize-height' : 'resize-font',
                                                            fieldId: field.id,
                                                            startX: e.clientX,
                                                            startY: e.clientY,
                                                            startFieldX: field.x,
                                                            startFieldY: field.y,
                                                            startFieldW: field.width,
                                                            startFieldH: field.height || 10,
                                                            startFieldFS: field.fontSize || 12
                                                        });
                                                    }}
                                                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 cursor-ns-resize bg-white border-2 ${field.type === 'image' ? 'border-amber-500' : 'border-indigo-500'} rounded-full z-20 hover:scale-125 transition-transform shadow-sm`}
                                                />
                                            </>
                                        )}

                                        <div className="p-1 h-full flex flex-col justify-center">
                                            {field.type === 'text' ? (
                                                <>
                                                    <div
                                                        className="truncate select-none pointer-events-none"
                                                        style={{
                                                            fontSize: `${field.fontSize || 12}pt`,
                                                            fontWeight:
                                                                field.fontWeight === 'bold' ? 700 :
                                                                    field.fontWeight === 'black' ? 900 :
                                                                        field.fontWeight === 'medium' ? 500 : 400
                                                        }}
                                                    >
                                                        {field.label}
                                                    </div>
                                                    <div className="text-[8px] opacity-40 font-mono -mt-1 leading-none uppercase tracking-tighter select-none pointer-events-none">#{field.dataKey}</div>
                                                </>
                                            ) : (
                                                <div
                                                    className="flex-1 bg-slate-100 dark:bg-slate-800 rounded flex flex-col items-center justify-center p-2 border-2 border-dashed border-slate-200 dark:border-slate-700"
                                                    style={{ height: `${field.height || 30}mm` }}
                                                >
                                                    {field.imageUrl ? (
                                                        <img src={field.imageUrl} alt={field.label} className="w-full h-full object-contain pointer-events-none" />
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-slate-400">image</span>
                                                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-1">{field.label}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Decorative Grid for design mode */}
                            <div className="absolute inset-0 pointer-events-none opacity-[0.03] pattern-grid"></div>
                            {/* Watermark/Guide */}
                            <div className="absolute inset-0 border-2 border-dashed border-blue-500/20 pointer-events-none rounded-sm"></div>
                        </div>
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .pattern-grid {
                    background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px);
                    background-size: 24px 24px;
                }
                .dark .pattern-grid {
                    background-image: radial-gradient(circle, #1e293b 1px, transparent 1px);
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}} />
        </div>
    );
};

export default ReceiptTemplateNew;
