import { Router } from 'express';
import db from '../config/database';

const router = Router();

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Получить контактную информацию
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: Контактная информация
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Contacts'
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM contacts`);
    if (result.rows.length === 0) {
      return res.json({
        address: "",
        phone: "",
        email: "",
        website: "",
        work_schedule: "",
        social_media_vk: "",
        social_media_ya: "",
        social_media_two_gis: ""
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('DB query error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

/**
 * @swagger
 * /contacts:
 *   put:
 *     summary: Обновить контактную информацию
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactsInput'
 *     responses:
 *       200:
 *         description: Информация обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contacts'
 *       404:
 *         description: Информация не найдена
 */
router.put('/', async (req, res) => {
  const data = req.body;

  const requiredFields = ['address', 'phone', 'email'];
  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      return res.status(400).json({ error: `Поле "${field}" обязательно и должно быть строкой` });
    }
  }

  const fullData = {
    address: data.address,
    phone: data.phone,
    email: data.email,
    website: data.website || '',
    work_schedule: data.work_schedule || '',
    social_media_vk: data.social_media_vk || '',
    social_media_ya: data.social_media_ya || '',
    social_media_two_gis: data.social_media_two_gis || ''
  };

  try {
    const result = await db.query(`
      INSERT INTO contacts (
        id, address, phone, email, website, work_schedule, 
        social_media_vk, social_media_ya, social_media_two_gis
      ) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        website = EXCLUDED.website,
        work_schedule = EXCLUDED.work_schedule,
        social_media_vk = EXCLUDED.social_media_vk,
        social_media_ya = EXCLUDED.social_media_ya,
        social_media_two_gis = EXCLUDED.social_media_two_gis
      RETURNING *
    `, Object.values(fullData));

    res.json(result.rows[0]);
  } catch (err) {
    console.error('DB update error:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

export default router;