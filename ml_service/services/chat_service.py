"""
Chat Service
Handles conversational AI and NLP tasks
"""

import os
from typing import Dict, Any, Optional
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

class ChatService:
    def __init__(self):
        self.chatbot_model = None
        self.sentiment_model = None
        self.load_models()
    
    def load_models(self):
        """Load trained models"""
        chatbot_path = MODELS_DIR / "chat" / "chatbot_model"
        # Note: LLM models are typically loaded differently
        # For now, we'll use API integration or rule-based fallback
    
    async def process_message(
        self,
        message: str,
        userId: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process chat message with AI"""
        message_lower = message.lower().strip()
        
        # Simple rule-based responses (fallback)
        # In production, this would use an LLM API or local model
        
        response = ""
        
        # Check for specific intents
        if any(word in message_lower for word in ['fraud', 'flagged', 'suspicious']):
            response = "I can help you understand fraud detection. Please provide your user ID for specific information about your account."
        elif any(word in message_lower for word in ['forecast', 'prediction', 'spending']):
            response = "I can help you generate spending or income forecasts. Would you like me to create a 3-month forecast?"
        elif any(word in message_lower for word in ['help', 'what can you do']):
            response = """I can help you with:
- Fraud detection and explanation
- Transaction analysis
- Spending forecasts
- Risk assessment
- Answer questions about flagged transactions

What would you like to know?"""
        else:
            response = "I can help you analyze your transactions, detect fraud, and generate forecasts. What would you like to know?"
        
        # If using cloud API (OpenAI, Anthropic, etc.)
        # response = await self._call_llm_api(message, userId, context)
        
        return {
            'message': response,
            'timestamp': self._get_timestamp(),
            'userId': userId,
            'context': context
        }
    
    async def _call_llm_api(
        self,
        message: str,
        userId: Optional[str],
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Call external LLM API"""
        # Example: OpenAI API call
        # import openai
        # response = openai.ChatCompletion.create(
        #     model="gpt-3.5-turbo",
        #     messages=[{"role": "user", "content": message}]
        # )
        # return response.choices[0].message.content
        return "LLM API not configured"
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    async def analyze_sentiment(self, message: str) -> Dict[str, Any]:
        """Analyze sentiment of message"""
        # Simple sentiment analysis (fallback)
        # In production, use BERT or similar model
        
        positive_words = ['good', 'great', 'excellent', 'helpful', 'thanks']
        negative_words = ['bad', 'wrong', 'error', 'problem', 'issue']
        
        message_lower = message.lower()
        positive_count = sum(1 for word in positive_words if word in message_lower)
        negative_count = sum(1 for word in negative_words if word in message_lower)
        
        if positive_count > negative_count:
            sentiment = 'positive'
            score = 0.7
        elif negative_count > positive_count:
            sentiment = 'negative'
            score = 0.3
        else:
            sentiment = 'neutral'
            score = 0.5
        
        return {
            'sentiment': sentiment,
            'score': score
        }

