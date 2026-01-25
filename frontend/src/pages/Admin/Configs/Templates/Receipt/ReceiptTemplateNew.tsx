import React, { useEffect, useState, useRef, useMemo } from "react";
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
    side?: 'front' | 'back'; // Added side property
    copyType?: 'office' | 'customer'; // Added copyType property
}

const DATA_KEYS = {
    Pledge: [
        { label: 'Pledge No', value: 'pledge.no' },
        { label: 'Amount', value: 'pledge.amount' },
        { label: 'Date', value: 'pledge.date' },
        { label: 'Due Date', value: 'pledge.due_date' },
        { label: 'Scheme Name', value: 'pledge.scheme_name' },
        { label: 'Interest Rate', value: 'pledge.interest_rate' },
        { label: 'Scheme Interest Rate', value: 'pledge.scheme_interest_rate' },
        { label: 'Total Weight', value: 'pledge.total_weight' },
        { label: 'Gross Weight', value: 'pledge.gross_weight' },
        { label: 'Item Count', value: 'pledge.item_count' },
        { label: 'Items Description', value: 'pledge.items_description' },
        { label: 'Remarks', value: 'pledge.remarks' },
    ],
    Customer: [
        { label: 'Customer Name', value: 'customer.name' },
        { label: 'Customer ID', value: 'customer.id' },
        { label: 'Mobile No', value: 'customer.mobile' },
        { label: 'Address', value: 'customer.address' },
        { label: 'City', value: 'customer.city' },
        { label: 'Alternate Phone', value: 'customer.alt_phone' },
    ],
    Brand: [
        { label: 'Company Name', value: 'brand.name' },
        { label: 'Company Address', value: 'brand.address' },
        { label: 'Company Phone', value: 'brand.phone' },
        { label: 'Company Email', value: 'brand.email' },
        { label: 'GST No', value: 'brand.gst' },
        { label: 'Tagline', value: 'brand.tagline' },
        { label: 'Website', value: 'brand.website' },
        { label: 'Terms & Conditions', value: 'brand.terms' },
    ],
    System: [
        { label: 'Receipt No', value: 'receipt.no' },
        { label: 'Receipt Date', value: 'receipt.date' },
        { label: 'Receipt Time', value: 'receipt.time' },
    ]
};

const PLACEHOLDER_VALUES: Record<string, string> = {
    'pledge.no': 'PL-2023-001',
    'pledge.amount': '₹ 50,000.00',
    'pledge.date': '01 Jan 2024',
    'pledge.due_date': '01 Jan 2025',
    'pledge.scheme_name': 'Gold Loan Standard',
    'pledge.interest_rate': '12%',
    'pledge.total_weight': '24.5g',
    'pledge.gross_weight': '22.0g',
    'pledge.item_count': '3',
    'pledge.items_description': '1 Gold Ring, 2 Gold Chains',
    'pledge.remarks': 'Handle with care',
    'pledge.verified_by': 'Admin User',
    'pledge.created_by': 'Staff Member',
    'customer.name': 'John Doe',
    'customer.id': 'CUST-1001',
    'customer.mobile': '+91 98765 43210',
    'customer.address': '123 Main St, Tech Park',
    'customer.city': 'Bangalore',
    'customer.email': 'john.doe@example.com',
    'customer.kyc_status': 'Verified',
    'brand.name': 'Auralendr Gold Loans',
    'brand.address': '456 Gold Lane, Finance District',
    'brand.phone': '+91 80 1234 5678',
    'brand.email': 'support@auralendr.com',
    'brand.gst': '29ABCDE1234F1Z5',
    'brand.tagline': 'Trusted Gold Loans',
    'brand.website': 'www.auralendr.com',
    'receipt.no': 'REC-10001',
    'receipt.date': '08 Jan 2024',
    'receipt.time': '10:30 AM',
};

const IMAGE_KEYS = {
    Brand: [
        { label: 'Company Logo', value: 'brand.logo' },
    ],
    Customer: [
        { label: 'Customer Photo', value: 'customer.image' },
    ],
    Pledge: [
        { label: 'Jewel Image', value: 'pledge.jewel_image' },
    ]
};

