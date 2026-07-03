export interface OpenApiSchema {
  type?: string;
  format?: string;
  pattern?: string;
  enum?: unknown[];
  items?: OpenApiSchema;
  properties?: Record<string, OpenApiSchema>;
  required?: string[];
  additionalProperties?: boolean | OpenApiSchema;
  nullable?: boolean;
  description?: string;
  $ref?: string;
  [key: string]: unknown;
}

export interface OpenApiParameter {
  name: string;
  in: "path" | "query";
  required: boolean;
  schema: OpenApiSchema;
  description?: string;
}

export interface OpenApiMediaTypeObject {
  schema: OpenApiSchema;
}

export interface OpenApiRequestBody {
  required?: boolean;
  content: Record<string, OpenApiMediaTypeObject>;
}

export interface OpenApiResponse {
  description: string;
  content?: Record<string, OpenApiMediaTypeObject>;
}

export interface OpenApiOperation {
  summary: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: Record<string, OpenApiResponse>;
}

export interface OpenApiPathItem {
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  delete?: OpenApiOperation;
}

export interface OpenApiDocument {
  openapi: "3.0.3";
  info: { title: string; version: string; description?: string };
  paths: Record<string, OpenApiPathItem>;
  components: {
    schemas: Record<string, OpenApiSchema>;
  };
}
