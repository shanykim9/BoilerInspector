// This file contains the NanumGothic font in base64 format for jsPDF
// Generated from NanumGothic.ttf

export async function getNanumGothicBase64(): Promise<string> {
  try {
    // Import the base64 font data
    const response = await import('./NanumGothic.base64?raw');
    return response.default;
  } catch (error) {
    console.warn('Failed to load NanumGothic font:', error);
    return '';
  }
}