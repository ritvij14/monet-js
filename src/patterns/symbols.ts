/**
 * Symbols Pattern Parser
 * ======================
 * Handles monetary patterns with currency symbols (e.g., '$100', '€50', '£20.50').
 * 
 * Pattern Examples:
 * - "$100"
 * - "€50"
 * - "£20.50"
 * - "¥1000"
 * - "₹500"
 * - "100$" (symbol after number)
 * 
 * This parser recognizes currency symbols from around the world and maps them to their
 * ISO 4217 currency codes. It handles symbols both before and after the numeric value.
 */

import { ValueOverflowError } from '../errors';
import { getCurrencyByCode } from '../currencyData';

/**
 * Comprehensive mapping of currency symbols to ISO 4217 codes.
 * Covers all major global currencies and their common symbol variations.
 */
export const CURRENCY_SYMBOL_MAP: Record<string, string[]> = {
  // Dollar symbols (various currencies use $)
  '$': ['USD', 'AUD', 'CAD', 'NZD', 'SGD', 'HKD', 'MXN', 'ARS', 'CLP', 'COP', 'BRL'],
  'USD': ['USD'],
  'US$': ['USD'],
  'AUD': ['AUD'],
  'A$': ['AUD'],
  'AU$': ['AUD'],
  'CAD': ['CAD'],
  'C$': ['CAD'],
  'CA$': ['CAD'],
  'NZD': ['NZD'],
  'NZ$': ['NZD'],
  'SGD': ['SGD'],
  'S$': ['SGD'],
  'HKD': ['HKD'],
  'HK$': ['HKD'],
  'MXN': ['MXN'],
  'MX$': ['MXN'],
  'ARS': ['ARS'],
  'AR$': ['ARS'],
  'CLP': ['CLP'],
  'CL$': ['CLP'],
  'COP': ['COP'],
  'CO$': ['COP'],
  'BRL': ['BRL'],
  'R$': ['BRL'],
  
  // Euro
  '€': ['EUR'],
  'EUR': ['EUR'],
  
  // Pound Sterling
  '£': ['GBP'],
  'GBP': ['GBP'],
  
  // Yen / Yuan
  '¥': ['JPY', 'CNY'],
  'JP¥': ['JPY'],
  'CN¥': ['CNY'],
  '元': ['CNY'],
  
  // Indian Rupee
  '₹': ['INR'],
  'Rs': ['INR'],
  'Rs.': ['INR'],
  'INR': ['INR'],
  
  // Russian Ruble
  '₽': ['RUB'],
  'руб': ['RUB'],
  'RUB': ['RUB'],
  
  // Korean Won
  '₩': ['KRW'],
  'KRW': ['KRW'],
  
  // Turkish Lira
  '₺': ['TRY'],
  'TL': ['TRY'],
  'TRY': ['TRY'],
  
  // Swiss Franc
  'CHF': ['CHF'],
  'Fr': ['CHF'],
  'SFr': ['CHF'],
  
  // Polish Zloty
  'zł': ['PLN'],
  'PLN': ['PLN'],
  
  // Thai Baht
  '฿': ['THB'],
  'THB': ['THB'],
  
  // Indonesian Rupiah
  'Rp': ['IDR'],
  'IDR': ['IDR'],
  
  // Malaysian Ringgit
  'RM': ['MYR'],
  'MYR': ['MYR'],
  
  // Philippine Peso
  '₱': ['PHP'],
  'PHP': ['PHP'],
  
  // Vietnamese Dong
  '₫': ['VND'],
  'VND': ['VND'],
  
  // South African Rand
  'R': ['ZAR'],
  'ZAR': ['ZAR'],
  
  // Swedish Krona
  'kr': ['SEK', 'NOK', 'DKK', 'ISK'],
  'SEK': ['SEK'],
  'NOK': ['NOK'],
  'DKK': ['DKK'],
  'ISK': ['ISK'],
  
  // Czech Koruna
  'Kč': ['CZK'],
  'CZK': ['CZK'],
  
  // Hungarian Forint
  'Ft': ['HUF'],
  'HUF': ['HUF'],
  
  // Israeli Shekel
  '₪': ['ILS'],
  'ILS': ['ILS'],
  
  // UAE Dirham
  'د.إ': ['AED'],
  'AED': ['AED'],
  
  // Saudi Riyal
  'ر.س': ['SAR'],
  'SAR': ['SAR'],
  
  // Egyptian Pound
  'E£': ['EGP'],
  'EGP': ['EGP'],
  
  // Nigerian Naira
  '₦': ['NGN'],
  'NGN': ['NGN'],
  
  // Kenyan Shilling
  'KSh': ['KES'],
  'KES': ['KES'],
  
  // Pakistani Rupee
  'PKR': ['PKR'],
  
  // Bangladeshi Taka
  '৳': ['BDT'],
  'BDT': ['BDT'],
  
  // Sri Lankan Rupee
  'LKR': ['LKR'],
  
  // Ukrainian Hryvnia
  '₴': ['UAH'],
  'UAH': ['UAH'],
  
  // Romanian Leu
  'lei': ['RON'],
  'RON': ['RON'],
  
  // Bulgarian Lev
  'лв': ['BGN'],
  'BGN': ['BGN'],
  
  // Croatian Kuna (replaced by EUR in 2023, but still in historical data)
  'kn': ['HRK'],
  'HRK': ['HRK'],
  
  // Peruvian Sol
  'S/': ['PEN'],
  'PEN': ['PEN'],
  
  // Uruguayan Peso
  '$U': ['UYU'],
  'UYU': ['UYU'],
  
  // Kazakhstani Tenge
  '₸': ['KZT'],
  'KZT': ['KZT'],
  
  // Armenian Dram
  '֏': ['AMD'],
  'AMD': ['AMD'],
  
  // Georgian Lari
  '₾': ['GEL'],
  'GEL': ['GEL'],
  
  // Azerbaijani Manat
  '₼': ['AZN'],
  'AZN': ['AZN'],
  
  // Uzbekistani Som
  'UZS': ['UZS'],
  
  // Mongolian Tugrik
  '₮': ['MNT'],
  'MNT': ['MNT'],
  
  // Cambodian Riel
  '៛': ['KHR'],
  'KHR': ['KHR'],
  
  // Lao Kip
  '₭': ['LAK'],
  'LAK': ['LAK'],
  
  // Myanmar Kyat
  'K': ['MMK'],
  'MMK': ['MMK'],
  
  // Nepalese Rupee
  'NPR': ['NPR'],
  
  // Afghan Afghani
  '؋': ['AFN'],
  'AFN': ['AFN'],
  
  // Iranian Rial
  '﷼': ['IRR'],
  'IRR': ['IRR'],
  
  // Iraqi Dinar
  'IQD': ['IQD'],
  
  // Kuwaiti Dinar
  'KD': ['KWD'],
  'KWD': ['KWD'],
  
  // Bahraini Dinar
  'BD': ['BHD'],
  'BHD': ['BHD'],
  
  // Omani Rial
  'OMR': ['OMR'],
  
  // Qatari Riyal
  'QR': ['QAR'],
  'QAR': ['QAR'],
  
  // Jordanian Dinar
  'JOD': ['JOD'],
  
  // Lebanese Pound
  'LL': ['LBP'],
  'LBP': ['LBP'],
  
  // Syrian Pound
  'SYP': ['SYP'],
  
  // Tunisian Dinar
  'TND': ['TND'],
  
  // Moroccan Dirham
  'MAD': ['MAD'],
  
  // Algerian Dinar
  'DZD': ['DZD'],
  
  // Libyan Dinar
  'LYD': ['LYD'],
  
  // Mauritanian Ouguiya
  'MRU': ['MRU'],
  
  // Ethiopian Birr
  'ETB': ['ETB'],
  
  // Tanzanian Shilling
  'TSh': ['TZS'],
  'TZS': ['TZS'],
  
  // Ugandan Shilling
  'USh': ['UGX'],
  'UGX': ['UGX'],
  
  // Rwandan Franc
  'RWF': ['RWF'],
  
  // Burundian Franc
  'BIF': ['BIF'],
  
  // Ghanaian Cedi
  'GH₵': ['GHS'],
  'GHS': ['GHS'],
  
  // Zambian Kwacha
  'ZMW': ['ZMW'],
  
  // Botswana Pula
  'P': ['BWP'],
  'BWP': ['BWP'],
  
  // Namibian Dollar
  'N$': ['NAD'],
  'NAD': ['NAD'],
  
  // Mauritian Rupee
  'MUR': ['MUR'],
  
  // Seychellois Rupee
  'SCR': ['SCR'],
  
  // Malagasy Ariary
  'MGA': ['MGA'],
  
  // Comorian Franc
  'KMF': ['KMF'],
  
  // Cape Verdean Escudo
  'CVE': ['CVE'],
  
  // West African CFA Franc
  'CFA': ['XOF', 'XAF'],
  'XOF': ['XOF'],
  'XAF': ['XAF'],
  
  // CFP Franc
  'XPF': ['XPF'],
  
  // Fijian Dollar
  'FJ$': ['FJD'],
  'FJD': ['FJD'],
  
  // Papua New Guinean Kina
  'PGK': ['PGK'],
  
  // Samoan Tala
  'WST': ['WST'],
  
  // Tongan Paʻanga
  'TOP': ['TOP'],
};

