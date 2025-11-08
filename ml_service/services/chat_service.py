"""
Chat Service
Handles conversational AI and NLP tasks using OpenRouter API
"""

import os
import json
import aiohttp
from typing import Dict, Any, Optional
from pathlib import Path

# Go up to Quantra directory (parent of ml_service)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models"

class ChatService:
    def __init__(self):
        self.chatbot_model = None
        self.sentiment_model = None
        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        self.openrouter_url = os.getenv("OPENROUTER_URL")
        self.site_url = os.getenv("SITE_URL")
        self.site_name = os.getenv("SITE_NAME")
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
        """Process chat message with AI using OpenRouter"""
        try:
            
            response = await self._call_openrouter_api(message, userId, context)
            return {
                'message': response,
                'timestamp': self._get_timestamp(),
                'userId': userId,
                'context': context
            }
        except Exception as e:
            # Fallback to rule-based responses if API fails
            print(f"OpenRouter API error: {e}, falling back to rule-based responses")
            response = self._get_rule_based_response(message, userId, context)
            return {
                'message': response,
                'timestamp': self._get_timestamp(),
                'userId': userId,
                'context': context
            }
    
    async def _call_openrouter_api(
        self,
        message: str,
        userId: Optional[str],
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Call OpenRouter API for chat completion"""
        # Validate API key and URL are set
        if not self.openrouter_api_key:
            raise Exception("OpenRouter API key is not configured. Please set OPENROUTER_API_KEY environment variable.")
        
        if not self.openrouter_url:
            raise Exception("OpenRouter URL is not configured. Please set OPENROUTER_URL environment variable.")
        
        # Build system message with context
        system_message = self._build_system_message(userId, context)
        
        messages = [
            {
                "role": "system",
                "content": system_message
            },
            {
                "role": "user",
                "content": message
            }
        ]
        
        payload = {
            "model": "nvidia/nemotron-nano-12b-v2-vl:free",
            "messages": messages
        }
        
        headers = {
            "Authorization": f"Bearer {self.openrouter_api_key}",
            "HTTP-Referer": self.site_url or "https://quantra.app",
            "X-Title": self.site_name or "Quantra",
            "Content-Type": "application/json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.openrouter_url,
                headers=headers,
                json=payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if "choices" in data and len(data["choices"]) > 0:
                        return data["choices"][0]["message"]["content"]
                    else:
                        raise Exception("No choices in API response")
                elif response.status == 401:
                    error_text = await response.text()
                    raise Exception(f"OpenRouter API authentication failed (401): Invalid API key. Please check your OPENROUTER_API_KEY environment variable. Error: {error_text}")
                else:
                    error_text = await response.text()
                    raise Exception(f"OpenRouter API error: {response.status} - {error_text}")
    
    def _build_system_message(
        self,
        userId: Optional[str],
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Build system message with context about Quantra"""
        system_msg = """You are a helpful AI assistant for Quantra, a financial fraud detection and transaction analysis platform. 
You help users with:
- Fraud detection and explanation
- Transaction analysis
- Spending forecasts
- Risk assessment
- Answering questions about flagged transactions

Be concise, helpful, and professional."""
        
        if userId:
            system_msg += f"\n\nThe user's ID is: {userId}"
        
        if context:
            context_str = json.dumps(context, indent=2)
            system_msg += f"\n\nAdditional context:\n{context_str}"
        
        return system_msg
    
    def _get_rule_based_response(
        self,
        message: str,
        userId: Optional[str],
        context: Optional[Dict[str, Any]]
    ) -> str:
        """Fallback rule-based responses"""
        message_lower = message.lower().strip()
        
        # Check for specific intents
        if any(word in message_lower for word in ['fraud', 'flagged', 'suspicious']):
            return "I can help you understand fraud detection. Please provide your user ID for specific information about your account."
        elif any(word in message_lower for word in ['forecast', 'prediction', 'spending']):
            return "I can help you generate spending or income forecasts. Would you like me to create a 3-month forecast?"
        elif any(word in message_lower for word in ['help', 'what can you do']):
            return """I can help you with:
- Fraud detection and explanation
- Transaction analysis
- Spending forecasts
- Risk assessment
- Answer questions about flagged transactions

What would you like to know?"""
        else:
            return "I can help you analyze your transactions, detect fraud, and generate forecasts. What would you like to know?"
    
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

