/**
 * Intelligent Test Data Factory
 * Generates realistic, privacy-compliant, contextual test data with AI
 */

import { randomBytes } from "crypto";

type DataType =
  | "email"
  | "name"
  | "phone"
  | "address"
  | "company"
  | "url"
  | "uuid"
  | "date"
  | "number"
  | "boolean"
  | "text"
  | "slug"
  | "password";

interface DataTemplate {
  [key: string]: DataType | DataTemplate | Array<DataType | DataTemplate>;
}

interface GeneratorOptions {
  unique?: boolean;
  locale?: "en" | "es" | "fr" | "de";
  seed?: number;
  count?: number;
}

export class TestDataFactory {
  private usedValues = new Map<string, Set<string>>();
  private seededRandom: number = Date.now();

  /**
   * Generates realistic test data from template
   */
  generate<T = any>(template: DataTemplate, options: GeneratorOptions = {}): T {
    const { unique = true, count = 1, seed } = options;
    if (seed) this.seededRandom = seed;

    const results = Array.from({ length: count }, () => this.generateObject(template, unique));
    return (count === 1 ? results[0] : results) as T;
  }

  /**
   * Generates batch of test users
   */
  generateUsers(count: number = 10): Array<{
    email: string;
    name: string;
    password: string;
    phone: string;
    role: string;
  }> {
    return this.generate(
      {
        email: "email",
        name: "name",
        password: "password",
        phone: "phone",
        role: "text",
      },
      { count },
    );
  }

  /**
   * Generates test organization data
   */
  generateOrganization(): {
    name: string;
    subdomain: string;
    email: string;
    phone: string;
    address: string;
  } {
    return this.generate({
      name: "company",
      subdomain: "slug",
      email: "email",
      phone: "phone",
      address: "address",
    });
  }

  /**
   * Generates contextual API payloads
   */
  generatePayload(schema: any): any {
    // Analyze Zod schema and generate matching data
    if (!schema) return {};

    const payload: any = {};
    const schemaStr = schema.toString();

    // Extract field names and types from schema string
    const fieldPattern = /(\w+):\s*z\.(\w+)/g;
    let match;

    while ((match = fieldPattern.exec(schemaStr)) !== null) {
      const [, fieldName, zodType] = match;
      payload[fieldName] = this.generateForZodType(zodType, fieldName);
    }

    return payload;
  }

  /**
   * Generates sequential test data for ordering
   */
  generateSequence(type: DataType, count: number, prefix: string = ""): string[] {
    return Array.from({ length: count }, (_, i) => {
      const base = this.generateSingle(type);
      return `${prefix}${i + 1}-${base}`;
    });
  }

  /**
   * Generates data that violates constraints (for negative testing)
   */
  generateInvalid(type: DataType): any {
    const invalidMap: Record<DataType, any> = {
      email: "not-an-email",
      name: "",
      phone: "123",
      address: null,
      company: 12345,
      url: "not a url",
      uuid: "invalid-uuid",
      date: "not-a-date",
      number: "not-a-number",
      boolean: "maybe",
      text: null,
      slug: "Invalid Slug With Spaces!",
      password: "weak",
    };

    return invalidMap[type];
  }

  /**
   * Generates realistic edge cases
   */
  generateEdgeCase(type: DataType): any {
    const edgeMap: Record<DataType, any> = {
      email: `very.long.email.address.with.many.dots@subdomain.example.com`,
      name: `María José O'Brien-González`, // International characters
      phone: "+1-234-567-8900 ext. 1234",
      address: `Apt 42B, 1234 Super Long Street Name Avenue, Building 5`,
      company: `International Corporation & Associates, LLC`,
      url: `https://subdomain.example.co.uk/path/to/resource?query=value#fragment`,
      uuid: `00000000-0000-0000-0000-000000000000`,
      date: new Date("1900-01-01").toISOString(),
      number: Number.MAX_SAFE_INTEGER,
      boolean: true,
      text: `Text with special chars: @#$%^&*()_+-=[]{}|;':",./<>?`,
      slug: `this-is-a-very-long-slug-that-might-exceed-typical-length-limits-in-some-systems`,
      password: `P@ssw0rd!WithN0mb3rs&Symb0ls`,
    };

    return edgeMap[type];
  }

  private generateObject(template: DataTemplate, unique: boolean): any {
    const obj: any = {};

    for (const [key, value] of Object.entries(template)) {
      if (typeof value === "string") {
        obj[key] = this.generateSingle(value as DataType, unique ? key : undefined);
      } else if (Array.isArray(value)) {
        obj[key] = value.map((item) =>
          typeof item === "string"
            ? this.generateSingle(item as DataType)
            : this.generateObject(item as DataTemplate, unique),
        );
      } else {
        obj[key] = this.generateObject(value as DataTemplate, unique);
      }
    }

    return obj;
  }

