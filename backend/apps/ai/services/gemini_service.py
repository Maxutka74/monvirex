import json
import logging
from pathlib import Path

from django.conf import settings
from google import genai
from google.genai import errors, types

from apps.ai.exceptions import (
    GeminiRateLimitError,
    GeminiServiceError,
    GeminiTimeoutError,
)

BASE_DIR = Path(__file__).resolve().parent.parent

SYSTEM_PROMT = BASE_DIR / "prompts" / "system.md"
MARKET_ANALYZE = BASE_DIR / "prompts" / "market_analysis.md"
PORTFOLIO_ANALYZE = BASE_DIR / "prompts" / "portfolio_analysis.md"

logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self):
        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY,
            http_options=types.HttpOptions(
                timeout=30000
            )
        )
        self.model = 'gemini-3.1-flash-lite'
        self.system_prompt = SYSTEM_PROMT.read_text(encoding='utf-8')
        self.system_market_analysis = MARKET_ANALYZE.read_text(encoding='utf-8')
        self.system_portfolio_analysis = PORTFOLIO_ANALYZE.read_text(encoding='utf-8')

    def generate_response(self, message: str, messages) -> str:
        history_content = []

        for msg in messages:
            if msg.role == 'assistant':
                history_content.append(
                    {
                        'role': 'model',
                        'parts': [
                            {'text': msg.content}
                        ]
                    }
                )
            else:
                history_content.append(
                    {
                        'role': 'user',
                        'parts': [
                            {'text': msg.content}
                        ]
                    }
                )

        history_content.append(
            {
                'role': 'user',
                'parts': [
                    {'text': message}
                ]
            }
        )

        logger.info(
            'Gemini chat request started. Model: %s',
            self.model
        )

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=history_content,
                config=types.GenerateContentConfig(
                    system_instruction=self.system_prompt
                )
            )

            logger.info('Gemini chat request completed successfully.')

            return response.text

        except TimeoutError as e:
            logger.warning('Gemini chat request timed out.')
            raise GeminiTimeoutError(e)

        except errors.APIError as e:
            if e.code == 429:
                logger.warning('Gemini chat rate limit exceeded.')
                raise GeminiRateLimitError(e)

            logger.error(
                'Gemini chat API error. Code: %s',
                e.code
            )
            raise GeminiServiceError(e)

    def market_analysis(self, context):
        context = json.dumps(context)

        logger.info(
            'Gemini market analysis request started. Model: %s',
            self.model
        )

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=context,
                config=types.GenerateContentConfig(
                    system_instruction=(
                        self.system_prompt
                        + '\n\n'
                        + self.system_market_analysis
                    )
                )
            )

            logger.info(
                'Gemini market analysis request completed successfully.'
            )

            return response.text

        except TimeoutError as e:
            logger.warning('Gemini market analysis request timed out.')
            raise GeminiTimeoutError(e)

        except errors.APIError as e:
            if e.code == 429:
                logger.warning(
                    'Gemini market analysis rate limit exceeded.'
                )
                raise GeminiRateLimitError(e)

            logger.error(
                'Gemini market analysis API error. Code: %s',
                e.code
            )
            raise GeminiServiceError(e)

    def portfolio_analysis(self, context):
        context = json.dumps(context)

        logger.info(
            'Gemini portfolio analysis request started. Model: %s',
            self.model
        )

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=context,
                config=types.GenerateContentConfig(
                    system_instruction=(
                        self.system_prompt
                        + '\n\n'
                        + self.system_portfolio_analysis
                    )
                )
            )

            logger.info(
                'Gemini portfolio analysis request completed successfully.'
            )

            return response.text

        except TimeoutError as e:
            logger.warning(
                'Gemini portfolio analysis request timed out.'
            )
            raise GeminiTimeoutError(e)

        except errors.APIError as e:
            if e.code == 429:
                logger.warning(
                    'Gemini portfolio analysis rate limit exceeded.'
                )
                raise GeminiRateLimitError(e)

            logger.error(
                'Gemini portfolio analysis API error. Code: %s',
                e.code
            )
            raise GeminiServiceError(e)
