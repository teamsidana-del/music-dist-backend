const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', require('./routes/auth'));
app.use('/releases', require('./routes/releases'));
app.use('/tracks', require('./routes/tracks'));
app.use('/contributors', require('./routes/contributors'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});