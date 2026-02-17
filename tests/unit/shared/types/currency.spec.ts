import {
  Currency,
  isSupportedCurrency,
  getCurrencyDecimals,
  toMinorUnits,
  toMajorUnits,
} from "../../../../src/shared/types/currency";

describe("Currency", () => {
  describe("isSupportedCurrency", () => {
    it("should return true for supported currencies", () => {
      expect(isSupportedCurrency("USD")).toBe(true);
      expect(isSupportedCurrency("EUR")).toBe(true);
      expect(isSupportedCurrency("GBP")).toBe(true);
      expect(isSupportedCurrency("JPY")).toBe(true);
      expect(isSupportedCurrency("KWD")).toBe(true);
    });

    it("should return false for unsupported currencies", () => {
      expect(isSupportedCurrency("XYZ")).toBe(false);
      expect(isSupportedCurrency("ABC")).toBe(false);
      expect(isSupportedCurrency("")).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(isSupportedCurrency("usd")).toBe(false);
      expect(isSupportedCurrency("Usd")).toBe(false);
    });
  });

  describe("getCurrencyDecimals", () => {
    it("should return correct decimals for USD", () => {
      expect(getCurrencyDecimals(Currency.USD)).toBe(2);
    });

    it("should return correct decimals for EUR", () => {
      expect(getCurrencyDecimals(Currency.EUR)).toBe(2);
    });

    it("should return correct decimals for GBP", () => {
      expect(getCurrencyDecimals(Currency.GBP)).toBe(2);
    });

    it("should return correct decimals for JPY", () => {
      expect(getCurrencyDecimals(Currency.JPY)).toBe(0);
    });

    it("should return correct decimals for KWD", () => {
      expect(getCurrencyDecimals(Currency.KWD)).toBe(3);
    });

    it("should return default 2 decimals for unsupported currency", () => {
      expect(getCurrencyDecimals("XYZ")).toBe(2);
      expect(getCurrencyDecimals("")).toBe(2);
    });
  });

  describe("toMinorUnits", () => {
    it("should convert USD dollars to cents", () => {
      expect(toMinorUnits(10.50, Currency.USD)).toBe(1050);
      expect(toMinorUnits(0.01, Currency.USD)).toBe(1);
      expect(toMinorUnits(100, Currency.USD)).toBe(10000);
    });

    it("should convert EUR euros to cents", () => {
      expect(toMinorUnits(25.99, Currency.EUR)).toBe(2599);
      expect(toMinorUnits(0.50, Currency.EUR)).toBe(50);
    });

    it("should convert GBP pounds to pence", () => {
      expect(toMinorUnits(15.75, Currency.GBP)).toBe(1575);
    });

    it("should handle JPY with no decimals", () => {
      expect(toMinorUnits(1000, Currency.JPY)).toBe(1000);
      expect(toMinorUnits(500.5, Currency.JPY)).toBe(501);
    });

    it("should convert KWD dinars to fils (3 decimals)", () => {
      expect(toMinorUnits(5.125, Currency.KWD)).toBe(5125);
      expect(toMinorUnits(10.001, Currency.KWD)).toBe(10001);
    });

    it("should handle zero", () => {
      expect(toMinorUnits(0, Currency.USD)).toBe(0);
      expect(toMinorUnits(0, Currency.JPY)).toBe(0);
    });

    it("should round to nearest integer", () => {
      expect(toMinorUnits(10.505, Currency.USD)).toBe(1051);
      expect(toMinorUnits(10.504, Currency.USD)).toBe(1050);
    });
  });

  describe("toMajorUnits", () => {
    it("should convert USD cents to dollars", () => {
      expect(toMajorUnits(1050, Currency.USD)).toBe(10.50);
      expect(toMajorUnits(1, Currency.USD)).toBe(0.01);
      expect(toMajorUnits(10000, Currency.USD)).toBe(100);
    });

    it("should convert EUR cents to euros", () => {
      expect(toMajorUnits(2599, Currency.EUR)).toBe(25.99);
      expect(toMajorUnits(50, Currency.EUR)).toBe(0.50);
    });

    it("should convert GBP pence to pounds", () => {
      expect(toMajorUnits(1575, Currency.GBP)).toBe(15.75);
    });

    it("should handle JPY with no decimals", () => {
      expect(toMajorUnits(1000, Currency.JPY)).toBe(1000);
      expect(toMajorUnits(500, Currency.JPY)).toBe(500);
    });

    it("should convert KWD fils to dinars (3 decimals)", () => {
      expect(toMajorUnits(5125, Currency.KWD)).toBe(5.125);
      expect(toMajorUnits(10001, Currency.KWD)).toBe(10.001);
    });

    it("should handle zero", () => {
      expect(toMajorUnits(0, Currency.USD)).toBe(0);
      expect(toMajorUnits(0, Currency.JPY)).toBe(0);
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain value after round-trip conversion", () => {
      expect(toMinorUnits(toMajorUnits(1050, Currency.USD), Currency.USD)).toBe(1050);
      expect(toMinorUnits(toMajorUnits(2599, Currency.EUR), Currency.EUR)).toBe(2599);
      expect(toMinorUnits(toMajorUnits(1000, Currency.JPY), Currency.JPY)).toBe(1000);
      expect(toMinorUnits(toMajorUnits(5125, Currency.KWD), Currency.KWD)).toBe(5125);
    });
  });
});
