export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  KWD = "KWD",
}

export interface CurrencyInfo {
  code: Currency;
  decimals: number;
  name: string;
}

export const SUPPORTED_CURRENCIES: Record<Currency, CurrencyInfo> = {
  [Currency.USD]: { code: Currency.USD, decimals: 2, name: "US Dollar" },
  [Currency.EUR]: { code: Currency.EUR, decimals: 2, name: "Euro" },
  [Currency.GBP]: { code: Currency.GBP, decimals: 2, name: "British Pound" },
  [Currency.JPY]: { code: Currency.JPY, decimals: 0, name: "Japanese Yen" },
  [Currency.KWD]: { code: Currency.KWD, decimals: 3, name: "Kuwaiti Dinar" },
};

export const DEFAULT_CURRENCY = Currency.USD;

export function isSupportedCurrency(currency: string): boolean {
  return currency in SUPPORTED_CURRENCIES;
}

export function getCurrencyDecimals(currency: Currency | string): number {
  return SUPPORTED_CURRENCIES[currency as Currency]?.decimals ?? 2;
}

export function toMinorUnits(amount: number, currency: Currency): number {
  const decimals = getCurrencyDecimals(currency);
  return Math.round(amount * Math.pow(10, decimals));
}

export function toMajorUnits(amount: number, currency: Currency): number {
  const decimals = getCurrencyDecimals(currency);
  const major = amount / Math.pow(10, decimals);
  return Number(major.toFixed(decimals));
}
