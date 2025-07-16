
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const cors = require('cors');

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

// In-memory capybara store
let capybaras = [];

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Capybara API',
    version: '1.0.0',
    description: 'A simple CRUD API for capybaras',
  },
  servers: [
    {
      url: 'http://localhost:3000',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJSDoc(options);

/**
 * @swagger
 * components:
 *   schemas:
 *     Capybara:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the capybara
 *         name:
 *           type: string
 *           description: The name of the capybara
 *       example:
 *         id: 1
 *         name: Fluffy
 *     CapybaraInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the capybara
 *       example:
 *         name: Fluffy
 */

/**
 * @swagger
 * /capybaras:
 *   get:
 *     summary: Returns the list of all capybaras
 *     tags: [Capybaras]
 *     responses:
 *       200:
 *         description: The list of capybaras
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Capybara'
 */
app.get('/capybaras', (req, res) => {
  res.json(capybaras);
});

/**
 * @swagger
 * /capybaras/{id}:
 *   get:
 *     summary: Get a capybara by id
 *     tags: [Capybaras]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The capybara id
 *     responses:
 *       200:
 *         description: The capybara description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Capybara'
 *       404:
 *         description: Capybara not found
 */
app.get('/capybaras/:id', (req, res) => {
  const capybara = capybaras.find(c => c.id === parseInt(req.params.id));
  if (!capybara) return res.status(404).json({ message: 'Capybara not found' });
  res.json(capybara);
});

/**
 * @swagger
 * /capybaras:
 *   post:
 *     summary: Create a new capybara
 *     tags: [Capybaras]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CapybaraInput'
 *     responses:
 *       201:
 *         description: The capybara was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Capybara'
 *       400:
 *         description: Invalid input
 */
app.post('/capybaras', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const capybara = { id: capybaras.length + 1, name };
  capybaras.push(capybara);
  res.status(201).json(capybara);
});

/**
 * @swagger
 * /capybaras/{id}:
 *   put:
 *     summary: Update a capybara by id
 *     tags: [Capybaras]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The capybara id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Capybara'
 *     responses:
 *       200:
 *         description: The capybara was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Capybara'
 *       404:
 *         description: Capybara not found
 */
app.put('/capybaras/:id', (req, res) => {
  const capybara = capybaras.find(c => c.id === parseInt(req.params.id));
  if (!capybara) return res.status(404).json({ message: 'Capybara not found' });
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  capybara.name = name;
  res.json(capybara);
});

/**
 * @swagger
 * /capybaras/{id}:
 *   delete:
 *     summary: Delete a capybara by id
 *     tags: [Capybaras]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The capybara id
 *     responses:
 *       204:
 *         description: Capybara deleted
 *       404:
 *         description: Capybara not found
 */
app.delete('/capybaras/:id', (req, res) => {
  const index = capybaras.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Capybara not found' });
  capybaras.splice(index, 1);
  res.status(204).send();
});

// Swagger UI route
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Capybara API server running at http://localhost:${port}/`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});
