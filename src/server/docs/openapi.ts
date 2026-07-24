import { z } from "zod";
import { userInputSchema } from "@/server/controllers/user.controller";
import { userTypeInputSchema } from "@/server/controllers/user-type.controller";
import { userGroupInputSchema } from "@/server/controllers/user-group.controller";
import { OpenApiDocument, OpenApiResponse, OpenApiSchema } from "./openapi-types";

const userInputJsonSchema = z.toJSONSchema(userInputSchema, {
  target: "openapi-3.0",
}) as OpenApiSchema;

const userTypeInputJsonSchema = z.toJSONSchema(userTypeInputSchema, {
  target: "openapi-3.0",
}) as OpenApiSchema;

const userGroupInputJsonSchema = z.toJSONSchema(userGroupInputSchema, {
  target: "openapi-3.0",
}) as OpenApiSchema;

const userSchema: OpenApiSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    ...userInputJsonSchema.properties,
    status: { type: "integer", enum: [1, 2] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    createdBy: { type: "string" },
    updatedBy: { type: "string" },
  },
  required: [
    "id",
    ...(userInputJsonSchema.required ?? []),
    "status",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ],
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

const userGroupSchema: OpenApiSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    ...userGroupInputJsonSchema.properties,
    status: { type: "integer", enum: [1, 2] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
    createdBy: { type: "string" },
    updatedBy: { type: "string" },
  },
  required: [
    "id",
    ...(userGroupInputJsonSchema.required ?? []),
    "status",
    "createdAt",
    "updatedAt",
    "createdBy",
    "updatedBy",
  ],
  additionalProperties: false,
};

const userGroupMemberSchema: OpenApiSchema = {
  type: "object",
  properties: {
    userId: { type: "string" },
    groupId: { type: "integer" },
    createdAt: { type: "string", format: "date-time" },
    createdBy: { type: "string" },
  },
  required: ["userId", "groupId", "createdAt"],
  additionalProperties: false,
};

const addUserGroupMemberInputSchema: OpenApiSchema = {
  type: "object",
  properties: {
    userId: { type: "string" },
  },
  required: ["userId"],
  additionalProperties: false,
};

