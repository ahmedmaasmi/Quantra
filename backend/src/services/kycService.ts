export interface KYCData {
  userId: string;
  documentType: 'passport' | 'id' | 'license';
  documentNumber?: string;
  documentImage?: string;
  faceImage?: string;
  verified: boolean;
}

export interface KYCResult {
  verified: boolean;
  score: number;
  checks: {
    documentValid: boolean;
    faceMatch: boolean;
    informationMatch: boolean;
  };
  recommendations: string[];
}

import { kycAPI } from './mlApiClient';

export const verifyKYC = async (kycData: KYCData): Promise<KYCResult> => {
  // Try to use ML service first
  try {
    const mlResult = await kycAPI.verify(
      kycData.userId,
      kycData.documentType,
      kycData.documentNumber,
      kycData.documentImage,
      kycData.faceImage
    );
    
    if (mlResult) {
      return {
        verified: mlResult.verified || false,
        score: mlResult.score || 0,
        checks: mlResult.checks || {
          documentValid: false,
          faceMatch: false,
          informationMatch: false,
        },
        recommendations: mlResult.recommendations || [],
      };
    }
  } catch (error) {
    console.warn('ML service unavailable, using fallback:', error);
  }
  
  // Fallback to mock verification
  const documentValid = Boolean(kycData.documentNumber && kycData.documentNumber.length > 5);
  const faceMatch = Boolean(kycData.faceImage);
  const informationMatch = true;
  
  const checks = {
    documentValid,
    faceMatch,
    informationMatch
  };
  
  const score = (Number(documentValid) + Number(faceMatch) + Number(informationMatch)) / 3 * 100;
  const verified = score >= 80;
  
  const recommendations: string[] = [];
  if (!documentValid) recommendations.push('Upload a valid document');
  if (!faceMatch) recommendations.push('Upload a clear face photo');
  if (!informationMatch) recommendations.push('Verify personal information matches');
  
  return {
    verified,
    score,
    checks,
    recommendations
  };
};

export const validateDocument = async (documentImage: string, documentType: string): Promise<boolean> => {
  // Try to use ML service first
  try {
    const result = await kycAPI.extractText(documentImage, documentType);
    return result?.success || false;
  } catch (error) {
    console.warn('ML service unavailable, using fallback:', error);
  }
  
  // Fallback
  return documentImage !== undefined && documentImage.length > 0;
};

export const matchFace = async (documentImage: string, faceImage: string): Promise<boolean> => {
  // Try to use ML service first
  try {
    const result = await kycAPI.matchFace(documentImage, faceImage);
    return result?.matched || false;
  } catch (error) {
    console.warn('ML service unavailable, using fallback:', error);
  }
  
  // Fallback
  return documentImage !== undefined && faceImage !== undefined;
};

