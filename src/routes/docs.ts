import { Router } from 'express';
import db from '../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

const router = Router();

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: Получить список документов
 *     tags: [Docs]
 *     responses:
 *       200:
 *         description: Список документов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Docs'
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM docs');
    res.json(result.rows);
  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /docs:
 *   post:
 *     summary: Загрузить новые документы
 *     tags: [Docs]
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
 *         description: Документы успешно загружены
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Docs'
 *       404:
 *         description: Документ не найден
 */
router.post('/', upload.array('files'), async (req, res) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'Файлы не найдены' });
  }

  const uploaded = [];
  for (const file of files) {
    const ext = path.extname(file.originalname);
    const name = `upload_${Date.now()}_${Math.random().toString(36)}${ext}`;
    const newPath = `uploads/${name}`;
    fs.renameSync(file.path, newPath);

    let originalName = file.originalname;
    try {
      const buffer = Buffer.from(originalName, 'binary');
      const decoded = buffer.toString('utf-8');
      if (!decoded.includes('Ð') && !decoded.includes('Ñ')) {
        originalName = decoded;
      } else {
        originalName = decoded;
      }
    } catch (err) {}

    const result = await db.query(
      'INSERT INTO docs (name, file) VALUES ($1, $2) RETURNING *',
      [file.originalname, `/uploads/${name}`]
    );
    uploaded.push(result.rows[0]);
  }

  res.json(uploaded);
});

/**
 * @swagger
 * /docs/{id}:
 *   put:
 *     summary: Переименовать документ
 *     tags: [Docs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID документа
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Новое имя файла (без пути)
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Имя документа обновлено
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Docs'
 *       404:
 *         description: Документ не найден
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Поле "name" обязательно  и должно быть строкой' });
  }
  try {
    const result = await db.query('SELECT name FROM docs WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    const updatedDoc = await db.query(
      'UPDATE docs SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    res.json(updatedDoc.rows[0]);
  } catch (err) {
    console.error('DB update error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /docs/{id}:
 *   delete:
 *     summary: Удалить документ
 *     tags: [Docs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID документа
 *     responses:
 *       204:
 *         description: Документ успешно удален
 *       404:
 *         description: Документ не найден
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM docs WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('DB delete error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;