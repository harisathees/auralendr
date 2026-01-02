import React from 'react';

interface Transaction {
    id: number;
    date: string;
    description: string;
    category: string;
    type: 'credit' | 'debit';
    amount: number | string;
    money_source?: { name: string };
}

interface StatementTemplateProps {
    transactions: Transaction[];
    openingBalance: number;
    startDate?: string;
    endDate?: string;
    moneySource?: string;
    branch?: string;
}

const StatementTemplate = React.forwardRef<HTMLDivElement, StatementTemplateProps>(({
    transactions,
    openingBalance,
    startDate,
    endDate,
    moneySource,
    branch
}, ref) => {

    let runningBalance = openingBalance;
    const totalIncome = transactions.reduce((acc, t) => acc + (t.type === 'credit' ? parseFloat(t.amount.toString()) : 0), 0);
    const totalExpense = transactions.reduce((acc, t) => acc + (t.type === 'debit' ? parseFloat(t.amount.toString()) : 0), 0);
    const closingBalance = openingBalance + totalIncome - totalExpense;

    return (
        <div ref={ref} className="p-8 bg-white text-gray-900 font-sans" style={{ minHeight: '297mm' }}>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-blue-600 pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-blue-600 uppercase tracking-tight">Transaction Statement</h1>
                    <p className="text-sm text-gray-500 font-bold mt-1">
                        Period: {startDate || 'Beginning'} - {endDate || 'Today'}
                    </p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase tracking-tighter">AuraLendr</h2>
                    {branch && <p className="text-xs font-bold text-blue-600">{branch}</p>}
                    {moneySource && <p className="text-xs text-gray-600 font-medium">Source: {moneySource}</p>}
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Opening Balance</p>
                    <p className="text-lg font-black text-gray-900">₹{openingBalance.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Income (+)</p>
                    <p className="text-lg font-black text-emerald-700">₹{totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Expense (-)</p>
                    <p className="text-lg font-black text-rose-700">₹{totalExpense.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Closing Balance</p>
                    <p className="text-lg font-black text-blue-600">₹{closingBalance.toLocaleString()}</p>
                </div>
            </div>

            {/* Table */}
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b-2 border-gray-100 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="py-3 px-2">Date</th>
                        <th className="py-3 px-2">Description</th>
                        <th className="py-3 px-2 text-right">Debit (Out)</th>
                        <th className="py-3 px-2 text-right">Credit (In)</th>
                        <th className="py-3 px-2 text-right">Balance</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {/* Opening Balance Row */}
                    <tr className="text-gray-500 italic bg-gray-50/30">
                        <td className="py-3 px-2">{startDate || '-'}</td>
                        <td className="py-3 px-2 font-medium" colSpan={3}>Opening Balance Forwarded</td>
                        <td className="py-3 px-2 text-right font-bold">₹{openingBalance.toLocaleString()}</td>
                    </tr>
                    {transactions.map((t) => {
                        const amt = parseFloat(t.amount.toString());
                        if (t.type === 'credit') runningBalance += amt;
                        else runningBalance -= amt;

                        return (
                            <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 px-2 whitespace-nowrap">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="py-3 px-2">
                                    <div className="font-bold text-gray-900 leading-tight">{t.description}</div>
                                    <div className="text-[10px] text-gray-400 uppercase font-black">{t.category}</div>
                                </td>
                                <td className="py-3 px-2 text-right font-bold text-rose-600">
                                    {t.type === 'debit' ? `₹${amt.toLocaleString()}` : '-'}
                                </td>
                                <td className="py-3 px-2 text-right font-bold text-emerald-600">
                                    {t.type === 'credit' ? `₹${amt.toLocaleString()}` : '-'}
                                </td>
                                <td className="py-3 px-2 text-right font-black text-gray-900 bg-gray-50/30">
                                    ₹{runningBalance.toLocaleString()}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-end">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Generated on {new Date().toLocaleString()}
                </div>
                <div className="text-center">
                    <div className="w-32 h-0.5 bg-gray-200 mb-2 mx-auto"></div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Signatory</p>
                </div>
            </div>
        </div>
    );
});

StatementTemplate.displayName = 'StatementTemplate';

export default StatementTemplate;
