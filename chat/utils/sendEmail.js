import nodemailer from 'nodemailer';

const createTransporter = () => {
    const host = process.env.EMAIL_HOST;
    const port = Number(process.env.EMAIL_PORT || 587);

    if (host) {
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const sendEmail = async ({ to, subject, text, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS are required to send email');
    }

    const transporter = createTransporter();

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    });
};

export const sendOtpEmail = async ({ to, otp, purpose = 'verify your email' }) => {
    await sendEmail({
        to,
        subject: 'Your ChatApp OTP code',
        text: `Use this OTP to ${purpose}: ${otp}. It expires in 10 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                <h2>ChatApp verification code</h2>
                <p>Use this OTP to ${purpose}:</p>
                <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${otp}</p>
                <p>This code expires in 10 minutes.</p>
            </div>
        `
    });
};
