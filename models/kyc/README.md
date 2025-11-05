# KYC Verification Models

This directory contains AI/ML models for KYC (Know Your Customer) verification.

## Models

- **document_ocr_model/** - OCR model for text extraction (if using custom model)
  - Alternative: Use Tesseract OCR or cloud APIs (Google Vision, AWS Textract)
  - Purpose: Extract text from ID documents (passport, license, ID card)

- **face_recognition_model.pkl** - Face matching model (FaceNet/ArcFace)
  - Purpose: Match face in selfie with photo in document
  - Output: Face match score (0-100) and boolean match

- **document_validator.h5** - CNN model for document authenticity verification
  - Purpose: Detect tampering and forgery in documents
  - Output: Validity score (0-100)

- **tesseract_config/** - Tesseract OCR configuration files

## Training

Run `python scripts/train_kyc_models.py` to train new models.

## Usage

Models are loaded and used via the Python ML API service at `ml_service/app.py`.

## Dependencies

- Tesseract OCR
- face_recognition library
- OpenCV for image processing

