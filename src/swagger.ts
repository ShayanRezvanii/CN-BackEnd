import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import YAML from "yamljs";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CN Backend API",
      version: "1.0.0",
      description: "API docs for CN project",
    },
    servers: [
      {
        url: "http://localhost:4000", // 🔥 سرور لوکال
      },
    ],
  },
  apis: ["./src/routes/**/*.ts"], // مسیر فایل‌هایی که کامنت Swagger دارن
};

export const swaggerSpec = swaggerJSDoc(options);
const swaggerDocument = YAML.load("./src/swagger.yaml");

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
