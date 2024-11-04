// utils/translate.ts

export async function translateText(
  text: string,
  targetLang: string = 'ja',
  sourceLang: string = '',
): Promise<string | null> {
  const apiUrl = "https://script.google.com/macros/s/AKfycbwcBlFEwt0PAjHfDLlxQ9ErXBScpYdIullfzfjQQiw30Y6VojDAvv0k13qRBrHr1hhxKA/exec";
  const params = new URLSearchParams({
    text: text,
    target: targetLang,
    source: sourceLang,
  });

  try {
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    const data: { translatedText?: string; error?: string } = await response.json();

    if (data.translatedText) {
      return data.translatedText;
    } else {
      console.error('Error:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
