import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/apiClient';
import { useAuth } from '../../../context/Auth/AuthContext';
import { User, Lock, Save, Loader2, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { compressImage } from '../../../utils/imageCompression';

const AdminProfile = () => {
    const { user, refreshUser } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otpExpiresIn, setOtpExpiresIn] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone_number: ''
    });
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Initialize state from user object
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone_number: user.phone_number || ''
            });
            if (user.photo_url) {
                setPhotoPreview(user.photo_url);
            }
        }
    }, [user]);

    // Fetch full profile to verify latest state
    useEffect(() => {
        refreshUser().catch(console.error);
    }, []);

    // OTP Timer Effect
    useEffect(() => {
        if (otpExpiresIn > 0) {
            timerRef.current = setInterval(() => {
                setOtpExpiresIn(prev => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        setShowOtpInput(false);
                        setMessage({ type: 'error', text: 'OTP expired. Please request a new one.' });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [showOtpInput]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStorageUrl = (url: string | null) => {
        if (!url) return '';
        if (url.startsWith('http') || url.startsWith('blob:')) return url;
        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || '';
        return `${baseUrl}${url}`;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        // ... existing code ...
        e.preventDefault();
        setLoadingProfile(true);
        setMessage(null);

        const fd = new FormData();
        fd.append('name', profileData.name);
        fd.append('email', profileData.email);
        fd.append('phone_number', profileData.phone_number);

        if (photo) {
            try {
                const compressed = await compressImage(photo);
                fd.append('files[]', compressed);
            } catch (err) {
                console.warn("Image compression failed, using original", err);
                fd.append('files[]', photo);
            }
            fd.append('categories[]', 'profile_photo');
        }

        try {
            await api.post('/me/profile', fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
            await refreshUser();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSendOtp = async () => {
        setMessage(null);
        if (!user?.email) {
            setMessage({ type: 'error', text: 'User email not found.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
            return;
        }

        setLoadingPassword(true);
        try {
            const response = await api.post('/me/send-otp');
            setMessage({ type: 'success', text: 'OTP sent to your email.' });
            setShowOtpInput(true);
            setOtpExpiresIn(response.data.expires_in || 300);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send OTP.' });
        } finally {
            setLoadingPassword(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters.' });
            return;
        }

        setLoadingPassword(true);
        try {
            await api.post('/change-password', {
                otp,
                password: newPassword,
                password_confirmation: confirmPassword
            });
            setMessage({ type: 'success', text: 'Password updated successfully.' });
            setNewPassword('');
            setConfirmPassword('');
            setOtp('');
            setShowOtpInput(false);
            setOtpExpiresIn(0);
            if (timerRef.current) clearInterval(timerRef.current);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update password.'
            });
        } finally {
            setLoadingPassword(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>

            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            {/* Profile Info Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                <form onSubmit={handleProfileUpdate}>
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
                                    {photoPreview ? (
                                        <img src={getStorageUrl(photoPreview)} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors shadow-sm">
                                    <Camera className="w-4 h-4" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize font-medium">{user?.role} Account</p>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                        value={profileData.phone_number}
                                        onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                />
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loadingProfile}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loadingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={showOtpInput}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={showOtpInput}
                        />
                    </div>

                    {!showOtpInput ? (
                        <div className="pt-4">
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loadingPassword || !newPassword || !confirmPassword}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg hover:opacity-90 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enter OTP</label>
                                    <span className={`text-sm font-mono ${otpExpiresIn <= 60 ? 'text-red-500' : 'text-gray-500'}`}>
                                        Expires in {formatTime(otpExpiresIn)}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white tracking-widest text-center font-mono text-lg"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    maxLength={6}
                                    placeholder="000000"
                                />
                                <p className="text-xs text-gray-500">OTP sent to {user?.email}</p>
                            </div>

                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={loadingPassword || otp.length !== 6}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loadingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Update Password
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowOtpInput(false);
                                        setOtpExpiresIn(0);
                                        if (timerRef.current) clearInterval(timerRef.current);
                                    }}
                                    className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;
