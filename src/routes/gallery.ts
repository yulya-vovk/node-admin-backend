import { Router } from 'express';
import db from '../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

const router = Router();


/**
 * @swagger
 * /gallery:
 *   get:
 *     summary: Получить список изображений
 *     tags: [Gallery]
 *     responses:
 *       200:
 *         description: Список изображений
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gallery'
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM galleries');
    res.json(result.rows);
  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /gallery:
 *   post:
 *     summary: Загрузить новые изображения
 *     tags: [Gallery]
 *     requestBody:
 *       required: true
 *       content:
 *        multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *             required:
 *               - files
 *     responses:
 *       200:
 *         description: Фото успешно загружены
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gallery'
 *       404:
 *         description: Изображение не найдено
 */
router.post('/', upload.array('files'), async (req, res) => {
  const files = req.files as Express.Multer.File[];

  const uploaded = [];
  for (const file of files) {
    const ext = path.extname(file.originalname);
    const filename = `upload_${Date.now()}_${Math.random().toString(36)}${ext}`;
    const newPath = `uploads/${filename}`;

    fs.renameSync(file.path, newPath);

    const result = await db.query(
      'INSERT INTO galleries (filename, hidden) VALUES ($1, false) RETURNING *',
      [`/uploads/${filename}`]
    );
    uploaded.push(result.rows[0]);
  }

  res.json(uploaded);
});

/**
 * @swagger
 * /gallery/{id}:
 *   put:
 *     summary: Обновить видимость изображенияя
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID изображения
 * 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hidden:
 *                 type: boolean
 *             required:
 *               - hidden
 *     responses:
 *       200:
 *         description: Видимость обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gallery'
 *       404:
 *         description: Фото не найдено
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { hidden } = req.body;

  if (!hidden) {
    return res.status(400).json({ error: 'Поле "filename" обязательно' });
  }
  try {
    const result = await db.query(
      'UPDATE galleries SET hidden = $1 WHERE id = $2 RETURNING *',
      [hidden, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('DB update error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /gallery/{id}:
 *   delete:
 *     summary: Удалить изображение
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID изображения
 *     responses:
 *       204:
 *         description: Изображение успешно удалено
 *       404:
 *         description: Изображение не найдено
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM galleries WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('DB delete error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;