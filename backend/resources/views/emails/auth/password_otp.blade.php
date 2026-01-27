<!DOCTYPE html>
<html>

<head>
    <title>Password Reset OTP</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Use the following code to verify your identity:</p>

        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">{{ $otp }}</span>
        </div>

        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply.</p>
    </div>
</body>

</html>