// utils/translateJson.ts
type TranslateData = { [key: string]: string };

export async function translateJson(targetLang: string, data: TranslateData): Promise<TranslateData | null> {
  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbz7YGmpep4iP4Gg8SpaA4z5kYY8CFXLjWlyNBi79GwNkmHg2rikPqydJJN2_Nziz3GgxA/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        targetLang, 
        data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch translation');
    }

    const translatedData: TranslateData = await response.json();
    return translatedData;
  } catch (error) {
    console.error('Translation error:', error);
    return null;
  }
}

