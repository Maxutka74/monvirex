import logging
from celery import shared_task
from django.conf import settings
from sendgrid import Mail, SendGridAPIClient

logger = logging.getLogger(__name__)


@shared_task
def send_verification_email(email, code):
    mail = Mail(
        from_email=settings.EMAIL_FROM,
        to_emails=email,
        subject='Email Verification Code',
        html_content=f'<h2>Твій код підтвердження: <strong>{code}</strong></h2><p>Код дійсний 15 хвилин.</p>'
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(mail)
    except Exception as e:
        logger.error(f'Failed to send verification email to {email}: {e}')
        raise