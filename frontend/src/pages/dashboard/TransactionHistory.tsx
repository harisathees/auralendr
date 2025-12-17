// import React from 'react';
import { useNavigate } from 'react-router-dom';

const TransactionHistory = () => {
    const navigate = useNavigate();

    return (
        <div className="max-w-md mx-auto min-h-screen relative flex flex-col pb-24 bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 pt-6 pb-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-gray-700 dark:text-gray-200">arrow_back_ios_new</span>
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h1>
                <button
                    className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary active:scale-95 transition-all px-3 py-1.5 rounded-full"
                    onClick={() => console.log("Add Transaction")}
                >
                    <span className="text-xs font-bold uppercase tracking-wide">Add</span>
                    <span className="material-symbols-outlined text-lg">post_add</span>
                </button>
            </header>

            <div className="sticky top-[69px] z-10 bg-background-light dark:bg-background-dark px-4 py-3 flex space-x-3 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800">
                <button className="flex items-center bg-card-light dark:bg-card-dark px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap active:scale-95 transition-transform">
                    Date
                    <span className="material-symbols-outlined text-base ml-1 text-gray-500 dark:text-gray-400">expand_more</span>
                </button>
                <button className="flex items-center bg-card-light dark:bg-card-dark px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap active:scale-95 transition-transform">
                    Services
                    <span className="material-symbols-outlined text-base ml-1 text-gray-500 dark:text-gray-400">expand_more</span>
                </button>
                <button className="flex items-center bg-card-light dark:bg-card-dark px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap active:scale-95 transition-transform">
                    Method
                    <span className="material-symbols-outlined text-base ml-1 text-gray-500 dark:text-gray-400">expand_more</span>
                </button>
            </div>

            <main className="flex-1 px-4 pt-4">
                <div className="mb-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Today</h2>
                    <div className="flex items-start py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors -mx-2 px-2">
                        <div className="flex-shrink-0 mr-4">
                            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-purple-300">
                                <span className="material-symbols-outlined">storefront</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">Dharma Coffee, Ubud</h3>
                                <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Rp85.900</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                                <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                                <span className="truncate">Jl. Campuan Raya No. 45, Ubud</span>
                            </div>
                            <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex -space-x-1.5 mr-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-red-500/90"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/90"></div>
                                </div>
                                <span>***456</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors -mx-2 px-2">
                        <div className="flex-shrink-0 mr-4">
                            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-purple-300">
                                <span className="material-symbols-outlined">directions_car</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">Outpost Ubud Cliving</h3>
                                <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Rp80.900</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                                <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                                <span className="truncate">Jl. Campuan Raya No. 45, Ubud</span>
                            </div>
                            <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                <span className="font-black text-blue-700 dark:text-blue-400 italic mr-2 text-[10px] tracking-wider">VISA</span>
                                <span>***456</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Sunday, 12 Feb 2024</h2>
                    <div className="flex items-start py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors -mx-2 px-2">
                        <div className="flex-shrink-0 mr-4">
                            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-purple-300">
                                <span className="material-symbols-outlined">local_cafe</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">Anomali Coffee, Ubud</h3>
                                <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Rp75.00</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                                <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                                <span className="truncate">Jl. Campuan Raya No. 45, Ubud</span>
                            </div>
                            <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex -space-x-1.5 mr-2">
                                    <div className="w-3.5 h-3.5 rounded-full bg-red-500/90"></div>
                                    <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/90"></div>
                                </div>
                                <span>***456</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors -mx-2 px-2">
                        <div className="flex-shrink-0 mr-4">
                            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-purple-300">
                                <span className="material-symbols-outlined">directions_car</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">Outpost Ubud Cliving</h3>
                                <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Rp90.00</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                                <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                                <span className="truncate">Jl. Campuan Raya No. 45, Ubud</span>
                            </div>
                            <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                <span className="font-black text-blue-700 dark:text-blue-400 italic mr-2 text-[10px] tracking-wider">VISA</span>
                                <span>***456</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-start py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors -mx-2 px-2">
                        <div className="flex-shrink-0 mr-4">
                            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-purple-300">
                                <span className="material-symbols-outlined">directions_car</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">Anomali Coffee, Ubud</h3>
                                <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">Rp75.00</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
                                <span className="material-symbols-outlined text-sm mr-1">location_on</span>
                                <span className="truncate">Jl. Campuan Raya No. 45, Ubud</span>
                            </div>
                            <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                                <span className="font-black text-blue-700 dark:text-blue-400 italic mr-2 text-[10px] tracking-wider">VISA</span>
                                <span>***456</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-8"></div>
            </main>

            {/* Floating Action Button removed */}
        </div>
    );
};

export default TransactionHistory;
