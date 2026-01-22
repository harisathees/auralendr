import React, { useMemo } from 'react';

interface CommunicationButtonsProps {
    pledge: any;
    className?: string;
}

const CommunicationButtons: React.FC<CommunicationButtonsProps> = ({
    pledge,
    className = ""
}) => {
    const { customer, loan, jewels } = pledge;

    const cleanNumber = (num: string | null | undefined) => num?.replace(/\D/g, '') || '';

    const targetMobile = cleanNumber(customer?.mobile_no);
    const targetWhatsapp = customer?.whatsapp_no ? cleanNumber(customer.whatsapp_no) : targetMobile;

    // Construct the formatted message
    const message = useMemo(() => {
        if (!customer || !loan) return "";

        // Format Jewel Details
        const jewelDetails = jewels?.map((j: any) => `${j.jewel_type} (${j.quality})`).join(', ') || "N/A";

        // Calculate Total Weight
        const totalWeight = jewels?.reduce((sum: number, j: any) => sum + (parseFloat(j.net_weight) || 0), 0)?.toFixed(2) || "0.00";

        return `*AURALENDR GOLD LOAN*
Your Name: ${customer.name || '-'}
Mobile No: ${customer.mobile_no || '-'}
Jewel Type and Quality: ${jewelDetails}
Loan Number: ${loan.loan_no || '-'}
Amount: ₹${loan.amount || '0'}
Date: ${loan.date || '-'}
Due Date: ${loan.due_date || '-'}
Weight: ${totalWeight}g
You were Pledge Created Successfully`;
    }, [customer, loan, jewels]);

    const encodedMessage = encodeURIComponent(message);

    if (!targetMobile) return null;

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* WhatsApp Button */}
            <a
                href={`https://wa.me/${targetWhatsapp}?text=${encodedMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm hover:bg-[#128C7E] transition-all shadow-md active:scale-95"
            >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-5 h-5 brightness-0 invert" />
                <span>WhatsApp</span>
            </a>

            {/* SMS Button */}
            <a
                href={`sms:${targetMobile}?body=${encodedMessage}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-md active:scale-95"
            >
                <span className="material-symbols-outlined text-[20px]">sms</span>
                <span>Message</span>
            </a>
        </div>
    );
};

export default CommunicationButtons;
