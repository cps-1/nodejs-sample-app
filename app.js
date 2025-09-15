
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import cors from 'cors';
import { Pool } from 'pg';
import { createClient } from 'redis';

const pool = new Pool({
  host: process.env.POSTGRES_SERVICE_HOST || 'localhost',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: 'capybaradb',
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
});

const app = express();
const port = 3000;
const host = '0.0.0.0';
app.use(cors());
app.use(express.json());

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Capybara API',
    version: '1.0.0',
    description: 'A simple CRUD API for capybaras',
  }
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
app.get('/capybaras', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM capybara ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
app.get('/capybaras/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM capybara WHERE id = $1', [parseInt(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Capybara not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
app.post('/capybaras', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    const result = await pool.query('INSERT INTO capybara (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
app.put('/capybaras/:id', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  try {
    const result = await pool.query('UPDATE capybara SET name = $1 WHERE id = $2 RETURNING *', [name, parseInt(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Capybara not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
app.delete('/capybaras/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM capybara WHERE id = $1 RETURNING *', [parseInt(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Capybara not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Swagger UI route
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, host, () => {
  console.log(`Capybara API server running at http://${host}:${port}/`);
  console.log(`Swagger UI available at http://${host}:${port}/api-docs`);
});
