"""
KYC Service
Handles KYC verification including OCR, face recognition, and document validation
"""

import os
import sys
import base64
import cv2
import numpy as np
from typing import Dict, Any, Optional
from pathlib import Path

# Go up to Quantra directory (parent of ml_service)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models"

# Try to import optional dependencies
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("Warning: pytesseract not available. OCR functionality will be limited.")

try:
    import face_recognition
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("Warning: face_recognition not available. Face matching will be limited.")

try:
    from tensorflow import keras
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("Warning: TensorFlow not available. Document validation will use basic checks.")

class KYCService:
    def __init__(self):
        self.face_model = None
        self.document_validator = None
        self.load_models()
    
    def load_models(self):
        """Load trained models"""
        face_model_path = MODELS_DIR / "kyc" / "face_recognition_model.pkl"
        doc_validator_path = MODELS_DIR / "kyc" / "document_validator.h5"
        
        if face_model_path.exists():
            try:
                import joblib
                self.face_model = joblib.load(face_model_path)
            except Exception as e:
                print(f"Warning: Could not load face recognition model: {e}")
        
        if doc_validator_path.exists() and TENSORFLOW_AVAILABLE:
            try:
                self.document_validator = keras.models.load_model(str(doc_validator_path))
            except Exception as e:
                print(f"Warning: Could not load document validator: {e}")
    
    def decode_image(self, image_base64: str) -> np.ndarray:
        """Decode base64 image"""
        try:
            image_data = base64.b64decode(image_base64)
            nparr = np.frombuffer(image_data, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            raise ValueError(f"Invalid image data: {e}")
    
    async def extract_text(self, documentImage: str, documentType: str) -> Dict[str, Any]:
        """Extract text from document using OCR"""
        if not TESSERACT_AVAILABLE:
            return {
                'success': False,
                'error': 'OCR not available. Install pytesseract.',
                'extractedText': {}
            }
        
        try:
            img = self.decode_image(documentImage)
            
            # Preprocess image
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # OCR extraction
            text = pytesseract.image_to_string(gray)
            
            # Extract structured fields (simplified)
            extracted_fields = {
                'rawText': text,
                'documentNumber': self._extract_document_number(text),
                'name': self._extract_name(text),
                'dateOfBirth': self._extract_date_of_birth(text),
                'expiryDate': self._extract_expiry_date(text)
            }
            
            return {
                'success': True,
                'extractedText': extracted_fields,
                'confidence': 0.85
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'extractedText': {}
            }
    
    def _extract_document_number(self, text: str) -> Optional[str]:
        """Extract document number from text"""
        # Simplified - actual implementation would use regex/NLP
        import re
        # Look for patterns like passport numbers, ID numbers
        patterns = [
            r'\b[A-Z]{1,2}\d{6,9}\b',
            r'\d{9,12}'
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group()
        return None
    
    def _extract_name(self, text: str) -> Optional[str]:
        """Extract name from text"""
        # Simplified - actual implementation would use NLP
        lines = text.split('\n')
        for line in lines[:5]:  # Check first few lines
            if len(line.split()) >= 2:
                return line.strip()
        return None
    
    def _extract_date_of_birth(self, text: str) -> Optional[str]:
        """Extract date of birth from text"""
        import re
        # Look for date patterns
        patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',
            r'\d{4}[/-]\d{1,2}[/-]\d{1,2}'
        ]
        for pattern in patterns:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0]
        return None
    
    def _extract_expiry_date(self, text: str) -> Optional[str]:
        """Extract expiry date from text"""
        # Similar to date of birth extraction
        return self._extract_date_of_birth(text)
    
    async def match_face(self, documentImage: str, faceImage: str) -> Dict[str, Any]:
        """Match face in document with selfie"""
        if not FACE_RECOGNITION_AVAILABLE:
            return {
                'success': False,
                'matched': False,
                'score': 0,
                'error': 'Face recognition not available. Install face_recognition library.'
            }
        
        try:
            doc_img = self.decode_image(documentImage)
            face_img = self.decode_image(faceImage)
            
            # Convert BGR to RGB
            doc_img_rgb = cv2.cvtColor(doc_img, cv2.COLOR_BGR2RGB)
            face_img_rgb = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
            
            # Find faces
            doc_face_locations = face_recognition.face_locations(doc_img_rgb)
            face_face_locations = face_recognition.face_locations(face_img_rgb)
            
            if not doc_face_locations or not face_face_locations:
                return {
                    'success': False,
                    'matched': False,
                    'score': 0,
                    'error': 'Could not detect face in one or both images'
                }
            
            # Get face encodings
            doc_encoding = face_recognition.face_encodings(doc_img_rgb, doc_face_locations)[0]
            face_encoding = face_recognition.face_encodings(face_img_rgb, face_face_locations)[0]
            
            # Calculate distance
            distance = face_recognition.face_distance([doc_encoding], face_encoding)[0]
            
            # Match threshold (typically 0.6)
            matched = distance < 0.6
            score = max(0, 100 - (distance * 100))
            
            return {
                'success': True,
                'matched': bool(matched),
                'score': float(score),
                'distance': float(distance),
                'threshold': 0.6
            }
        except Exception as e:
            return {
                'success': False,
                'matched': False,
                'score': 0,
                'error': str(e)
            }
    
    async def verify_document(self, documentImage: str, documentType: str) -> Dict[str, Any]:
        """Verify document authenticity"""
        try:
            img = self.decode_image(documentImage)
            
            # Use CNN model if available
            if self.document_validator:
                # Preprocess image
                img_resized = cv2.resize(img, (224, 224))
                img_normalized = img_resized.astype(np.float32) / 255.0
                img_batch = np.expand_dims(img_normalized, axis=0)
                
                # Predict
                validity_score = self.document_validator.predict(img_batch)[0][0] * 100
            else:
                # Fallback: basic validation checks
                validity_score = self._basic_validation(img)
            
            is_valid = validity_score >= 80
            
            return {
                'valid': is_valid,
                'score': float(validity_score),
                'documentType': documentType
            }
        except Exception as e:
            return {
                'valid': False,
                'score': 0,
                'error': str(e)
            }
    
    def _basic_validation(self, img: np.ndarray) -> float:
        """Basic document validation (simplified)"""
        # Check image quality
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Basic quality score
        quality_score = min(100, laplacian_var / 10)
        
        return quality_score
    
    async def verify_kyc(
        self,
        userId: str,
        documentType: str,
        documentNumber: Optional[str],
        documentImage: Optional[str],
        faceImage: Optional[str]
    ) -> Dict[str, Any]:
        """Complete KYC verification"""
        checks = {
            'documentValid': False,
            'faceMatch': False,
            'informationMatch': False
        }
        
        recommendations = []
        scores = []
        
        # Document validation
        if documentImage:
            doc_result = await self.verify_document(documentImage, documentType)
            checks['documentValid'] = doc_result['valid']
            scores.append(doc_result['score'])
            if not doc_result['valid']:
                recommendations.append('Upload a valid document')
        else:
            recommendations.append('Upload document image')
        
        # OCR extraction
        extracted_fields = {}
        if documentImage:
            ocr_result = await self.extract_text(documentImage, documentType)
            if ocr_result['success']:
                extracted_fields = ocr_result['extractedText']
                # Check if document number matches
                if documentNumber:
                    extracted_doc_num = extracted_fields.get('documentNumber', '')
                    checks['informationMatch'] = documentNumber.lower() in extracted_doc_num.lower()
                    if not checks['informationMatch']:
                        recommendations.append('Verify personal information matches')
        
        # Face matching
        if documentImage and faceImage:
            face_result = await self.match_face(documentImage, faceImage)
            checks['faceMatch'] = face_result.get('matched', False)
            if face_result.get('score'):
                scores.append(face_result['score'])
            if not checks['faceMatch']:
                recommendations.append('Upload a clear face photo')
        else:
            recommendations.append('Upload both document and face images')
        
        # Calculate overall score
        overall_score = sum(scores) / len(scores) if scores else 0
        verified = overall_score >= 80 and checks['documentValid'] and checks['faceMatch']
        
        return {
            'verified': verified,
            'score': float(overall_score),
            'checks': checks,
            'recommendations': recommendations,
            'extractedFields': extracted_fields
        }

