import { isValidUUID } from "../../../../src/shared/utils/uuid-validator";

describe("UUID Validator", () => {
  describe("isValidUUID", () => {
    it("should accept valid UUID v1", () => {
      expect(isValidUUID("550e8400-e29b-11d4-a716-446655440000")).toBe(true);
    });

    it("should accept valid UUID v4", () => {
      expect(isValidUUID("123e4567-e89b-42d3-a456-426614174000")).toBe(true);
    });

    it("should accept UUID with uppercase letters", () => {
      expect(isValidUUID("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
    });

    it("should accept UUID with mixed case", () => {
      expect(isValidUUID("550e8400-E29B-41d4-A716-446655440000")).toBe(true);
    });

    it("should reject UUID without hyphens", () => {
      expect(isValidUUID("550e8400e29b41d4a716446655440000")).toBe(false);
    });

    it("should reject UUID with incorrect hyphen positions", () => {
      expect(isValidUUID("550e8400-e29b41-d4a7-16446655440000")).toBe(false);
    });

    it("should reject string that is too short", () => {
      expect(isValidUUID("550e8400-e29b-41d4-a716")).toBe(false);
    });

    it("should reject string that is too long", () => {
      expect(isValidUUID("550e8400-e29b-41d4-a716-446655440000-extra")).toBe(false);
    });

    it("should reject string with invalid characters", () => {
      expect(isValidUUID("550e8400-e29b-41d4-a716-44665544000g")).toBe(false);
    });

    it("should reject empty string", () => {
      expect(isValidUUID("")).toBe(false);
    });

    it("should reject non-UUID strings", () => {
      expect(isValidUUID("not-a-uuid")).toBe(false);
      expect(isValidUUID("12345678-1234-1234-1234-123456789012")).toBe(false);
    });

    it("should reject UUID with invalid version digit", () => {
      expect(isValidUUID("550e8400-e29b-61d4-a716-446655440000")).toBe(false);
    });

    it("should reject UUID with invalid variant digit", () => {
      expect(isValidUUID("550e8400-e29b-41d4-f716-446655440000")).toBe(false);
    });
  });
});
