import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Flexy Booker API",
      version: "1.0.0",
    },
    servers: [{ url: "/api" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: {
              type: "object",
              properties: {
                userId: { type: "integer" },
                userName: { type: "string" },
                email: { type: "string" },
                authority: { type: "array", items: { type: "string" } },
                avatar: { type: "string" },
              },
            },
          },
        },
        Business: {
          type: "object",
          properties: {
            id: { type: "integer" },
            user_id: { type: "integer" },
            business_name: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
          },
        },
        Service: {
          type: "object",
          properties: {
            id: { type: "integer" },
            business_id: { type: "integer" },
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            schedule: { type: "array", items: { type: "string" } },
            is_active: { type: "boolean" },
            custom_fields: { type: "array", items: { type: "object" } },
            created_at: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["userName", "email", "password"],
                  properties: {
                    userName: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                    address: { type: "string" },
                    phoneNumber: { type: "string" },
                    userType: { type: "string", enum: ["cliente", "empresa"], default: "cliente" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User created", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            500: { description: "Error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Log in",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            500: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Log out",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Logged out", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/businesses/me": {
        get: {
          tags: ["Businesses"],
          summary: "Get authenticated user's business",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Business data", content: { "application/json": { schema: { $ref: "#/components/schemas/Business" } } } },
            404: { description: "Business not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/services": {
        get: {
          tags: ["Services"],
          summary: "List all active services",
          parameters: [
            { in: "query", name: "search", schema: { type: "string" }, description: "Filter by service name" },
          ],
          responses: {
            200: { description: "List of services", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Service" } } } } },
          },
        },
        post: {
          tags: ["Services"],
          summary: "Create a service",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["business_id", "name", "schedule"],
                  properties: {
                    business_id: { type: "integer" },
                    name: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number", minimum: 0 },
                    schedule: { type: "array", items: { type: "string" } },
                    custom_fields: { type: "array", items: { type: "object" } },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Service created", content: { "application/json": { schema: { $ref: "#/components/schemas/Service" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
      "/services/{id}": {
        put: {
          tags: ["Services"],
          summary: "Update a service",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "schedule"],
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    price: { type: "number", minimum: 0 },
                    schedule: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Service updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Service" } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Error", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Services"],
          summary: "Delete a service",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "integer" } },
          ],
          responses: {
            200: { description: "Service deleted", content: { "application/json": { schema: { type: "object", properties: { message: { type: "string" } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
