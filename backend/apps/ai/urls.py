from django.urls import path

from apps.ai.views import (
    ChatDetailView,
    ChatView,
    MarketAnalizeView,
    PortfolioAnalizeView,
)

urlpatterns = [
    path('chat/', ChatView.as_view()),
    path('chat/<int:chat_id>/', ChatDetailView.as_view()),
    path('market-analysis/', MarketAnalizeView.as_view()),
    path('portfolio-analysis/', PortfolioAnalizeView.as_view())
]