// Lightweight client‐side geolocation & currency conversion
export async function getLocationAndRate() {
  try {
    // 1) Find visitor country code
    const locRes = await fetch('https://ipapi.co/json/');
    const locData = await locRes.json();
    const country = locData.country_code || 'US';
    const currency = locData.currency || 'USD';

    // 2) Fetch USD→local rate from exchangerate.host (free, no key)
    const rateRes = await fetch(
      `https://api.exchangerate.host/latest?base=USD&symbols=${currency}`
    );
    const rateJson = await rateRes.json();
    
    // Check if rates exist and currency rate is available
    const rate = (rateJson.rates && rateJson.rates[currency]) ? rateJson.rates[currency] : 1;

    return { country, currency, rate };
  } catch (error) {
    console.error('Error getting location and rate:', error);
    // Fallback to USD
    return { country: 'US', currency: 'USD', rate: 1 };
  }
}

