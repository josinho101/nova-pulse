import { z } from "zod";
import { userInputSchema } from "@/server/controllers/user.controller";
import { userTypeInputSchema } from "@/server/controllers/user-type.controller";
import { OpenApiDocument, OpenApiResponse, OpenApiSchema } from "./openapi-types";

const userInputJsonSchema = z.toJSONSchema(userInputSchema, {
  target: "openapi-3.0",
}) as OpenApiSchema;

const userTypeInputJsonSchema = z.toJSONSchema(userTypeInputSchema, {
  target: "openapi-3.0",
}) as OpenApiSchema;

const userSchema: OpenApiSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    ...userInputJsonSchema.properties,
  },
  required: ["id", ...(userInputJsonSchema.required ?? [])],
  additionalProperties: false,
};

const userTypeSchema: OpenApiSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    ...userTypeInputJsonSchema.properties,
    status: { type: "integer", enum: [1, 2] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    createdBy: { type: "string" },
    updatedBy: { type: "string" },
  },
  required: [
    "id",
    ...(userTypeInputJsonSchema.required ?? []),
    "status",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ],
  additionalProperties: false,
};

const apiFieldErrorSchema: OpenApiSchema = {
  type: "object",
  properties: {
    path: { type: "string" },
    message: { type: "string" },
  },
  required: ["path", "message"],
};

const errorEnvelopeSchema: OpenApiSchema = {
  type: "object",
  properties: {
    error: {
      type: "object",
      properties: {
        message: { type: "string" },
        fields: {
          type: "array",
          items: { $ref: "#/components/schemas/ApiFieldError" },
        },
      },
      required: ["message"],
    },
  },
  required: ["error"],
};

const healthStatusSchema: OpenApiSchema = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["ok"] },
    time: { type: "string", format: "date-time" },
  },
  required: ["status", "time"],
};

function dataEnvelope(schema: OpenApiSchema): OpenApiSchema {
  return {
    type: "object",
    properties: { data: schema },
    required: ["data"],
  };
}

function dataListEnvelope(itemsRef: string): OpenApiSchema {
  return dataEnvelope({ type: "array", items: { $ref: itemsRef } });
}

const nullDataEnvelope: OpenApiSchema = dataEnvelope({ type: "null" });

function jsonResponse(description: string, schema: OpenApiSchema): OpenApiResponse {
  return { description, content: { "application/json": { schema } } };
}

const errorResponse = (description: string) => jsonResponse(description, errorEnvelopeSchema);

const idParameter = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "string" },
};

const userTypeIdParameter = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "integer" },
};

export function buildOpenApiDocument(): OpenApiDocument {
  return {
    openapi: "3.0.3",
    info: {
      title: "Nova Pulse API",
      version: "1.0.0",
    },
    paths: {
      "/api/v1/health": {
        get: {
          summary: "Get API health status",
          tags: ["Health"],
          responses: {
            "200": jsonResponse("Health status", healthStatusSchema),
          },
        },
      },
      "/api/v1/user-types": {
        get: {
          summary: "List user types",
          tags: ["UserTypes"],
          responses: {
            "200": jsonResponse(
              "List of user types",
              dataListEnvelope("#/components/schemas/UserType"),
            ),
          },
        },
        post: {
          summary: "Create a user type",
          tags: ["UserTypes"],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UserTypeInput" } },
            },
          },
          responses: {
            "201": jsonResponse(
              "User type created",
              dataEnvelope({ $ref: "#/components/schemas/UserType" }),
            ),
            "400": errorResponse("Validation failed"),
          },
        },
      },
      "/api/v1/user-types/{id}": {
        get: {
          summary: "Get a user type by id",
          tags: ["UserTypes"],
          parameters: [userTypeIdParameter],
          responses: {
            "200": jsonResponse(
              "User type found",
              dataEnvelope({ $ref: "#/components/schemas/UserType" }),
            ),
            "404": errorResponse("User type not found"),
          },
        },
        put: {
          summary: "Replace a user type",
          tags: ["UserTypes"],
          parameters: [userTypeIdParameter],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UserTypeInput" } },
            },
          },
          responses: {
            "200": jsonResponse(
              "User type updated",
              dataEnvelope({ $ref: "#/components/schemas/UserType" }),
            ),
            "400": errorResponse("Validation failed"),
            "404": errorResponse("User type not found"),
          },
        },
        delete: {
          summary: "Delete a user type",
          tags: ["UserTypes"],
          parameters: [userTypeIdParameter],
          responses: {
            "200": jsonResponse("User type deleted", nullDataEnvelope),
            "404": errorResponse("User type not found"),
            "409": errorResponse("User type is referenced by one or more users"),
          },
        },
      },
      "/api/v1/users": {
        get: {
          summary: "List users",
          tags: ["Users"],
          responses: {
            "200": jsonResponse("List of users", dataListEnvelope("#/components/schemas/User")),
          },
        },
        post: {
          summary: "Create a user",
          tags: ["Users"],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UserInput" } },
            },
          },
          responses: {
            "201": jsonResponse(
              "User created",
              dataEnvelope({ $ref: "#/components/schemas/User" }),
            ),
            "400": errorResponse("Validation failed, including a typeId that does not exist"),
            "409": errorResponse("Email is already in use"),
          },
        },
      },
      "/api/v1/users/{id}": {
        get: {
          summary: "Get a user by id",
          tags: ["Users"],
          parameters: [idParameter],
          responses: {
            "200": jsonResponse("User found", dataEnvelope({ $ref: "#/components/schemas/User" })),
            "404": errorResponse("User not found"),
          },
        },
        put: {
          summary: "Replace a user",
          tags: ["Users"],
          parameters: [idParameter],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UserInput" } },
            },
          },
          responses: {
            "200": jsonResponse(
              "User updated",
              dataEnvelope({ $ref: "#/components/schemas/User" }),
            ),
            "400": errorResponse("Validation failed, including a typeId that does not exist"),
            "404": errorResponse("User not found"),
            "409": errorResponse("Email is already in use"),
          },
        },
        delete: {
          summary: "Delete a user",
          tags: ["Users"],
          parameters: [idParameter],
          responses: {
            "200": jsonResponse("User deleted", nullDataEnvelope),
            "404": errorResponse("User not found"),
          },
        },
      },
    },
    components: {
      schemas: {
        UserInput: userInputJsonSchema,
        User: userSchema,
        UserTypeInput: userTypeInputJsonSchema,
        UserType: userTypeSchema,
        ApiFieldError: apiFieldErrorSchema,
        ErrorEnvelope: errorEnvelopeSchema,
        HealthStatus: healthStatusSchema,
      },
    },
  };
}
