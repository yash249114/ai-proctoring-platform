"""Email service — sends exam credentials to students and OTPs to companies."""

import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

from config import MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM, MAIL_SERVER, MAIL_PORT

logger = logging.getLogger(__name__)

# Only configure if mail credentials are set
_mail_configured = bool(MAIL_USERNAME and MAIL_PASSWORD)

async def send_exam_credentials(
    student_email: str,
    student_name: str,
    username: str,
    password: str,
    exam_link: str,
    assessment_title: str,
    duration_minutes: int,
    scheduled_at: str = "As soon as available",
) -> bool:
    """Send exam credentials email. Returns True on success, False on failure."""
    if not _mail_configured:
        logger.warning("Mail not configured — skipping email to %s. Credentials: %s / %s", student_email, username, password)
        return True  # return True so the flow continues in dev

    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #818cf8; margin: 0;">Albus Assessment Platform</h1>
        </div>
        <p>Dear <strong>{student_name}</strong>,</p>
        <p>You have been invited to take: <strong style="color: #818cf8;">{assessment_title}</strong></p>
        <p><strong>Scheduled:</strong> {scheduled_at}<br/>
        <strong>Duration:</strong> {duration_minutes} minutes</p>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #818cf8; margin-top: 0;">Login Credentials</h3>
            <p><strong>Username:</strong> {username} (your college ID)</p>
            <p><strong>Password:</strong> <code style="background: #334155; padding: 2px 8px; border-radius: 4px;">{password}</code></p>
        </div>
        
        <div style="text-align: center; margin: 24px 0;">
            <a href="{exam_link}" style="background: #6366f1; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">Start Assessment</a>
        </div>
        
        <div style="background: #7f1d1d22; border: 1px solid #991b1b; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <h4 style="color: #fca5a5; margin-top: 0;">⚠️ IMPORTANT</h4>
            <ul style="color: #fca5a5; margin: 0; padding-left: 20px;">
                <li>Exam will be in fullscreen mode</li>
                <li>Do not switch tabs</li>
                <li>Keep your face visible to the webcam</li>
                <li>Switching tabs more than 5 times = disqualification</li>
            </ul>
        </div>
        
        <p style="font-size: 12px; color: #64748b; margin-top: 24px;">
            <strong>Terms:</strong> We do not store or share your personal data beyond this assessment.
        </p>
    </div>
    """

    msg = MIMEMultipart()
    msg['From'] = MAIL_FROM or MAIL_USERNAME
    msg['To'] = student_email
    msg['Subject'] = f"Your Assessment Credentials - {assessment_title}"
    msg.attach(MIMEText(html, 'html'))

    try:
        server = smtplib.SMTP(MAIL_SERVER, int(MAIL_PORT))
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM or MAIL_USERNAME, student_email, msg.as_string())
        server.quit()
        logger.info("Email sent to %s for assessment '%s'", student_email, assessment_title)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", student_email, e)
        return False

async def send_otp_email(to_email: str, otp: str):
    msg = MIMEMultipart()
    msg['From'] = MAIL_FROM or MAIL_USERNAME
    msg['To'] = to_email
    msg['Subject'] = "Verify your Albus Account - OTP"
    body = f"""
    <h2>Email Verification</h2>
    <p>Your OTP is: <strong style="font-size:24px">{otp}</strong></p>
    <p>Valid for 10 minutes.</p>
    <p>If you did not register, ignore this email.</p>
    """
    msg.attach(MIMEText(body, 'html'))
    try:
        server = smtplib.SMTP(MAIL_SERVER, int(MAIL_PORT))
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(MAIL_FROM or MAIL_USERNAME, to_email, msg.as_string())
        server.quit()
        print(f"OTP email sent to {to_email}")
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False
