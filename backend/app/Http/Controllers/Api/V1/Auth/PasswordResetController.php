<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PasswordResetController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // Check if user exists (but don't reveal existence to user yet)
        $user = \App\Models\User::where('email', $request->email)->first();

        if ($user) {
            // Rate limit check could also go here specific to email if needed, 
            // but middleware rate limiting is usually sufficient for endpoint protection.

            // Generate OTP
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $otpHash = \Illuminate\Support\Facades\Hash::make($otp);

            // Store in DB (overwrite existing)
            \App\Models\PasswordOtp::updateOrCreate(
                ['email' => $request->email],
                [
                    'otp_hash' => $otpHash,
                    'expires_at' => now()->addMinutes(5)
                ]
            );

            // Send Email
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\PasswordResetOtp($otp));
        }

        // Generic response to prevent email enumeration
        return response()->json([
            'message' => 'If an account exists with this email, a password reset code has been sent.',
            'expires_in' => 300 // 5 minutes
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        $record = \App\Models\PasswordOtp::where('email', $request->email)->first();

        // Check if record exists and is not expired
        if (!$record || $record->expires_at->isPast()) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 400);
        }

        // Check hash
        if (!\Illuminate\Support\Facades\Hash::check($request->otp, $record->otp_hash)) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 400);
        }

        return response()->json(['message' => 'OTP verified successfully.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6', // Re-verify OTP to ensure security
            'password' => 'required|confirmed|min:8',
        ]);

        $record = \App\Models\PasswordOtp::where('email', $request->email)->first();

        // Re-check validity (double safety)
        if (!$record || $record->expires_at->isPast() || !\Illuminate\Support\Facades\Hash::check($request->otp, $record->otp_hash)) {
            return response()->json(['message' => 'Invalid request. Please try again.'], 400);
        }

        // Update User Password
        $user = \App\Models\User::where('email', $request->email)->firstOrFail();
        $user->forceFill([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password)
        ])->save();

        // Delete OTP record
        $record->delete();

        return response()->json(['message' => 'Password has been reset successfully.']);
    }

    /**
     * Change password for logged in user using OTP
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'otp' => 'required|digits:6',
            'password' => 'required|confirmed|min:8',
        ]);

        $user = $request->user();

        // Find OTP record for user's email
        $record = \App\Models\PasswordOtp::where('email', $user->email)->first();

        // Check if record exists, is not expired, and matches hash
        if (!$record || $record->expires_at->isPast() || !\Illuminate\Support\Facades\Hash::check($request->otp, $record->otp_hash)) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 400);
        }

        // Update Password
        $user->forceFill([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password)
        ])->save();

        // Delete OTP record
        $record->delete();

        return response()->json(['message' => 'Password changed successfully.']);
    }

    /**
     * Send OTP to authenticated user for password change
     */
    public function sendOtpForPasswordChange(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        // Generate OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpHash = \Illuminate\Support\Facades\Hash::make($otp);
        $expiresAt = now()->addMinutes(5);

        // Store in DB (overwrite existing)
        \App\Models\PasswordOtp::updateOrCreate(
            ['email' => $user->email],
            [
                'otp_hash' => $otpHash,
                'expires_at' => $expiresAt
            ]
        );

        // Send Email
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\PasswordResetOtp($otp));

        return response()->json([
            'message' => 'OTP sent to your email.',
            'expires_in' => 300 // 5 minutes in seconds
        ]);
    }
}
