import { Router } from 'express';
import db from '../config/database';

const router = Router();

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Получить список активных услуг
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Список услуг
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Service'
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM services');
    res.json(result.rows);
  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Создать новую услугу (только для админа)
 *     tags: [Services]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       201:
 *         description: Услуга создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       400:
 *         description: Все поля обязательны
 *       401:
 *         description: Неавторизован
 *       403:
 *         description: Доступ запрещён
 */
router.post('/', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  if (token !== 'admin-secret-jwt-token') {
    return res.status(403).json({ error: 'Доступ разрешён только администратору' });
  }
  const { eng, title, src, prices, text } = req.body;

  if (!eng || !title || !src || !prices || !text) {
    return res.status(400).json({ error: 'Все поля (eng, title, src, prices, text) обязательны' });
  }

  try {
    const result = await db.query(
      'INSERT INTO services (eng, title, src, prices, text) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [eng, title, src, prices, text]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('DB insert error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Обновить конкретную услугу
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID услуги
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ServiceInput'
 *     responses:
 *       200:
 *         description: Обновлённая услуга
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Service'
 *       404:
 *         description: Услуга не найдена
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, prices, text } = req.body;

  try {
    const result = await db.query(
      'UPDATE services SET title = $1, prices = $2, text = $3 WHERE id = $4 RETURNING *',
      [title, prices, text, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('DB update error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;