const paginatedUsersSchema: OpenApiSchema = {
  type: "object",
  properties: {
    items: { type: "array", items: { $ref: "#/components/schemas/User" } },
    page: { type: "integer" },
    pageSize: { type: "integer" },
    total: { type: "integer" },
  },
  required: ["items", "page", "pageSize", "total"],
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

const userGroupIdParameter = {
  name: "id",
  in: "path" as const,
  required: true,
  schema: { type: "integer" },
};

const groupMemberUserIdParameter = {
  name: "userId",
  in: "path" as const,
  required: true,
  schema: { type: "string" },
};

const pageParameter = {
  name: "page",
  in: "query" as const,
  required: false,
  schema: { type: "integer", default: 1 },
};

const pageSizeParameter = {
  name: "pageSize",
  in: "query" as const,
  required: false,
  schema: { type: "integer", default: 10 },
};

const sortOrderParameter = {
  name: "sortOrder",
  in: "query" as const,
  required: false,
  schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
};

const sortByParameter = {
  name: "sortBy",
  in: "query" as const,
  required: false,
  schema: {
    type: "string",
    enum: [
      "firstName",
      "lastName",
      "email",
      "userType",
      "createdAt",
      "updatedAt",
      "createdBy",
      "updatedBy",
    ],
    default: "lastName",
  },
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
            "400": errorResponse("Validation failed, including a name over 20 characters"),
            "409": errorResponse("Name is already in use"),
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
            "400": errorResponse("Validation failed, including a name over 20 characters"),
            "404": errorResponse("User type not found"),
            "409": errorResponse("Name is already in use"),
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
      "/api/v1/user-groups": {
        get: {
          summary: "List user groups",
          tags: ["UserGroups"],
          responses: {
            "200": jsonResponse(
              "List of user groups",
              dataListEnvelope("#/components/schemas/UserGroup"),
            ),
          },
        },
        post: {
          summary: "Create a user group",
          tags: ["UserGroups"],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UserGroupInput" } },
            },
          },
          responses: {
            "201": jsonResponse(
              "User group created",
              dataEnvelope({ $ref: "#/components/schemas/UserGroup" }),
            ),
            "400": errorResponse("Validation failed, including a name over 20 characters"),
            "409": errorResponse("Name is already in use"),
          },
        },
      },
      "/api/v1/user-groups/{id}": {
        get: {
          summary: "Get a user group by id",
          tags: ["UserGroups"],
          parameters: [userGroupIdParameter],
          responses: {
            "200": jsonResponse(
              "User group found",
              dataEnvelope({ $ref: "#/components/schemas/UserGroup" }),
            ),
            "404": errorResponse("User group not found"),
          },
        },
        put: {
          summary: "Replace a user group",
          tags: ["UserGroups"],
          parameters: [userGroupIdParameter],
          requestBody: {
            required: true,
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UserGroupInput" } },
            },
          },
          responses: {
            "200": jsonResponse(
              "User group updated",
              dataEnvelope({ $ref: "#/components/schemas/UserGroup" }),
            ),
            "400": errorResponse("Validation failed, including a name over 20 characters"),
            "404": errorResponse("User group not found"),
            "409": errorResponse("Name is already in use"),
          },
        },
        delete: {
          summary: "Delete a user group",
          tags: ["UserGroups"],
          parameters: [userGroupIdParameter],
          responses: {
            "200": jsonResponse("User group deleted", nullDataEnvelope),
            "404": errorResponse("User group not found"),
            "409": errorResponse("User group is referenced by one or more members"),
          },
        },
      },
      "/api/v1/user-groups/{id}/members": {
        get: {
          summary: "List members of a user group",
          tags: ["UserGroups"],
          parameters: [userGroupIdParameter],
          responses: {
            "200": jsonResponse(
              "List of group members",
              dataListEnvelope("#/components/schemas/UserGroupMember"),
            ),
            "404": errorResponse("User group not found"),
          },
        },
        post: {
          summary: "Add a user to a user group",
          tags: ["UserGroups"],
          parameters: [userGroupIdParameter],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AddUserGroupMemberInput" },
              },
            },
          },
          responses: {
            "201": jsonResponse(
              "User added to group",
              dataEnvelope({ $ref: "#/components/schemas/UserGroupMember" }),
            ),
            "404": errorResponse("User group or user not found"),
            "409": errorResponse("User is already in this group"),
          },
        },
      },
      "/api/v1/user-groups/{id}/members/{userId}": {
        delete: {
          summary: "Remove a user from a user group",
          tags: ["UserGroups"],
          parameters: [userGroupIdParameter, groupMemberUserIdParameter],
          responses: {
            "200": jsonResponse("User removed from group", nullDataEnvelope),
            "404": errorResponse("User group, user, or membership not found"),
          },
        },
      },
      "/api/v1/users": {
        get: {
          summary: "List users",
          tags: ["Users"],
          parameters: [pageParameter, pageSizeParameter, sortByParameter, sortOrderParameter],
          responses: {
            "200": jsonResponse(
              "Paginated list of users",
              dataEnvelope({ $ref: "#/components/schemas/PaginatedUsers" }),
            ),
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
        PaginatedUsers: paginatedUsersSchema,
        UserTypeInput: userTypeInputJsonSchema,
        UserType: userTypeSchema,
        UserGroupInput: userGroupInputJsonSchema,
        UserGroup: userGroupSchema,
        UserGroupMember: userGroupMemberSchema,
        AddUserGroupMemberInput: addUserGroupMemberInputSchema,
        ApiFieldError: apiFieldErrorSchema,
        ErrorEnvelope: errorEnvelopeSchema,
        HealthStatus: healthStatusSchema,
      },
    },
  };
}
