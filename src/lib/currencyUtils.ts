import { Currency } from "./firebaseTypes";

// Supported currencies with their symbols and display names
export const SUPPORTED_CURRENCIES: Record<Currency, { symbol: string; name: string; flag?: string }> = {
    INR: { symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
    USD: { symbol: "$", name: "US Dollar", flag: "🇺🇸" },
    EUR: { symbol: "€", name: "Euro", flag: "🇪🇺" },
    GBP: { symbol: "£", name: "British Pound", flag: "🇬🇧" },
    JPY: { symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
    AUD: { symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
    CAD: { symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
    CHF: { symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    CNY: { symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
};

// Fallback exchange rates to INR (updated periodically or can be replaced with API)
// These rates are approximate and should be updated or fetched from an API in production
export const FALLBACK_EXCHANGE_RATES: Record<Currency, number> = {
    INR: 1.0,       // Base currency
    USD: 83.5,      // 1 USD = 83.5 INR
    EUR: 91.2,      // 1 EUR = 91.2 INR
    GBP: 106.5,     // 1 GBP = 106.5 INR
    JPY: 0.56,      // 1 JPY = 0.56 INR
    AUD: 55.3,      // 1 AUD = 55.3 INR
    CAD: 61.8,      // 1 CAD = 61.8 INR
    CHF: 95.4,      // 1 CHF = 95.4 INR
    CNY: 11.5,      // 1 CNY = 11.5 INR
};

/**
 * Convert an amount from any currency to INR
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency
 * @param customRates - Optional custom exchange rates (default: FALLBACK_EXCHANGE_RATES)
 * @returns The amount in INR
 */
export function convertToINR(
    amount: number,
    fromCurrency: Currency,
    customRates?: Record<Currency, number>
): number {
    const rates = customRates || FALLBACK_EXCHANGE_RATES;
    const rate = rates[fromCurrency] || 1;
    return amount * rate;
}

/**
 * Convert an amount from INR to any currency
 * @param amount - The amount in INR to convert
 * @param toCurrency - The target currency
 * @param customRates - Optional custom exchange rates (default: FALLBACK_EXCHANGE_RATES)
 * @returns The amount in target currency
 */
export function convertFromINR(
    amount: number,
    toCurrency: Currency,
    customRates?: Record<Currency, number>
): number {
    const rates = customRates || FALLBACK_EXCHANGE_RATES;
    const rate = rates[toCurrency] || 1;
    return amount / rate;
}

/**
 * Convert between any two currencies
 * @param amount - The amount to convert
 * @param fromCurrency - The source currency
 * @param toCurrency - The target currency
 * @param customRates - Optional custom exchange rates (default: FALLBACK_EXCHANGE_RATES)
 * @returns The converted amount
 */
export function convertCurrency(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency,
    customRates?: Record<Currency, number>
): number {
    if (fromCurrency === toCurrency) return amount;

    const inrAmount = convertToINR(amount, fromCurrency, customRates);
    return convertFromINR(inrAmount, toCurrency, customRates);
}

/**
 * Format a currency amount with the appropriate symbol
 * @param amount - The amount to format
 * @param currency - The currency code
 * @param showCode - Whether to show the currency code alongside the symbol
 * @returns Formatted currency string
 */
export function formatCurrency(
    amount: number,
    currency: Currency,
    showCode: boolean = false
): string {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    const symbol = currencyInfo?.symbol || currency;

    const formattedAmount = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    const sign = amount < 0 ? '-' : '';
    const codeStr = showCode ? ` ${currency}` : '';

    return `${sign}${symbol}${formattedAmount}${codeStr}`;
}

/**
 * Format amount with original currency and INR equivalent
 * @param amount - The amount in original currency
 * @param currency - The original currency
 * @param customRates - Optional custom exchange rates
 * @returns Formatted string showing both values
 */
export function formatWithINREquivalent(
    amount: number,
    currency: Currency,
    customRates?: Record<Currency, number>
): string {
    if (currency === 'INR') {
        return formatCurrency(amount, 'INR');
    }

    const inrAmount = convertToINR(amount, currency, customRates);
    const originalFormatted = formatCurrency(amount, currency);
    const inrFormatted = formatCurrency(inrAmount, 'INR');

    return `${inrFormatted} (${originalFormatted})`;
}

/**
 * Get currency symbol for a given currency code
 * @param currency - The currency code
 * @returns The currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
    return SUPPORTED_CURRENCIES[currency]?.symbol || currency;
}

/**
 * Get currency name for a given currency code
 * @param currency - The currency code
 * @returns The currency name
 */
export function getCurrencyName(currency: Currency): string {
    return SUPPORTED_CURRENCIES[currency]?.name || currency;
}
