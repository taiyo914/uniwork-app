// utils/exchangeRate.js
export async function fetchExchangeRate(targetCurrency: string) {
  const apiUrl = `https://script.google.com/macros/s/AKfycbwqDXojXWbOwiwmIMrCE3cPkFjqckQUDwGAhCtgvax6unf8-rsFjfvPTurHFpp_JGRLBA/exec?target=${targetCurrency}`;

  try {
    console.log(apiUrl);
    const response = await fetch(apiUrl);
    const text = await response.text();
    console.log(text);

    // レスポンスがJSONかどうかをチェック
    if (response.headers.get("content-type")?.includes("application/json")) {
      const data = JSON.parse(text);
      return data.rate; // レートのみを返す
    } else {
      console.error("Unexpected response format:", text);
      return null;
    }
  } catch (error) {
    console.error("為替レートの取得エラー:", error);
    return null;
  }
}
