import React from 'react';
import LoanSchemeList from './LoanSchemeList';

const RepledgeClosingCalculations: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Repledge Closing Calculations</h1>
                <p className="text-gray-500 dark:text-gray-400">Configure how interest is calculated when closing repledges.</p>
            </div>

            <LoanSchemeList />
        </div>
    );
};

export default RepledgeClosingCalculations;
