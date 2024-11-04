import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const text = searchParams.get('text') || '';
    const targetLang = searchParams.get('targetLang') || 'ja';
    const sourceLang = searchParams.get('sourceLang') || '';

    const apiUrl = "https://script.google.com/macros/s/AKfycbwcBlFEwt0PAjHfDLlxQ9ErXBScpYdIullfzfjQQiw30Y6VojDAvv0k13qRBrHr1hhxKA/exec";
    const params = new URLSearchParams({
      text: text,
      target: targetLang,
      source: sourceLang,
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      console.error('Error response from Google Apps Script:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to fetch translation from Google Apps Script' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
