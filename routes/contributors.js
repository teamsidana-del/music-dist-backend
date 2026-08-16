const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { track_id, name, role, split_percentage } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO contributors (track_id, name, role, split_percentage) VALUES ($1, $2, $3, $4) RETURNING *`,
      [track_id, name, role, split_percentage]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/track/:trackId', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contributors WHERE track_id = $1', [req.params.trackId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;