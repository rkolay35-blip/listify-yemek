const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const db = require('./data/db.json');

app.get('/', (req, res) => {
  res.send('Listify Yemek API');
});

// Return full DB (yemekler + kategoriler)
app.get('/api', (req, res) => {
  res.json(db);
});

// Return only yemekler list
app.get('/api/yemekler', (req, res) => {
  res.json(db.yemekler);
});

// Return single yemek by id
app.get('/api/yemekler/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = db.yemekler.find(y => y.id === id);
  if (!item) return res.status(404).json({ error: 'Yemek bulunamadı' });
  res.json(item);
});

app.listen(port, () => console.log(`Server listening on port ${port}`));
