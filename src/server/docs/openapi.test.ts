import { describe, expect, it } from "vitest";
import { buildOpenApiDocument } from "./openapi";

describe("buildOpenApiDocument", () => {
  it("documents all five route files with correct methods", () => {
    const doc = buildOpenApiDocument();

    expect(Object.keys(doc.paths["/api/v1/users"]!)).toEqual(
      expect.arrayContaining(["get", "post"]),
    );
    expect(Object.keys(doc.paths["/api/v1/users/{id}"]!)).toEqual(
      expect.arrayContaining(["get", "put", "delete"]),
    );
    expect(Object.keys(doc.paths["/api/v1/user-types"]!)).toEqual(
      expect.arrayContaining(["get", "post"]),
    );
    expect(Object.keys(doc.paths["/api/v1/user-types/{id}"]!)).toEqual(
      expect.arrayContaining(["get", "put", "delete"]),
    );
    expect(doc.paths["/api/v1/health"]?.get).toBeDefined();
  });

  it("derives UserTypeInput schema from the real Zod schema", () => {
    const doc = buildOpenApiDocument();
    expect(doc.components.schemas.UserTypeInput?.required).toContain("name");
  });

  it("derives UserInput schema with correct required/optional split", () => {
    const doc = buildOpenApiDocument();
    const schema = doc.components.schemas.UserInput!;

    expect(schema.required).toEqual(
      expect.arrayContaining(["firstName", "lastName", "dob", "address", "email", "typeId"]),
    );
    expect(schema.required).not.toContain("middleName");
  });

  it("documents the health endpoint's unwrapped response shape", () => {
    const doc = buildOpenApiDocument();
    const okResponseSchema =
      doc.paths["/api/v1/health"]!.get!.responses["200"]!.content!["application/json"]!.schema;

    expect(okResponseSchema.properties).toHaveProperty("status");
    expect(okResponseSchema.properties).not.toHaveProperty("data");
  });

  it("documents the deleteUserType 409 without field-level detail", () => {
    const doc = buildOpenApiDocument();
    expect(doc.paths["/api/v1/user-types/{id}"]!.delete!.responses["409"]).toBeDefined();
  });

  it("documents the duplicate-email 409 for user create and update", () => {
    const doc = buildOpenApiDocument();
    expect(doc.paths["/api/v1/users"]!.post!.responses["409"]).toBeDefined();
    expect(doc.paths["/api/v1/users/{id}"]!.put!.responses["409"]).toBeDefined();
  });

  it("documents the duplicate-name 409 for user-type create and update", () => {
    const doc = buildOpenApiDocument();
    expect(doc.paths["/api/v1/user-types"]!.post!.responses["409"]).toBeDefined();
    expect(doc.paths["/api/v1/user-types/{id}"]!.put!.responses["409"]).toBeDefined();
  });

  it("derives the 20-character max length constraint on UserTypeInput.name", () => {
    const doc = buildOpenApiDocument();
    const nameSchema = doc.components.schemas.UserTypeInput?.properties?.name;
    expect(nameSchema).toMatchObject({ maxLength: 20, minLength: 1 });
  });
});
