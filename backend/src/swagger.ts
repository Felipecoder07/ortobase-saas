import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bot Clínica Odontológica API',
      version: '1.0.0',
      description: 'API do SaaS para Clínicas Odontológicas (Módulo 1 - Fundação Técnica)',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