const PRESET_LAYOUTS = {
    'sabari_haris': [
        // --- A6 Landscape Layout (148mm x 105mm) ---
        // === OFFICE COPY ===
        // Header Left - Logo
        { id: 'logo', type: 'image', label: 'Brand Logo', dataKey: 'brand.logo', x: 2, y: 2, width: 30, height: 18, visible: true, copyType: 'office', side: 'front' },

        // Header Center - Brand Info
        { id: 'brand_name', type: 'text', label: 'Brand Name', dataKey: 'brand.name', fontSize: 16, fontWeight: 'black', align: 'center', x: 35, y: 4, width: 75, visible: true, copyType: 'office', side: 'front' },
        { id: 'brand_type', type: 'text', label: 'FINANCE', dataKey: '', fontSize: 11, fontWeight: 'bold', align: 'center', x: 35, y: 10, width: 75, visible: true, copyType: 'office', side: 'front' },
        { id: 'brand_addr', type: 'text', label: 'Address', dataKey: 'brand.address', fontSize: 7, fontWeight: 'medium', align: 'center', x: 35, y: 15, width: 75, visible: true, copyType: 'office', side: 'front' },

        // Header Right - Contact & Date
        { id: 'contact', type: 'text', label: 'Contact', dataKey: 'brand.mobile', fontSize: 8, fontWeight: 'bold', align: 'right', x: 112, y: 3, width: 33, visible: true, copyType: 'office', side: 'front' },
        { id: 'date_lbl', type: 'text', label: 'Date:', dataKey: '', fontSize: 8, fontWeight: 'normal', align: 'right', x: 112, y: 8, width: 10, visible: true, copyType: 'office', side: 'front' },
        { id: 'date_val', type: 'text', label: 'Date', dataKey: 'receipt.date', fontSize: 8, fontWeight: 'bold', align: 'right', x: 123, y: 8, width: 22, visible: true, copyType: 'office', side: 'front' },
        { id: 'due_lbl', type: 'text', label: 'Due:', dataKey: '', fontSize: 8, fontWeight: 'normal', align: 'right', x: 112, y: 12, width: 10, visible: true, copyType: 'office', side: 'front' },
        { id: 'due_val', type: 'text', label: 'Due Date', dataKey: 'pledge.due_date', fontSize: 8, fontWeight: 'bold', align: 'right', x: 123, y: 12, width: 22, visible: true, copyType: 'office', side: 'front' },

        // Rate Info
        { id: 'rate_lbl', type: 'text', label: 'Rate/g: ₹', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 2, y: 22, width: 15, visible: true, copyType: 'office', side: 'front' },
        { id: 'rate_val', type: 'text', label: 'Rate', dataKey: 'pledge.scheme_interest_rate', fontSize: 9, fontWeight: 'bold', align: 'left', x: 18, y: 22, width: 20, visible: true, copyType: 'office', side: 'front' },

        // Main Content - Left Column
        { id: 'lbl_ln', type: 'text', label: 'Loan No:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 2, y: 32, width: 15, visible: true, copyType: 'office', side: 'front' },
        { id: 'val_ln', type: 'text', label: 'Pledge No', dataKey: 'pledge.no', fontSize: 9, fontWeight: 'medium', align: 'left', x: 18, y: 32, width: 35, visible: true, copyType: 'office', side: 'front' },

        { id: 'lbl_pcs', type: 'text', label: 'Pcs:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 2, y: 40, width: 15, visible: true, copyType: 'office', side: 'front' },
        { id: 'val_pcs', type: 'text', label: 'Count', dataKey: 'pledge.item_count', fontSize: 9, fontWeight: 'medium', align: 'left', x: 18, y: 40, width: 35, visible: true, copyType: 'office', side: 'front' },

        { id: 'lbl_int', type: 'text', label: 'Interest:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 2, y: 48, width: 15, visible: true, copyType: 'office', side: 'front' },
        { id: 'val_int', type: 'text', label: 'Rate', dataKey: 'pledge.interest_rate', fontSize: 9, fontWeight: 'medium', align: 'left', x: 18, y: 48, width: 35, visible: true, copyType: 'office', side: 'front' },

        { id: 'lbl_itm', type: 'text', label: 'Item:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 2, y: 56, width: 15, visible: true, copyType: 'office', side: 'front' },
        { id: 'val_itm', type: 'text', label: 'Desc', dataKey: 'pledge.items_description', fontSize: 9, fontWeight: 'medium', align: 'left', x: 18, y: 56, width: 45, visible: true, copyType: 'office', side: 'front' },

        // Main Content - Middle Column
        { id: 'lbl_nm', type: 'text', label: 'Name:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 60, y: 32, width: 15, visible: true, copyType: 'office', side: 'front' },
        { id: 'val_nm', type: 'text', label: 'Name', dataKey: 'customer.name', fontSize: 9, fontWeight: 'medium', align: 'left', x: 75, y: 32, width: 35, visible: true, copyType: 'office', side: 'front' },

        { id: 'lbl_amt', type: 'text', label: 'Amount: ₹', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 60, y: 40, width: 15, visible: true, copyType: 'office', side: 'front' },
        { id: 'val_amt', type: 'text', label: 'Amount', dataKey: 'pledge.amount', fontSize: 10, fontWeight: 'bold', align: 'left', x: 75, y: 40, width: 35, visible: true, copyType: 'office', side: 'front' },

        { id: 'lbl_wt', type: 'text', label: 'Weight:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 60, y: 48, width: 15, visible: true, copyType: 'office', side: 'front' },
        { id: 'val_wt', type: 'text', label: 'Weight', dataKey: 'pledge.total_weight', fontSize: 9, fontWeight: 'medium', align: 'left', x: 75, y: 48, width: 35, visible: true, copyType: 'office', side: 'front' },

        // Images Column
        { id: 'img_cust', type: 'image', label: 'Customer', dataKey: 'customer.image', x: 115, y: 28, width: 30, height: 30, visible: true, copyType: 'office', side: 'front' },
        { id: 'img_jwl', type: 'image', label: 'Jewel', dataKey: 'pledge.jewel_image', x: 115, y: 62, width: 30, height: 25, visible: true, copyType: 'office', side: 'front' },

        // Footer Warning
        { id: 'warn_bg', type: 'text', label: 'If loan is not redeemed within due date, 0.5% extra interest will be charged.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'center', x: 5, y: 92, width: 138, visible: true, copyType: 'office', side: 'front' },

        // Signatures
        { id: 'sign_stf', type: 'text', label: 'Staff Sign', dataKey: '', fontSize: 8, fontWeight: 'medium', align: 'left', x: 5, y: 98, width: 30, visible: true, copyType: 'office', side: 'front' },
        { id: 'sign_cust', type: 'text', label: 'Customer Sign', dataKey: '', fontSize: 8, fontWeight: 'medium', align: 'right', x: 110, y: 98, width: 30, visible: true, copyType: 'office', side: 'front' },

        // --- Back Side Layout (OFFICE) ---
        { id: 'back_pg', type: 'text', label: 'of', dataKey: '', fontSize: 8, fontWeight: 'bold', align: 'right', x: 130, y: 5, width: 10, visible: true, copyType: 'office', side: 'back' },

        { id: 'term_1', type: 'text', label: '1. அட்டை தவறும் பட்சத்தில் முன்கூட்டியே கடையில் தகவல் தெரிவிக்கவும். அப்படி இல்லையெனில் ஆதார் கார்டு நகலுடன் நகை கடன் பத்திரம் இணைத்துக் கொடுத்து உங்களுடைய பொருளைப் பெற்றுக் கொள்ளவும்.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'justify', x: 5, y: 15, width: 138, visible: true, copyType: 'office', side: 'back' },
        { id: 'term_2', type: 'text', label: '2. உங்களுடைய முகவரி மற்றும் சரியான தொலைபேசி எண்ணை கொடுத்து, உங்களுடைய அடகு Loan Number-ஐ பெற்றுச் செல்லவும். ஏனென்றால் உங்கள் கால தவணை முடியும் பட்சத்தில் இந்த முகவரிக்கே தகவல் தெரிவிக்கப்படும். நீங்கள் கொடுக்கும் முகவரி தவறானதாக இருக்கும் பட்சத்தில் கடையின் உரிமையாளர் பொறுப்பு ஏற்க முடியாது.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'justify', x: 5, y: 28, width: 138, visible: true, copyType: 'office', side: 'back' },
        { id: 'term_3', type: 'text', label: '3. பொருளின் மீது கூடுதலாக பணம் வாங்கும்போது, பொருளை அடகு வைத்த அந்த நபரே பொருளின் கூடுதலான பணத்தைப் பெற்றுச் செல்லவும்.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'justify', x: 5, y: 45, width: 138, visible: true, copyType: 'office', side: 'back' },
        { id: 'term_4', type: 'text', label: '4. பொருளின் வட்டிவிகிதத்தை தெரிந்துக் கொண்டு தான் அடகு வைக்கின்றேன்.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'justify', x: 5, y: 55, width: 138, visible: true, copyType: 'office', side: 'back' },
        { id: 'term_5', type: 'text', label: '5. கடைசி கால தவணையாக 1 வருட கால தவணை மட்டுமே. அதன் பிறகு இந்த அட்டை செல்லுபடியாகாது. இதில் குறிப்பிடப் பட்டிருக்கும் விதிமுறைகள் அனைத்திற்கும் நான் சம்மதிக்கிறேன்.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'justify', x: 5, y: 65, width: 138, visible: true, copyType: 'office', side: 'back' },

        { id: 'back_cust_sign', type: 'text', label: 'Customer sign', dataKey: '', fontSize: 9, fontWeight: 'medium', align: 'right', x: 110, y: 95, width: 30, visible: true, copyType: 'office', side: 'back' },

        // === CUSTOMER COPY (DUPLICATE) ===
        // Header Left - Logo
        { id: 'logo_c', type: 'image', label: 'Brand Logo', dataKey: 'brand.logo', x: 2, y: 2, width: 30, height: 18, visible: true, copyType: 'customer', side: 'front' },

        // Header Center - Brand Info
        { id: 'brand_name_c', type: 'text', label: 'Brand Name', dataKey: 'brand.name', fontSize: 16, fontWeight: 'black', align: 'center', x: 35, y: 4, width: 75, visible: true, copyType: 'customer', side: 'front' },
        { id: 'brand_type_c', type: 'text', label: 'FINANCE', dataKey: '', fontSize: 11, fontWeight: 'bold', align: 'center', x: 35, y: 10, width: 75, visible: true, copyType: 'customer', side: 'front' },
        { id: 'brand_addr_c', type: 'text', label: 'Address', dataKey: 'brand.address', fontSize: 7, fontWeight: 'medium', align: 'center', x: 35, y: 15, width: 75, visible: true, copyType: 'customer', side: 'front' },

        // Header Right - Contact & Date
        { id: 'contact_c', type: 'text', label: 'Contact', dataKey: 'brand.mobile', fontSize: 8, fontWeight: 'bold', align: 'right', x: 112, y: 3, width: 33, visible: true, copyType: 'customer', side: 'front' },
        { id: 'date_lbl_c', type: 'text', label: 'Date:', dataKey: '', fontSize: 8, fontWeight: 'normal', align: 'right', x: 112, y: 8, width: 10, visible: true, copyType: 'customer', side: 'front' },
        { id: 'date_val_c', type: 'text', label: 'Date', dataKey: 'receipt.date', fontSize: 8, fontWeight: 'bold', align: 'right', x: 123, y: 8, width: 22, visible: true, copyType: 'customer', side: 'front' },
        { id: 'due_lbl_c', type: 'text', label: 'Due:', dataKey: '', fontSize: 8, fontWeight: 'normal', align: 'right', x: 112, y: 12, width: 10, visible: true, copyType: 'customer', side: 'front' },
        { id: 'due_val_c', type: 'text', label: 'Due Date', dataKey: 'pledge.due_date', fontSize: 8, fontWeight: 'bold', align: 'right', x: 123, y: 12, width: 22, visible: true, copyType: 'customer', side: 'front' },

        // Rate Info
        { id: 'rate_lbl_c', type: 'text', label: 'Rate/g: ₹', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 2, y: 22, width: 15, visible: true, copyType: 'customer', side: 'front' },
        { id: 'rate_val_c', type: 'text', label: 'Rate', dataKey: 'pledge.scheme_interest_rate', fontSize: 9, fontWeight: 'bold', align: 'left', x: 18, y: 22, width: 20, visible: true, copyType: 'customer', side: 'front' },

        // Main Content - Left Column
        { id: 'lbl_ln_c', type: 'text', label: 'Loan No:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 2, y: 32, width: 15, visible: true, copyType: 'customer', side: 'front' },
        { id: 'val_ln_c', type: 'text', label: 'Pledge No', dataKey: 'pledge.no', fontSize: 9, fontWeight: 'medium', align: 'left', x: 18, y: 32, width: 35, visible: true, copyType: 'customer', side: 'front' },

        { id: 'lbl_pcs_c', type: 'text', label: 'Pcs:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 2, y: 40, width: 15, visible: true, copyType: 'customer', side: 'front' },
        { id: 'val_pcs_c', type: 'text', label: 'Count', dataKey: 'pledge.item_count', fontSize: 9, fontWeight: 'medium', align: 'left', x: 18, y: 40, width: 35, visible: true, copyType: 'customer', side: 'front' },

        { id: 'lbl_int_c', type: 'text', label: 'Interest:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 2, y: 48, width: 15, visible: true, copyType: 'customer', side: 'front' },
        { id: 'val_int_c', type: 'text', label: 'Rate', dataKey: 'pledge.interest_rate', fontSize: 9, fontWeight: 'medium', align: 'left', x: 18, y: 48, width: 35, visible: true, copyType: 'customer', side: 'front' },

        { id: 'lbl_itm_c', type: 'text', label: 'Item:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 2, y: 56, width: 15, visible: true, copyType: 'customer', side: 'front' },
        { id: 'val_itm_c', type: 'text', label: 'Desc', dataKey: 'pledge.items_description', fontSize: 9, fontWeight: 'medium', align: 'left', x: 18, y: 56, width: 45, visible: true, copyType: 'customer', side: 'front' },

        // Main Content - Middle Column
        { id: 'lbl_nm_c', type: 'text', label: 'Name:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 60, y: 32, width: 15, visible: true, copyType: 'customer', side: 'front' },
        { id: 'val_nm_c', type: 'text', label: 'Name', dataKey: 'customer.name', fontSize: 9, fontWeight: 'medium', align: 'left', x: 75, y: 32, width: 35, visible: true, copyType: 'customer', side: 'front' },

        { id: 'lbl_amt_c', type: 'text', label: 'Amount: ₹', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 60, y: 40, width: 15, visible: true, copyType: 'customer', side: 'front' },
        { id: 'val_amt_c', type: 'text', label: 'Amount', dataKey: 'pledge.amount', fontSize: 10, fontWeight: 'bold', align: 'left', x: 75, y: 40, width: 35, visible: true, copyType: 'customer', side: 'front' },

        { id: 'lbl_wt_c', type: 'text', label: 'Weight:', dataKey: '', fontSize: 9, fontWeight: 'bold', align: 'left', x: 60, y: 48, width: 15, visible: true, copyType: 'customer', side: 'front' },
        { id: 'val_wt_c', type: 'text', label: 'Weight', dataKey: 'pledge.total_weight', fontSize: 9, fontWeight: 'medium', align: 'left', x: 75, y: 48, width: 35, visible: true, copyType: 'customer', side: 'front' },

        // Images Column
        { id: 'img_cust_c', type: 'image', label: 'Customer', dataKey: 'customer.image', x: 115, y: 28, width: 30, height: 30, visible: true, copyType: 'customer', side: 'front' },
        { id: 'img_jwl_c', type: 'image', label: 'Jewel', dataKey: 'pledge.jewel_image', x: 115, y: 62, width: 30, height: 25, visible: true, copyType: 'customer', side: 'front' },

        // Footer Warning
        { id: 'warn_bg_c', type: 'text', label: 'If loan is not redeemed within due date, 0.5% extra interest will be charged.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'center', x: 5, y: 92, width: 138, visible: true, copyType: 'customer', side: 'front' },

        // Signatures
        { id: 'sign_stf_c', type: 'text', label: 'Staff Sign', dataKey: '', fontSize: 8, fontWeight: 'medium', align: 'left', x: 5, y: 98, width: 30, visible: true, copyType: 'customer', side: 'front' },
        { id: 'sign_cust_c', type: 'text', label: 'Customer Sign', dataKey: '', fontSize: 8, fontWeight: 'medium', align: 'right', x: 110, y: 98, width: 30, visible: true, copyType: 'customer', side: 'front' },

        // --- Back Side Layout (CUSTOMER) ---
        { id: 'back_pg_c', type: 'text', label: 'of', dataKey: '', fontSize: 8, fontWeight: 'bold', align: 'right', x: 130, y: 5, width: 10, visible: true, copyType: 'customer', side: 'back' },

        { id: 'term_1_c', type: 'text', label: '1. அட்டை தவறும் பட்சத்தில் முன்கூட்டியே கடையில் தகவல் தெரிவிக்கவும். அப்படி இல்லையெனில் ஆதார் கார்டு நகலுடன் நகை கடன் பத்திரம் இணைத்துக் கொடுத்து உங்களுடைய பொருளைப் பெற்றுக் கொள்ளவும்.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'justify', x: 5, y: 15, width: 138, visible: true, copyType: 'customer', side: 'back' },
        { id: 'term_2_c', type: 'text', label: '2. உங்களுடைய முகவரி மற்றும் சரியான தொலைபேசி எண்ணை கொடுத்து, உங்களுடைய அடகு Loan Number-ஐ பெற்றுச் செல்லவும். ஏனென்றால் உங்கள் கால தவணை முடியும் பட்சத்தில் இந்த முகவரிக்கே தகவல் தெரிவிக்கப்படும். நீங்கள் கொடுக்கும் முகவரி தவறானதாக இருக்கும் பட்சத்தில் கடையின் உரிமையாளர் பொறுப்பு ஏற்க முடியாது.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'justify', x: 5, y: 28, width: 138, visible: true, copyType: 'customer', side: 'back' },
        { id: 'term_3_c', type: 'text', label: '3. பொருளின் மீது கூடுதலாக பணம் வாங்கும்போது, பொருளை அடகு வைத்த அந்த நபரே பொருளின் கூடுதலான பணத்தைப் பெற்றுச் செல்லவும்.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'justify', x: 5, y: 45, width: 138, visible: true, copyType: 'customer', side: 'back' },
        { id: 'term_4_c', type: 'text', label: '4. பொருளின் வட்டிவிகிதத்தை தெரிந்துக் கொண்டு தான் அடகு வைக்கின்றேன்.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'justify', x: 5, y: 55, width: 138, visible: true, copyType: 'customer', side: 'back' },
        { id: 'term_5_c', type: 'text', label: '5. கடைசி கால தவணையாக 1 வருட கால தவணை மட்டுமே. அதன் பிறகு இந்த அட்டை செல்லுபடியாகாது. இதில் குறிப்பிடப் பட்டிருக்கும் விதிமுறைகள் அனைத்திற்கும் நான் சம்மதிக்கிறேன்.', dataKey: '', fontSize: 7, fontWeight: 'bold', align: 'justify', x: 5, y: 65, width: 138, visible: true, copyType: 'customer', side: 'back' },

        { id: 'back_cust_sign_c', type: 'text', label: 'Customer sign', dataKey: '', fontSize: 9, fontWeight: 'medium', align: 'right', x: 110, y: 95, width: 30, visible: true, copyType: 'customer', side: 'back' },
    ] as ReceiptField[]
};

const DEFAULT_FIELDS: ReceiptField[] = [];

const ReceiptTemplateNew: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [showA4Preview, setShowA4Preview] = useState(false);
    const [layoutMode, setLayoutMode] = useState<"single" | "a4_2x2" | "a4_4up" | "thermal">("single");

    // Mock Data for Preview
    const PREVIEW_DATA = useMemo(() => ({
        pledge: {
            no: 'PL-2024-001',
            amount: 50000,
            date: new Date().toISOString(),
            due_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            scheme_name: 'Gold Loan Standard',
            interest_rate: 12,
            scheme_interest_rate: 12,
            total_weight: 24.5,
            gross_weight: 22.0,
            item_count: 3,
            items_description: '1 Gold Ring, 2 Gold Chains',
            remarks: 'Handle with care',
            jewel_image: 'https://via.placeholder.com/150'
        },
        customer: {
            name: 'John Doe',
            id: 'CUST-1001',
            mobile_no: '+91 98765 43210',
            address: '123 Main St, Tech Park',
            city: 'Bangalore',
            alt_phone: '+91 98765 00000',
            customer_image_url: 'https://via.placeholder.com/150'
        },
        brand: {
            brand_name: 'Auralendr Gold Loans',
            brand_address: '456 Gold Lane, Finance District',
            brand_mobile: '+91 80 1234 5678',
            brand_email: 'support@auralendr.com',
            brand_logo_url: 'https://via.placeholder.com/50'
        },
        jewels: [
            {
                description: 'Gold Ring',
                gross_weight: 10.5,
                quantity: 1
            },
            {
                description: 'Gold Chain',
                gross_weight: 14.0,
                quantity: 2
            }
        ]
    }), []);

    // Load A4ReceiptSheet lazily
    const A4ReceiptSheet = useMemo(() => React.lazy(() => import('../../../../../pages/Pledge/components/A4ReceiptSheet')), []);
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState<"layout" | "fields" | "styles">("fields");
    const [templateName, setTemplateName] = useState("Standard Receipt Template");
    const [margin, setMargin] = useState({ top: 0, right: 0, bottom: 0, left: 0 });
    const [fields, setFields] = useState<ReceiptField[]>(DEFAULT_FIELDS);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [viewSide, setViewSide] = useState<'front' | 'back'>('front');
    const [selectedCopy, setSelectedCopy] = useState<'office' | 'customer'>('office');
    const [saving, setSaving] = useState(false);
    const [templateId] = useState<string | null>(searchParams.get("id"));
    const [brandLogo, setBrandLogo] = useState<string | null>(null);
    const [brandData, setBrandData] = useState<any>(null);

    // Calculate Warning Fields (Overlap or Out of Bounds)
    const warningFieldIds = useMemo(() => {
        const warnings = new Set<string>();
        const visibleFields = fields.filter(f => f.visible && (f.side || 'front') === viewSide && (f.copyType || 'office') === selectedCopy);

        for (let i = 0; i < visibleFields.length; i++) {
            const a = visibleFields[i];

            // Check Out of Bounds
            if (a.x < 0 || a.y < 0 || (a.x + a.width) > 148 || (a.y + (a.height || 10)) > 105) { // Using A6 dims (148x105) loosely, or use configWidth/Height if available in scope
                // Note: configWidth/Height are not in scope here, hardcoding A6 for now or just checking general overlap
                // Actually configWidth is passed to Paper, it's a prop or constant? 
                // It's a constant or derived state. Let's assume standard A6 or check relative to 0. 
                // Actually, let's just do overlap for now to be safe, or check against 0.
                if (a.x < 0 || a.y < 0) warnings.add(a.id);
            }

            for (let j = i + 1; j < visibleFields.length; j++) {
                const b = visibleFields[j];
                const aH = a.height || (a.type === 'image' ? 30 : 10);
                const bH = b.height || (b.type === 'image' ? 30 : 10);

                if (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + bH && a.y + aH > b.y) {
                    warnings.add(a.id);
                    warnings.add(b.id);
                }
            }
        }
        return warnings;
    }, [fields, viewSide, selectedCopy]);

    // Merge Placeholders with Dynamic Brand Data
    const previewValues = useMemo(() => {
        const values = { ...PLACEHOLDER_VALUES };
        if (brandData) {
            if (brandData.brand_name) values['brand.name'] = brandData.brand_name;
            if (brandData.brand_tagline) values['brand.tagline'] = brandData.brand_tagline;
            if (brandData.brand_address) values['brand.address'] = brandData.brand_address;
            if (brandData.brand_phone) values['brand.phone'] = brandData.brand_phone;
            if (brandData.brand_email) values['brand.email'] = brandData.brand_email;
            if (brandData.brand_website) values['brand.website'] = brandData.brand_website;
            // Map GST if it exists in the future, for now fallback to placeholder
        }
        return values;
    }, [brandData]);

    // Fetch Brand Settings for Logo Preview
    useEffect(() => {
        const fetchBrandSettings = async () => {
            try {
                const response = await apiClient.get('/brand-settings');
                if (response.data) {
                    setBrandData(response.data);
                    // Only overwrite logo if we are creating new (no ID) or if needed?
                    // Actually, let's keep the logic: if we fetch brand, we might want to use it
                    // But if we are editing a template, it might have its own opinion?
                    // Just set it, fields will decide if they use it.
                    if (response.data.brand_logo_url) {
                        setBrandLogo(response.data.brand_logo_url);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch brand settings", error);
            }
        };
        fetchBrandSettings();
        fetchBrandSettings();
    }, []);

    // Effect: Fetch Template Data if Editing
    useEffect(() => {
        if (templateId) {
            const fetchTemplate = async () => {
                try {
                    const response = await apiClient.get(`/receipt-templates/${templateId}`);
                    const t = response.data;
                    if (t) {
                        setTemplateName(t.name);
                        // Parse papersize if needed, currently we assume configWidth matches or we override
                        // But wait, the component initializes configWidth from URL params w/h
                        // If we are editing, we should probably redirect OR update state?
                        // This component seems designed to take w/h from URL.
                        // For now, let's just load the fields and margin.

                        if (t.margin) setMargin(t.margin);

                        // Handle new layout_config structure
                        if (t.layout_config) {
                            if (t.layout_config.fields) {
                                setFields(t.layout_config.fields);
                            }
                            if (t.layout_config.scale) {
                                setScale(Number(t.layout_config.scale));
                            }
                        }
                    }
                } catch (error) {
                    console.error("Failed to load template", error);
                    toast.error("Failed to load template for editing");
                }
            };
            fetchTemplate();
        }
    }, [templateId]);

    // Interaction State
    const [interaction, setInteraction] = useState<{
        type: 'drag' | 'resize-left' | 'resize-right' | 'resize-font' | 'resize-height' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | null;
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
                } else if (interaction.type === 'resize-br') {
                    return {
                        ...f,
                        width: Math.round(Math.max(5, interaction.startFieldW + deltaXMM) * 1000) / 1000,
                        height: Math.round(Math.max(5, interaction.startFieldH + deltaYMM) * 1000) / 1000
                    };
                } else if (interaction.type === 'resize-bl') {
                    const newWidth = Math.max(5, interaction.startFieldW - deltaXMM);
                    const widthDiff = newWidth - interaction.startFieldW;
                    return {
                        ...f,
                        width: Math.round(newWidth * 1000) / 1000,
                        x: Math.round((interaction.startFieldX - widthDiff) * 1000) / 1000,
                        height: Math.round(Math.max(5, interaction.startFieldH + deltaYMM) * 1000) / 1000
                    };
                } else if (interaction.type === 'resize-tr') {
                    const newHeight = Math.max(5, interaction.startFieldH - deltaYMM);
                    const heightDiff = newHeight - interaction.startFieldH;
                    return {
                        ...f,
                        width: Math.round(Math.max(5, interaction.startFieldW + deltaXMM) * 1000) / 1000,
                        y: Math.round((interaction.startFieldY - heightDiff) * 1000) / 1000,
                        height: Math.round(newHeight * 1000) / 1000
                    };
                } else if (interaction.type === 'resize-tl') {
                    const newWidth = Math.max(5, interaction.startFieldW - deltaXMM);
                    const widthDiff = newWidth - interaction.startFieldW;
                    const newHeight = Math.max(5, interaction.startFieldH - deltaYMM);
                    const heightDiff = newHeight - interaction.startFieldH;

                    return {
                        ...f,
                        width: Math.round(newWidth * 1000) / 1000,
                        x: Math.round((interaction.startFieldX - widthDiff) * 1000) / 1000,
                        height: Math.round(newHeight * 1000) / 1000,
                        y: Math.round((interaction.startFieldY - heightDiff) * 1000) / 1000,
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
                papersize: { width: Number(configWidth), height: Number(configHeight), unit: 'mm' },
                orientation: configOrientation,
                margin: margin,
                layout_config: {
                    fields: fields,
                    margin: margin,
                    scale: scale,
                    papersize: { width: Number(configWidth), height: Number(configHeight), unit: 'mm' },
                    layout_mode: layoutMode
                },
                status: "active",
                layout_mode: layoutMode
            };

            console.log("Publishing template:", payload);

            if (templateId) {
                await apiClient.put(`/receipt-templates/${templateId}`, payload);
                toast.success("Template updated successfully!");
                // Stay on page or navigate? Usually stay for "Save Changes" behavior.
            } else {
                await apiClient.post("/receipt-templates", payload);
                toast.success("Template published successfully!");
                navigate("/admin/configs/templates/receipt"); // Go back to list only on create
            }
        } catch (error) {
            console.error(error);
            toast.error(templateId ? "Failed to update template" : "Failed to publish template");
        } finally {
            setSaving(false);
        }
    };
    const containerRef = useRef<HTMLDivElement>(null);
    const paperRef = useRef<HTMLDivElement>(null);

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
        <div className="fixed inset-0 z-40 flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
            {/* Navigation Header */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4">
                <div className="max-w-[1920px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin/configs/templates/receipt"
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

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            Discard
                        </button>
                        <button
                            onClick={() => setShowA4Preview(true)}
                            className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">grid_view</span>
                            Preview A4 Layout
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={saving}
                            className="h-10 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-sm">{templateId ? "save" : "publish"}</span>
                            )}
                            {templateId ? "Update Template" : "Publish Changes"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1920px] mx-auto w-full px-6 pt-6 pb-20 grid grid-cols-12 gap-6 overflow-hidden">
                {/* Left Sidebar: Components & Settings */}
                <div className="col-span-12 lg:col-span-4 xl:col-span-3 flex flex-col gap-6 h-full overflow-hidden">
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
                    <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 no-scrollbar">
                        <div className="space-y-8">
                            {/* Layout Tab Content (Presets) */}
                            {selectedTab === "layout" && (
                                <section className="animate-in fade-in slide-in-from-left-4 duration-300">
                                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-4">Preset Templates</h3>

                                    <div className="grid grid-cols-1 gap-4">
                                        <button
                                            onClick={() => {
                                                if (confirm('Load "Sabari Haris" style? This will replace your current layout.')) {
                                                    setFields(PRESET_LAYOUTS['sabari_haris'].map(f => ({ ...f, id: Date.now() + Math.random().toString() })));
                                                }
                                            }}
                                            className="group relative overflow-hidden p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 hover:shadow-md transition-all text-left"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Sabari Haris Style</span>
                                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-sm">auto_fix</span>
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 mb-3">
                                                Classic finance layout with logo, rate grid, pledge details, and dual photos.
                                            </p>
                                            <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 w-0 group-hover:w-full transition-all duration-500 ease-out" />
                                            </div>
                                        </button>

                                        {/* Placeholder for more presets */}
                                        <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs font-medium">
                                            More presets coming soon...
                                        </div>
                                    </div>
                                </section>
                            )}

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
                                                            <div className="space-y-4">
                                                                {/* Content Source Selection */}
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Content Source</label>
                                                                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
                                                                        <button
                                                                            onClick={() => updateField({ dataKey: field.dataKey || 'pledge.no' })}
                                                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${field.dataKey ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-400"}`}
                                                                        >
                                                                            Dynamic Data
                                                                        </button>
                                                                        <button
                                                                            onClick={() => updateField({ dataKey: '' })}
                                                                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${!field.dataKey ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-400"}`}
                                                                        >
                                                                            Static Text
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                {field.dataKey ? (
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Select Data Field</label>
                                                                        <select
                                                                            value={field.dataKey}
                                                                            onChange={(e) => {
                                                                                // Find the label for this key to update the field name automatically, unless user renamed it?
                                                                                // Actually, let's keep it simple. User selects key.
                                                                                const selectedKey = e.target.value;
                                                                                // Find label
                                                                                let newLabel = field.label;
                                                                                Object.values(DATA_KEYS).flat().forEach(k => {
                                                                                    if (k.value === selectedKey) newLabel = k.label;
                                                                                });

                                                                                updateField({
                                                                                    dataKey: selectedKey,
                                                                                    label: newLabel
                                                                                });
                                                                            }}
                                                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all custom-select"
                                                                        >
                                                                            <option value="">Select a field...</option>
                                                                            {Object.entries(DATA_KEYS).map(([category, keys]) => (
                                                                                <optgroup key={category} label={category}>
                                                                                    {keys.map((k) => (
                                                                                        <option key={k.value} value={k.value}>{k.label}</option>
                                                                                    ))}
                                                                                </optgroup>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Static Text Content</label>
                                                                        <textarea
                                                                            value={field.label}
                                                                            onChange={(e) => updateField({ label: e.target.value })}
                                                                            placeholder="Enter text here..."
                                                                            rows={2}
                                                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                                                        />
                                                                    </div>
                                                                )}
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
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <div>
                                                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Image Source</label>

                                                                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1 mb-3">
                                                                            <button
                                                                                onClick={() => updateField({ dataKey: field.dataKey || 'brand.logo' })}
                                                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${field.dataKey ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-400"}`}
                                                                            >
                                                                                Dynamic
                                                                            </button>
                                                                            <button
                                                                                onClick={() => updateField({ dataKey: '' })}
                                                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${!field.dataKey ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-400"}`}
                                                                            >
                                                                                Static URL
                                                                            </button>
                                                                        </div>

                                                                        {field.dataKey ? (
                                                                            <select
                                                                                value={field.dataKey}
                                                                                onChange={(e) => {
                                                                                    const selectedKey = e.target.value;
                                                                                    let newLabel = field.label;
                                                                                    Object.values(IMAGE_KEYS).flat().forEach(k => {
                                                                                        if (k.value === selectedKey) newLabel = k.label;
                                                                                    });
                                                                                    updateField({
                                                                                        dataKey: selectedKey,
                                                                                        label: newLabel
                                                                                    });
                                                                                }}
                                                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all custom-select"
                                                                            >
                                                                                {Object.entries(IMAGE_KEYS).map(([category, keys]) => (
                                                                                    <optgroup key={category} label={category}>
                                                                                        {keys.map((k) => (
                                                                                            <option key={k.value} value={k.value}>{k.label}</option>
                                                                                        ))}
                                                                                    </optgroup>
                                                                                ))}
                                                                            </select>
                                                                        ) : (
                                                                            <input
                                                                                type="text"
                                                                                value={field.imageUrl || ""}
                                                                                onChange={(e) => updateField({ imageUrl: e.target.value })}
                                                                                placeholder="https://example.com/logo.png"
                                                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
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
                                                            type: 'image',
                                                            label: 'Brand Logo',
                                                            dataKey: 'brand.logo',
                                                            x: 10,
                                                            y: 20,
                                                            width: 50,
                                                            height: 30, // Explicit default height for images
                                                            fontSize: 12,
                                                            fontWeight: 'normal',
                                                            align: 'left',
                                                            visible: true,
                                                            side: viewSide,
                                                            copyType: selectedCopy
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
                                                                {field.dataKey && <div className="text-[10px] text-blue-500 font-mono bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded inline-block mt-1">#{field.dataKey}</div>}
                                                                {!field.dataKey && <div className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded inline-block mt-1">Static Text</div>}
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
                                            <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[2px] mb-4">Print Layout Mode</h4>
                                            <div className="grid grid-cols-1 gap-3">
                                                <button
                                                    onClick={() => setLayoutMode('single')}
                                                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${layoutMode === 'single' ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-md ring-1 ring-blue-500" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${layoutMode === 'single' ? "bg-blue-100 dark:bg-blue-800 text-blue-600" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                                                            <span className="material-symbols-outlined">description</span>
                                                        </div>
                                                        <div className="text-left">
                                                            <div className={`text-sm font-bold ${layoutMode === 'single' ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"}`}>Single Receipt</div>
                                                            <div className="text-[10px] text-slate-500">Print exactly as designed (e.g. A6, Thermal)</div>
                                                        </div>
                                                    </div>
                                                    {layoutMode === 'single' && <span className="material-symbols-outlined text-blue-500">check_circle</span>}
                                                </button>

                                                <button
                                                    onClick={() => setLayoutMode('a4_4up')}
                                                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${layoutMode === 'a4_4up' ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-md ring-1 ring-blue-500" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${layoutMode === 'a4_4up' ? "bg-blue-100 dark:bg-blue-800 text-blue-600" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                                                            <span className="material-symbols-outlined">grid_view</span>
                                                        </div>
                                                        <div className="text-left">
                                                            <div className={`text-sm font-bold ${layoutMode === 'a4_4up' ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"}`}>A4 Sheet (4 Copies)</div>
                                                            <div className="text-[10px] text-slate-500">4 receipts per A4 page (2 Office + 2 Customer)</div>
                                                        </div>
                                                    </div>
                                                    {layoutMode === 'a4_4up' && <span className="material-symbols-outlined text-blue-500">check_circle</span>}
                                                </button>

                                                <button
                                                    onClick={() => setLayoutMode('a4_2x2')}
                                                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${layoutMode === 'a4_2x2' ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-md ring-1 ring-blue-500" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300"}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${layoutMode === 'a4_2x2' ? "bg-blue-100 dark:bg-blue-800 text-blue-600" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>
                                                            <span className="material-symbols-outlined">filter_2</span>
                                                        </div>
                                                        <div className="text-left">
                                                            <div className={`text-sm font-bold ${layoutMode === 'a4_2x2' ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"}`}>A4 Sheet (2 Copies)</div>
                                                            <div className="text-[10px] text-slate-500">2 receipts per A4 page (1 Office + 1 Customer)</div>
                                                        </div>
                                                    </div>
                                                    {layoutMode === 'a4_2x2' && <span className="material-symbols-outlined text-blue-500">check_circle</span>}
                                                </button>
                                            </div>
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

                </div>

                {/* Right Area: Interactive Preview */}
                <div
                    ref={containerRef}
                    className="col-span-12 lg:col-span-8 xl:col-span-9 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden relative"
                >
                    {/* Copy Type Selector (Top Sticky) */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setSelectedCopy('office')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCopy === 'office' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"}`}
                        >
                            Office Copy
                        </button>
                        <button
                            onClick={() => setSelectedCopy('customer')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedCopy === 'customer' ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"}`}
                        >
                            Customer Copy
                        </button>
                    </div>

                    {/* Preview Toolbar */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                                <button
                                    onClick={() => setViewSide('front')}
                                    className={`p-1.5 rounded-lg shadow-sm font-bold text-xs uppercase ${viewSide === 'front' ? 'bg-white dark:bg-slate-700 text-blue-600' : 'text-slate-500'}`}
                                >
                                    Front
                                </button>
                                <button
                                    onClick={() => setViewSide('back')}
                                    className={`p-1.5 rounded-lg shadow-sm font-bold text-xs uppercase ${viewSide === 'back' ? 'bg-white dark:bg-slate-700 text-blue-600' : 'text-slate-500'}`}
                                >
                                    Back
                                </button>
                            </div>
                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${viewSide === 'front' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                {viewSide === 'front' ? 'Front Side' : 'Back Side'} ({configOrientation}) {scale < 1 && <span className="text-amber-500 ml-1">({Math.round(scale * 100)}%)</span>}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setScale(prev => Math.max(0.1, prev - 0.1))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg text-slate-500">zoom_out</span>
                            </button>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{Math.round(scale * 100)}%</span>
                            <button
                                onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                <span className="material-symbols-outlined text-lg text-slate-500">zoom_in</span>
                            </button>
                        </div>
                    </div>

                    {/* Infinite Canvas */}
                    <div
                        className="flex-1 bg-slate-50 dark:bg-slate-950 p-12 overflow-auto flex justify-center items-start pattern-grid no-scrollbar"
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
                                {fields.filter(f => f.visible && (f.side || 'front') === viewSide && (f.copyType || 'office') === selectedCopy).map((field) => (
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
                                        className={`absolute cursor-move active:cursor-grabbing group transition-shadow ${selectedFieldId === field.id ? (warningFieldIds.has(field.id) ? "ring-2 ring-red-500 z-20 shadow-xl" : "ring-2 ring-blue-500 z-10 shadow-xl") : "hover:bg-slate-50/50"}`}
                                        style={{
                                            left: `${field.x}mm`,
                                            top: `${field.y}mm`,
                                            width: `${field.width}mm`,
                                            textAlign: field.align,
                                        }}
                                    >
                                        {selectedFieldId === field.id && warningFieldIds.has(field.id) && (
                                            <div className="absolute -top-3 left-0 bg-red-500 text-white text-[8px] font-bold px-1 rounded animate-pulse z-30 pointer-events-none whitespace-nowrap">
                                                Warning
                                            </div>
                                        )}
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
                                                            startFieldH: field.height || (field.type === 'image' ? 30 : 10),
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
                                                            startFieldH: field.height || (field.type === 'image' ? 30 : 10),
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
                                                            startFieldH: field.height || (field.type === 'image' ? 30 : 10),
                                                            startFieldFS: field.fontSize || 12
                                                        });
                                                    }}
                                                    className={`absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white border-2 border-blue-500 rounded-full z-20 hover:scale-125 transition-transform shadow-sm ${field.type === 'image' ? 'cursor-ns-resize' : 'cursor-ns-resize'}`}
                                                />

                                            </>
                                        )}

                                        <div className="p-1 h-full flex flex-col justify-center">
                                            {field.type === 'text' ? (
                                                <>
                                                    <div
                                                        className="select-none pointer-events-none break-words whitespace-normal leading-tight"
                                                        style={{
                                                            fontSize: `${field.fontSize || 12}pt`,
                                                            fontWeight:
                                                                field.fontWeight === 'bold' ? 700 :
                                                                    field.fontWeight === 'black' ? 900 :
                                                                        field.fontWeight === 'medium' ? 500 : 400
                                                        }}
                                                    >
                                                        {field.dataKey ? (previewValues[field.dataKey] || field.label) : field.label}
                                                    </div>

                                                </>
                                            ) : (
                                                <>
                                                    {((field.dataKey === 'brand.logo' && brandLogo) || field.imageUrl) ? (
                                                        <div className="flex-1 w-full h-full overflow-hidden" style={{ height: `${field.height || 30}mm` }}>
                                                            <img
                                                                src={(field.dataKey === 'brand.logo' && brandLogo) ? brandLogo : field.imageUrl}
                                                                alt={field.label}
                                                                className="w-full h-full object-contain pointer-events-none"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="flex-1 bg-slate-100 dark:bg-slate-800 rounded flex flex-col items-center justify-center p-2 border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden"
                                                            style={{ height: `${field.height || 30}mm` }}
                                                        >
                                                            <span className="material-symbols-outlined text-slate-400">
                                                                {field.dataKey === 'customer.image' ? 'person' :
                                                                    field.dataKey === 'pledge.jewel_image' ? 'diamond' : 'image'}
                                                            </span>
                                                            <span className="text-[8px] text-slate-400 font-bold uppercase mt-1 text-center leading-none">
                                                                {field.dataKey === 'brand.logo' ? 'Logo' : field.label}
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
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

            {/* A4 Preview Modal */}
            {showA4Preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full h-full max-w-6xl flex flex-col overflow-hidden relative shadow-2xl">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600">grid_view</span>
                                A4 Sheet Layout Preview
                            </h2>
                            <button
                                onClick={() => setShowA4Preview(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-4">
                            <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
                                <A4ReceiptSheet
                                    data={PREVIEW_DATA}
                                    config={{
                                        papersize: { width: Number(configWidth), height: Number(configHeight), unit: 'mm' },
                                        orientation: configOrientation as any,
                                        layout_config: { fields: fields }
                                    }}
                                    layoutMode={layoutMode === 'thermal' ? 'single' : layoutMode}
                                />
                            </React.Suspense>
                        </div>
                    </div>
                </div>
            )}

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
