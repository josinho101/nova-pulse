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
    expect(Object.keys(doc.paths["/api/v1/user-groups"]!)).toEqual(
      expect.arrayContaining(["get", "post"]),
    );
    expect(Object.keys(doc.paths["/api/v1/user-groups/{id}"]!)).toEqual(
      expect.arrayContaining(["get", "put", "delete"]),
    );
    expect(Object.keys(doc.paths["/api/v1/user-groups/{id}/members"]!)).toEqual(
      expect.arrayContaining(["get", "post"]),
    );
    expect(Object.keys(doc.paths["/api/v1/user-groups/{id}/members/{userId}"]!)).toEqual(
      expect.arrayContaining(["delete"]),
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
      expect.arrayContaining(["firstName", "lastName", "typeId"]),
    );
    expect(schema.required).not.toContain("middleName");
    expect(schema.required).not.toContain("address");
    expect(schema.required).not.toContain("phone");
    expect(schema.required).not.toContain("dob");
    expect(schema.required).not.toContain("email");
  });

  it("documents status/audit fields on the User schema", () => {
    const doc = buildOpenApiDocument();
    const schema = doc.components.schemas.User!;

    expect(schema.required).toEqual(
      expect.arrayContaining(["status", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
    );
  });

  it("documents pagination query parameters on the users list endpoint", () => {
    const doc = buildOpenApiDocument();
    const params = doc.paths["/api/v1/users"]!.get!.parameters!;

    expect(params.map((param) => param.name)).toEqual(
      expect.arrayContaining(["page", "pageSize", "sortBy", "sortOrder"]),
    );
  });

  it("documents the PaginatedUsers response schema on the users list endpoint", () => {
    const doc = buildOpenApiDocument();
    const schema = doc.components.schemas.PaginatedUsers!;

    expect(schema.required).toEqual(
      expect.arrayContaining(["items", "page", "pageSize", "total"]),
    );
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

  it("derives UserGroupInput schema from the real Zod schema", () => {
    const doc = buildOpenApiDocument();
    expect(doc.components.schemas.UserGroupInput?.required).toContain("name");
  });

  it("derives the 20-character max length constraint on UserGroupInput.name", () => {
    const doc = buildOpenApiDocument();
    const nameSchema = doc.components.schemas.UserGroupInput?.properties?.name;
    expect(nameSchema).toMatchObject({ maxLength: 20, minLength: 1 });
  });

  it("documents status/audit fields on the UserGroup schema", () => {
    const doc = buildOpenApiDocument();
    const schema = doc.components.schemas.UserGroup!;

    expect(schema.required).toEqual(
      expect.arrayContaining(["status", "createdAt", "updatedAt", "createdBy", "updatedBy"]),
    );
  });

  it("documents the duplicate-name 409 for user-group create and update", () => {
    const doc = buildOpenApiDocument();
    expect(doc.paths["/api/v1/user-groups"]!.post!.responses["409"]).toBeDefined();
    expect(doc.paths["/api/v1/user-groups/{id}"]!.put!.responses["409"]).toBeDefined();
  });

  it("documents the deleteUserGroup 409 for groups referenced by members", () => {
    const doc = buildOpenApiDocument();
    expect(doc.paths["/api/v1/user-groups/{id}"]!.delete!.responses["409"]).toBeDefined();
  });

  it("documents the duplicate-membership 409 on the add-member endpoint", () => {
    const doc = buildOpenApiDocument();
    expect(doc.paths["/api/v1/user-groups/{id}/members"]!.post!.responses["409"]).toBeDefined();
  });
});
