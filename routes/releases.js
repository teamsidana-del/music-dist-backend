const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { title, release_type, release_date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO releases (owner_id, title, release_type, release_date) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.userId, title, release_type, release_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM releases WHERE owner_id = $1', [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:releaseId/submit', requireAuth, async (req, res) => {
  const { releaseId } = req.params;
  const dsps = ['spotify', 'apple_music', 'youtube_music'];

  try {
    for (const dsp of dsps) {
      await pool.query(
        `INSERT INTO distribution_jobs (release_id, dsp_name, status) VALUES ($1, $2, 'pending')`,
        [releaseId, dsp]
      );
    }
    await pool.query(`UPDATE releases SET status = 'submitted' WHERE id = $1`, [releaseId]);
    res.json({ message: 'Submitted for distribution' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;