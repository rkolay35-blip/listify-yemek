const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Flutter erişimi için izin

// --- DOSYALARI İÇERİ AL (IMPORT) ---
// data klasörünün içindeki iki dosyayı da çağırıyoruz
const haftalikMenuData = require('./data/haftalik_menu.json');
const yemeklerData = require('./data/yemekler.json'); 

const PORT = process.env.PORT || 3000;

// --- ANA SAYFA ---
app.get('/', (req, res) => {
    res.send(`
        <h1>Listify API Çalışıyor 🚀</h1>
        <p>Endpointler:</p>
        <ul>
            <li><a href="/api/haftalik-menu">/api/haftalik-menu</a> (7 Günlük Plan)</li>
            <li><a href="/api/yemekler">/api/yemekler</a> (Tüm Yemek Arşivi)</li>
        </ul>
    `);
});

// --- 1. ENDPOINT: Haftalık Menü ---
app.get('/api/haftalik-menu', (req, res) => {
    res.json(haftalikMenuData);
});

// --- 2. ENDPOINT: Yemekler (Akıllı Filtreleme ile) ---
// Kullanım: 
// - Tüm liste: /api/yemekler
// - Kategori: /api/yemekler?kategori=corba
app.get('/api/yemekler', (req, res) => {
    const kategori = req.query.kategori; // URL'den ?kategori=... bilgisini al

    // Veri yapısı { "yemekler": [...] } şeklinde mi yoksa direkt [...] mi kontrol et
    // Genelde JSON dosyaları { "yemekler": [...] } diye başlar.
    const liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;

    if (kategori) {
        // Eğer kategori istenmişse filtrele
        const filtrelenmis = liste.filter(y => 
            y.kategori && y.kategori.toLowerCase().includes(kategori.toLowerCase())
        );
        res.json(filtrelenmis);
    } else {
        // İstenmemişse hepsini gönder
        res.json(liste);
    }
});

// --- 3. ENDPOINT: Tek Yemek Detayı ---
// Kullanım: /api/yemekler/1
app.get('/api/yemekler/:id', (req, res) => {
    const liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;
    const id = req.params.id;

    // Hem number hem string ID'ye göre arama yapalım (Hata çıkmasın)
    const yemek = liste.find(y => y.id == id);

    if (yemek) {
        res.json(yemek);
    } else {
        res.status(404).json({ mesaj: "Yemek bulunamadı" });
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda data klasörü ile çalışıyor.`);
});