  private generateSingle(type: DataType, uniqueKey?: string): any {
    let value: any;

    switch (type) {
      case "email":
        value = this.generateEmail();
        break;
      case "name":
        value = this.generateName();
        break;
      case "phone":
        value = this.generatePhone();
        break;
      case "address":
        value = this.generateAddress();
        break;
      case "company":
        value = this.generateCompany();
        break;
      case "url":
        value = this.generateUrl();
        break;
      case "uuid":
        value = this.generateUuid();
        break;
      case "date":
        value = this.generateDate();
        break;
      case "number":
        value = this.generateNumber();
        break;
      case "boolean":
        value = this.generateBoolean();
        break;
      case "text":
        value = this.generateText();
        break;
      case "slug":
        value = this.generateSlug();
        break;
      case "password":
        value = this.generatePassword();
        break;
      default:
        value = "unknown";
    }

    // Ensure uniqueness
    if (uniqueKey) {
      value = this.ensureUnique(uniqueKey, value, type);
    }

    return value;
  }

  private ensureUnique(key: string, value: string, type: DataType): string {
    if (!this.usedValues.has(key)) {
      this.usedValues.set(key, new Set());
    }

    const used = this.usedValues.get(key)!;
    let uniqueValue = value;
    let attempts = 0;

    while (used.has(uniqueValue) && attempts < 100) {
      uniqueValue = `${value}-${this.random(1000, 9999)}`;
      attempts++;
    }

    used.add(uniqueValue);
    return uniqueValue;
  }

  private generateEmail(): string {
    const names = ["john", "jane", "alex", "sarah", "mike", "emma", "david", "lisa"];
    const domains = ["test.com", "example.org", "demo.io", "sample.net"];
    return `${this.pick(names)}.${this.random(1000, 9999)}@${this.pick(domains)}`;
  }

  private generateName(): string {
    const first = ["John", "Jane", "Alex", "Sarah", "Mike", "Emma", "David", "Lisa"];
    const last = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Davis"];
    return `${this.pick(first)} ${this.pick(last)}`;
  }

  private generatePhone(): string {
    return `+1-${this.random(200, 999)}-${this.random(200, 999)}-${this.random(1000, 9999)}`;
  }

  private generateAddress(): string {
    const streets = ["Main St", "Oak Ave", "Maple Dr", "Pine Rd", "Elm Blvd"];
    return `${this.random(100, 9999)} ${this.pick(streets)}`;
  }

  private generateCompany(): string {
    const prefixes = ["Tech", "Data", "Cloud", "Smart", "Global", "Innov"];
    const suffixes = ["Systems", "Solutions", "Corp", "Inc", "Labs", "Works"];
    return `${this.pick(prefixes)}${this.pick(suffixes)}`;
  }

  private generateUrl(): string {
    return `https://example-${this.random(1000, 9999)}.com/path`;
  }

  private generateUuid(): string {
    return randomBytes(16).toString("hex").replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  }

  private generateDate(): string {
    const now = Date.now();
    const randomTime = now - this.random(0, 365 * 24 * 60 * 60 * 1000);
    return new Date(randomTime).toISOString();
  }

  private generateNumber(): number {
    return this.random(1, 10000);
  }

  private generateBoolean(): boolean {
    return Math.random() > 0.5;
  }

  private generateText(): string {
    const words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur"];
    return Array.from({ length: this.random(3, 8) }, () => this.pick(words)).join(" ");
  }

  private generateSlug(): string {
    const words = ["test", "demo", "sample", "example", "data"];
    return `${this.pick(words)}-${this.pick(words)}-${this.random(1000, 9999)}`;
  }

  private generatePassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  }

  private generateForZodType(zodType: string, fieldName: string): any {
    const typeMap: Record<string, DataType> = {
      string: "text",
      number: "number",
      boolean: "boolean",
      date: "date",
      email: "email",
      url: "url",
      uuid: "uuid",
    };

    // Infer type from field name
    if (fieldName.includes("email")) return this.generateEmail();
    if (fieldName.includes("name")) return this.generateName();
    if (fieldName.includes("phone")) return this.generatePhone();
    if (fieldName.includes("url")) return this.generateUrl();
    if (fieldName.includes("slug")) return this.generateSlug();
    if (fieldName.includes("password")) return this.generatePassword();

    return this.generateSingle(typeMap[zodType] || "text");
  }

  private random(min: number, max: number): number {
    this.seededRandom = (this.seededRandom * 9301 + 49297) % 233280;
    return min + (this.seededRandom % (max - min + 1));
  }

  private pick<T>(array: T[]): T {
    return array[this.random(0, array.length - 1)];
  }
}

export const testDataFactory = new TestDataFactory();
