const express = require('express');
const multer = require('multer');
const pool = require('../db');
const supabase = require('../supabase');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', requireAuth, async (req, res) => {
  const { release_id, title, track_number } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tracks (release_id, title, track_number) VALUES ($1, $2, $3) RETURNING *`,
      [release_id, title, track_number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:trackId/audio', requireAuth, upload.single('file'), async (req, res) => {
  const { trackId } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileName = `${trackId}-${Date.now()}.wav`;

  try {
    const { error } = await supabase.storage
      .from('audio')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    await pool.query('UPDATE tracks SET audio_file_url = $1 WHERE id = $2', [fileName, trackId]);
    res.json({ path: fileName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;