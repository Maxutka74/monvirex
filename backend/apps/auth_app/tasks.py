import logging

from celery import shared_task
from django.conf import settings
from django.template.loader import render_to_string
from sendgrid import Mail, SendGridAPIClient

logger = logging.getLogger(__name__)

@shared_task
def send_email(email, subject, context, template_name):
    logger.info(
        "Celery task send_email started email=%s subject=%s template=%s",
        email,
        subject,
        template_name,
    )

    mail = Mail(
        from_email=settings.EMAIL_FROM,
        to_emails=email,
        subject=subject,
        html_content=render_to_string(template_name, context),
    )

    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        sg.send(mail)
    except Exception as e:
        logger.error(f'Failed to send verification email to {email}: {e}')
        raise

    logger.info(
        "Celery task send_email finished successfully email=%s subject=%s template=%s",
        email,
        subject,
        template_name,
    )
