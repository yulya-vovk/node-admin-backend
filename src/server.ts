import express from 'express';
import dotenv from 'dotenv';

import servicesRouter from './routes/services';
import galleryRouter from './routes/gallery';
import docsRouter from './routes/docs';
import contactsRouter from './routes/contacts';

import { corsMiddleware } from './middleware/cors';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Options as SwaggerOptions } from 'swagger-jsdoc';

dotenv.config();

const app = express();
console.log('DB Connection String:', process.env.DATABASE_URL);

app.use(corsMiddleware);
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.send(`
    <h1>Админка API</h1>
    <p>Сервер запущен. Доступные эндпоинты:</p>
    <ul>
      <li><a href="/services">GET /services</a></li>
      <li><a href="/gallery">GET /gallery</a></li>
      <li><a href="/docs">GET /docs</a></li>
      <li><a href="/contacts">GET /contacts</a></li>
    </ul>
    <p>Документация: <a href="/swagger">Swagger UI</a></p>
  `);
});

const swaggerOptions: SwaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Админка API',
      version: '1.0.0',
      description: 'REST API для административной панели базы отдыха',
      tags: [
        {
          name: 'Services',
          description: 'Управление услугами (SPA, массаж и др.)'
        },
        {
          name: 'Contacts',
          description: 'Управление контактной информацией'
        },
        {
          name: 'Docs',
          description: 'Управление документами'
        },
        {
          name: 'Gallery',
          description: 'Управление галерей'
        }
      ]
    },

    servers: [
      {
        url: 'http://localhost:8080',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Contacts: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            website: { type: 'string' },
            work_schedule: { type: 'string' },
            social_media_vk: { type: 'string' },
            social_media_ya: { type: 'string' },
            social_media_two_gis: { type: 'string' }
          }
        },
        ContactsInput: {
          type: 'object',
          required: ['address', 'phone', 'email'],
          properties: {
            address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            website: { type: 'string' },
            work_schedule: { type: 'string' },
            social_media_vk: { type: 'string' },
            social_media_ya: { type: 'string' },
            social_media_two_gis: { type: 'string' }
          }
        },
        Gallery: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            hidden: { type: 'boolean' }
          }
        },
        Docs: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            file: { type: 'string' }
          }
        },
        Service: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            eng: { type: 'string' },
            title: { type: 'string' },
            src: { type: 'string' },
            prices: { type: 'string' },
            text: { type: 'string' }
          }
        },
        ServiceInput: {
          type: 'object',
          required: ['eng', 'title', 'src', 'prices', 'text'],
          properties: {
            eng: { type: 'string' },
            title: { type: 'string' },
            src: { type: 'string' },
            prices: { type: 'string' },
            text: { type: 'string' }
          }
        }
      }
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/services', servicesRouter);
app.use('/gallery', galleryRouter);
app.use('/docs', docsRouter);
app.use('/contacts', contactsRouter);

async function startServer() {
  try {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
      console.log(`Swagger UI доступен: http://localhost:${PORT}/swagger`);
    });
  } catch (err) {
    console.error('Не удалось запустить сервер:', err);
    process.exit(1);
  }
}

startServer();