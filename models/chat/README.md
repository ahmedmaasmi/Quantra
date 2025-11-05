# Chat/Chatbot Models

This directory contains AI/ML models for conversational AI.

## Models

- **chatbot_model/** - LLM model files (if using local model like Llama 2)
  - Alternative: Use cloud APIs (OpenAI GPT, Anthropic Claude)
  - Purpose: Understand user queries and generate contextual responses

## Options

1. **Local LLM** (Llama 2, Mistral, etc.) - Store model files here
2. **Cloud API** - Use OpenAI, Anthropic, or other providers (no local files needed)

## Training

If using a custom fine-tuned model, training scripts would be in `scripts/train_chat_model.py`.

## Usage

Models are loaded and used via the Python ML API service at `ml_service/app.py`.

