import React from 'react';
import './OverdueNotice.css';

interface NoticeProps {
    name: string;
    address: string;
    phone: string;
    date: string;
    jewelName: string;
    count: number;
    itemNo: string;
    itemDate: string;
    amount: string;
    validity_months: number;
}

const OverdueNotice = React.forwardRef<HTMLDivElement, NoticeProps>((props, ref) => {
    const { name, address, phone, date, jewelName, count, itemNo, itemDate, amount, validity_months } = props;

    return (
        <div ref={ref} className="w-[210mm] min-h-[297mm] p-[20mm] mx-auto bg-white text-black font-serif relative box-border shadow-md">
            <div>
                <b className="text-xl">NSH Gold Finance</b><br />
                <span className="text-sm">
                    123/address street,<br /> Thoothukudi,<br /> Tamil Nadu,<br />
                    Phone: 9942153378,8778748399
                </span>
            </div>

            <h2 style={{ textAlign: 'center', marginTop: '1rem' }} className="text-xl font-bold">நோட்டீஸ்</h2>
            <div style={{ textAlign: 'right' }}>Date: {date}</div>

            <div className="mt-4">
                To,<br />
                <b>{name}</b><br />
                <div className="whitespace-pre-line">{address}</div>
                <b>{phone}</b>
            </div>
            <br /><br />
            <h1 className="text-lg font-bold">அன்புடையீர்,</h1><br />

            <p className="text-justify leading-relaxed">
                தாங்கள் அடியிற்கண்ட நம்பர்களில் அடகு வைத்திருக்கும் பொருள்களுக்கு {validity_months} மாதம் கடந்து விட்டபடியால் . இந்த நோட்டீஸ் கிடைத்த 10 நாட்களுக்குள் வட்டியை செலுத்தி அடகு ரசீதை புதுப்பித்துக் கொள்ள வேண்டியது. என்பதை இதன் மூலமாக தெரிவித்துக்கொள்கிறோம்.அப்படி
                நீங்கள் வட்டி கட்ட வராதப்பட்சத்தில் 1/2 பைசா வட்டி கூடுதலாக வசூலிக்கப்படும் என்பதை இதன் மூலமாகவும் தெரிவித்துக் கொள்கின்றோம்.
            </p><br /><br />

            <div className="border border-dashed border-gray-400 p-4">
                <p>
                    <b>Ref:</b><br />
                    <div className="grid grid-cols-[150px_1fr] gap-y-2">
                        <span>அடகு நம்பர்</span><span>: {itemNo}</span>
                        <span>பொருளின் விபரம்</span><span>: {jewelName}</span>
                        <span>எண்ணிக்கை</span><span>: {count}</span>
                        <span>அடகு தேதி</span><span>: {itemDate}</span>
                        <span>கடன் தொகை</span><span>: ₹{amount}/-</span>
                    </div>
                </p>
            </div>

            <div style={{ textAlign: 'right', marginTop: '4rem' }}>
                <b>NSH Gold Finance</b><br />
                <div style={{ marginTop: '3rem', borderTop: '1px solid #000', display: 'inline-block', paddingTop: '0.5rem' }}>Authorized Signatory</div>
            </div>

            <p style={{ fontSize: '0.9rem', marginTop: '4rem', textAlign: 'center' }}>
                (குறிப்பு: நீங்கள் வரும் போது இந்த நோட்டீஸ் கட்டாயமாக&nbsp;கொண்டு&nbsp;வரவும்.)
            </p>
        </div>
    );
});

export default OverdueNotice;