/**
 * Result of parsing a currency symbol pattern.
 */
export interface SymbolParseResult {
  amount: number;
  currencyCode: string;
  symbol: string;
  raw: string;
}

/**
 * Builds a regex pattern that matches all currency symbols.
 * Escapes special regex characters and sorts by length (longest first) to match greedily.
 */
function buildSymbolRegex(): RegExp {
  const symbols = Object.keys(CURRENCY_SYMBOL_MAP);
  
  // Sort by length (descending) to match longer symbols first (e.g., "US$" before "$")
  const sortedSymbols = symbols.sort((a, b) => b.length - a.length);
  
  // Escape special regex characters
  const escapedSymbols = sortedSymbols.map(s => 
    s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  
  // Create pattern that matches: symbol + number OR number + symbol
  // Supports numbers with separators and decimals
  const symbolPattern = escapedSymbols.join('|');
  // Updated number pattern to properly match all digits
  const numberPattern = '\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d+(?:\\.\\d+)?';
  
  // Match either: symbol before number or number before symbol
  // With optional whitespace between them
  return new RegExp(
    `(?:(?<symbolBefore>${symbolPattern})\\s*(?<amountAfterSymbol>${numberPattern}))|(?:(?<amountBeforeSymbol>${numberPattern})\\s*(?<symbolAfter>${symbolPattern}))`,
    'i' // case-insensitive
  );
}

// Pre-compile the regex for performance
const SYMBOL_PATTERN_REGEX = buildSymbolRegex();

/**
 * Parses a string with a currency symbol and returns the amount and currency code.
 * 
 * @param input - The string containing a currency symbol and amount (e.g., '$100', '50€')
 * @param defaultCurrency - Optional default currency code to use when symbol is ambiguous
 * @returns Parse result with amount, currency code, symbol, and raw match
 * @throws {ValueOverflowError} If the number exceeds Number.MAX_SAFE_INTEGER
 * @throws {Error} If the input format is invalid or symbol is not recognized
 */
export function parseSymbol(input: string, defaultCurrency?: string): SymbolParseResult {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  const trimmed = input.trim();
  const match = SYMBOL_PATTERN_REGEX.exec(trimmed);

  if (!match || !match.groups) {
    throw new Error(`No currency symbol pattern found in: "${input}"`);
  }

  // Determine which pattern matched (symbol before or after)
  const symbol = (match.groups.symbolBefore || match.groups.symbolAfter || '').trim();
  const amountStr = (match.groups.amountAfterSymbol || match.groups.amountBeforeSymbol || '').trim();

  if (!symbol || !amountStr) {
    throw new Error(`Invalid symbol pattern: "${input}"`);
  }

  // Parse the amount (remove commas)
  const normalizedAmount = amountStr.replace(/,/g, '');
  
  // Check for overflow before parsing (compare as strings for very large numbers)
  const numericValue = normalizedAmount.includes('.') 
    ? parseFloat(normalizedAmount) 
    : parseInt(normalizedAmount, 10);
  
  if (isNaN(numericValue)) {
    throw new Error(`Failed to parse amount: "${amountStr}"`);
  }

  // Check for overflow
  if (numericValue > Number.MAX_SAFE_INTEGER) {
    throw new ValueOverflowError(
      `Amount ${numericValue} exceeds maximum safe integer (${Number.MAX_SAFE_INTEGER})`
    );
  }
  
  const amount = numericValue;

  // Map symbol to currency code(s)
  // Try exact match first, then uppercase, then lowercase
  const possibleCurrencies = CURRENCY_SYMBOL_MAP[symbol] 
    || CURRENCY_SYMBOL_MAP[symbol.toUpperCase()]
    || CURRENCY_SYMBOL_MAP[symbol.toLowerCase()];

  if (!possibleCurrencies || possibleCurrencies.length === 0) {
    throw new Error(`Unknown currency symbol: "${symbol}"`);
  }

  // If multiple currencies share the same symbol, use defaultCurrency if it matches
  let currencyCode: string;
  if (possibleCurrencies.length === 1) {
    currencyCode = possibleCurrencies[0];
  } else if (defaultCurrency && possibleCurrencies.includes(defaultCurrency.toUpperCase())) {
    currencyCode = defaultCurrency.toUpperCase();
  } else {
    // Default to the first currency in the list (usually the most common)
    currencyCode = possibleCurrencies[0];
  }

  // Validate that the currency code exists in our currency data
  const currencyInfo = getCurrencyByCode(currencyCode);
  if (!currencyInfo) {
    throw new Error(`Currency code ${currencyCode} not found in currency database`);
  }

  return {
    amount,
    currencyCode,
    symbol,
    raw: match[0],
  };
}

/**
 * Attempts to match and parse a currency symbol pattern from a string.
 * Returns null if no valid pattern is found.
 * 
 * @param input - The string to search for a currency symbol pattern
 * @param defaultCurrency - Optional default currency code for ambiguous symbols
 * @returns Parse result or null if not found
 */
export function matchSymbol(input: string, defaultCurrency?: string): SymbolParseResult | null {
  try {
    return parseSymbol(input, defaultCurrency);
  } catch {
    return null;
  }
}
