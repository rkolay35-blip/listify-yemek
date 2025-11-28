const express = require('express');
const cors = require('cors');
const app = express();

// --- 1. ADIM: Veri Dosyasını İçeri Alıyoruz ---
const veri = require('./yemekler.json'); 

app.use(cors()); // Flutter uygulamasının erişimi için izin

const PORT = process.env.PORT || 3000;

// Ana sayfa mesajı
app.get('/', (req, res) => {
    res.send('<h1>Listify Yemek API Çalışıyor! 🚀</h1><p>/api/yemekler adresine gidin.</p>');
});

// --- 2. ADIM: Tüm Yemekleri Listeleme ---
// Adres: /api/yemekler
app.get('/api/yemekler', (req, res) => {
    // URL'de kategori filtresi var mı? (Örn: ?kategori=tatli)
    const kategori = req.query.kategori;

    if (kategori) {
        // Varsa filtrele ve gönder
        const filtrelenmis = veri.yemekler.filter(y => y.kategori === kategori);
        res.json(filtrelenmis);
    } else {
        // Yoksa hepsini gönder
        res.json(veri.yemekler);
    }
});

// --- 3. ADIM: Tek Bir Yemeği Getirme (Detay Sayfası İçin) ---
// Adres: /api/yemekler/1
app.get('/api/yemekler/:id', (req, res) => {
    const id = parseInt(req.params.id); // URL'deki id'yi sayıya çevir
    const yemek = veri.yemekler.find(y => y.id === id);

    if (yemek) {
        res.json(yemek);
    } else {
        res.status(404).json({ mesaj: "Yemek bulunamadı" });
    }
});

// --- 4. ADIM: Kategorileri Listeleme ---
// Adres: /api/kategoriler
app.get('/api/kategoriler', (req, res) => {
    res.json(veri.kategoriler);
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
