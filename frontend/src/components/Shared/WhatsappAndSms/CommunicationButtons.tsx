import React, { useMemo } from 'react';

type TemplateType = 'create' | 'overdue' | 'close';

interface CommunicationButtonsProps {
    pledge: any;
    className?: string;
    templateType?: TemplateType;
    closureData?: {
        settledAmount?: number | string;
        interestPaid?: number | string;
        closedDate?: string;
    };
}

const CommunicationButtons: React.FC<CommunicationButtonsProps> = ({
    pledge,
    className = "",
    templateType = "create",
    closureData
}) => {
    const { customer, loan, jewels } = pledge;

    const cleanNumber = (num: string | null | undefined) => num?.replace(/\D/g, '') || '';

    const formatForWhatsapp = (num: string | null | undefined) => {
        const cleaned = cleanNumber(num);
        if (cleaned.length === 10) return `91${cleaned}`;
        return cleaned;
    };

    const targetMobile = cleanNumber(customer?.mobile_no);
    const targetWhatsapp = customer?.whatsapp_no ? formatForWhatsapp(customer.whatsapp_no) : formatForWhatsapp(customer?.mobile_no);

    // Detect iOS for SMS body separator
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '');
    const smsSeparator = isIOS ? '&' : '?';

    // Construct the formatted message based on template type
    const message = useMemo(() => {
        if (!customer || !loan) return "";

        // Format Jewel Details
        const jewelDetails = jewels?.map((j: any) => `${j.jewel_type} (${j.quality})`).join(', ') || "N/A";

        // Calculate Total Weight
        const totalWeight = jewels?.reduce((sum: number, j: any) => sum + (parseFloat(j.net_weight) || 0), 0)?.toFixed(2) || "0.00";

        const customerAppUrl = import.meta.env.VITE_CUSTOMER_APP_URL || '';
        const trackingCode = loan?.customer_loan_track?.tracking_code || '';

        switch (templateType) {
            case 'overdue':
                return `*AURALENDR PAYMENT REMINDER*

Dear ${customer.name || 'Customer'},

Your loan #${loan.loan_no || '-'} of ₹${loan.amount || '0'} was due on ${loan.due_date || '-'}.

Please make payment at the earliest to avoid additional charges.

Jewels: ${jewelDetails}
Weight: ${totalWeight}g

Track your loan: ${customerAppUrl}
Tracking Code: ${trackingCode}

Thank you,
AuraLendr Team`;

            case 'close':
                const settledAmt = closureData?.settledAmount || loan.amount || '0';
                const closeDate = closureData?.closedDate || new Date().toLocaleDateString('en-IN');

                return `*AURALENDR - PLEDGE CLOSED*

Dear ${customer.name || 'Customer'},

Your pledge has been successfully closed!

Loan No: ${loan.loan_no || '-'}
Amount Settled: ₹${settledAmt}
Closed Date: ${closeDate}

Jewels: ${jewelDetails}
Weight: ${totalWeight}g

Your jewels are ready for collection at our branch.

Thank you for choosing AuraLendr!`;

            case 'create':
            default:
                return `*AURALENDR GOLD LOAN*

Your Name: ${customer.name || '-'}
Mobile No: ${customer.mobile_no || '-'}
Jewel Type and Quality: ${jewelDetails}
Loan Number: ${loan.loan_no || '-'}
Amount: ₹${loan.amount || '0'}
Date: ${loan.date || '-'}
Due Date: ${loan.due_date || '-'}
Weight: ${totalWeight}g

You were Pledge Created Successfully

Track your loan status using the Link:
${customerAppUrl}
Your Loan Tracking Code is: ${trackingCode}`;
        }
    }, [customer, loan, jewels, templateType, closureData]);

    const encodedMessage = encodeURIComponent(message);

    if (!targetMobile) return null;

    // Button labels based on template type
    const getButtonLabels = () => {
        switch (templateType) {
            case 'overdue':
                return { whatsapp: 'Send Reminder', sms: 'SMS Reminder' };
            case 'close':
                return { whatsapp: 'Send Confirmation', sms: 'SMS Confirm' };
            default:
                return { whatsapp: 'WhatsApp', sms: 'Message' };
        }
    };

    const labels = getButtonLabels();

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
                <span>{labels.whatsapp}</span>
            </a>

            {/* SMS Button */}
            <a
                href={`sms:${targetMobile}${smsSeparator}body=${encodedMessage}`}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-all shadow-md active:scale-95"
            >
                <span className="material-symbols-outlined text-[20px]">sms</span>
                <span>{labels.sms}</span>
            </a>
        </div>
    );
};

export default CommunicationButtons;

