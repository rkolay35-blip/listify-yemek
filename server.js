const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Flutter erişimi için izin

// --- DOSYALARI İÇERİ AL (IMPORT) ---
// JSON dosyanın yapısı: { "meta_data": {...}, "gunler": [...] }
const haftalikMenuData = require('./data/endogru_haftalik_menuler.json');
const yemeklerData = require('./data/endogru_tarifler.json');

const PORT = process.env.PORT || 3000;

// --- ANA SAYFA ---
app.get('/', (req, res) => {
    res.send(`
        <h1>Listify API Çalışıyor 🚀</h1>
        <p>Endpointler:</p>
        <ul>
            <li><a href="/api/haftalik-menu">/api/haftalik-menu</a> (Tüm Liste)</li>
            <li><a href="/api/haftalik-menu?gun=1">/api/haftalik-menu?gun=1</a> (Gün 1 - v1)</li>
            <li><a href="/api/yemekler?ana_kategori=Ana Yemekler">/api/yemekler?ana_kategori=...</a> (Filtreleme Örneği)</li>
        </ul>
    `);
});

// --- 1. ENDPOINT: Haftalık Menü ---
app.get('/api/haftalik-menu', (req, res) => {
    const gunParam = req.query.gun;

    // Veri senin JSON yapında "gunler" dizisinin içinde.
    const gunlerListesi = haftalikMenuData.gunler;

    // Hata Kontrolü
    if (!gunlerListesi) {
        return res.status(500).json({ 
            hata: "Veri kaynağı hatası. 'gunler' listesi bulunamadı.",
            mevcut_veri_keys: Object.keys(haftalikMenuData)
        });
    }

    // A) Eğer ?gun=X parametresi YOKSA tüm ham veriyi döndür
    if (!gunParam) {
        return res.json(haftalikMenuData);
    }

    // B) Eğer ?gun=X parametresi VARSA
    const istenenGun = parseInt(gunParam);

    if (isNaN(istenenGun) || istenenGun < 1) {
        return res.status(400).json({ hata: "Geçersiz gün değeri. Sayı giriniz." });
    }

    // --- MANTIK: 14 GÜNLÜK DÖNGÜ ---
    const donguIndex = (istenenGun - 1) % 14; 
    const gunIndex = donguIndex % 7;
    const versiyonIndex = donguIndex < 7 ? 0 : 1;

    try {
        const gunVerisi = gunlerListesi[gunIndex];
        
        if (!gunVerisi) {
            return res.status(404).json({ mesaj: `Gün verisi bulunamadı (Index: ${gunIndex})` });
        }

        const secilenMenu = gunVerisi.secenekler[versiyonIndex];

        if (!secilenMenu) {
            return res.status(404).json({ mesaj: "Bu gün için istenen menü versiyonu bulunamadı." });
        }

        res.json({
            istenen_gun_kodu: istenenGun,
            gun_adi: gunVerisi.gun_adi,
            versiyon_bilgisi: secilenMenu.versiyon_id,
            baslik: secilenMenu.baslik,
            yemekler: secilenMenu.yemekler
        });

    } catch (error) {
        console.error("Veri işleme hatası:", error);
        res.status(500).json({ hata: "Sunucu tarafında veri işleme hatası." });
    }
});

// --- 2. ENDPOINT: Yemekler (GELİŞMİŞ FİLTRELEME) ---
// Desteklenen Parametreler: id, yemek_adi, ana_kategori, kategori, etiketler, hazirlama_suresi
app.get('/api/yemekler', (req, res) => {
    // 1. Tüm yemek listesini hazırla
    let liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;

    // 2. Query parametrelerini al
    const { id, yemek_adi, ana_kategori, kategori, etiketler, hazirlama_suresi } = req.query;

    // 3. Adım adım filtreleme uygula (Zincirleme mantığı)
    
    // --- ID Filtresi ---
    if (id) {
        liste = liste.filter(y => y.id == id);
    }

    // --- Yemek Adı Filtresi (İçeriyorsa) ---
    if (yemek_adi) {
        liste = liste.filter(y => 
            y.yemek_adi && y.yemek_adi.toLowerCase().includes(yemek_adi.toLowerCase())
        );
    }

    // --- Ana Kategori Filtresi (Örn: Ana Yemekler) ---
    if (ana_kategori) {
        liste = liste.filter(y => 
            y.ana_kategori && y.ana_kategori.toLowerCase().includes(ana_kategori.toLowerCase())
        );
    }

    // --- Kategori Filtresi (Örn: Hamur İşi) ---
    if (kategori) {
        liste = liste.filter(y => 
            y.kategori && y.kategori.toLowerCase().includes(kategori.toLowerCase())
        );
    }

    // --- Hazırlama Süresi Filtresi (Örn: 90 dakika) ---
    if (hazirlama_suresi) {
        liste = liste.filter(y => 
            y.hazirlama_suresi && y.hazirlama_suresi.toLowerCase().includes(hazirlama_suresi.toLowerCase())
        );
    }

    // --- Etiket Filtresi (Dizi içinde arama) ---
    // Örn: ?etiketler=yöresel -> Etiket listesinde "yöresel" geçenleri bulur
    if (etiketler) {
        const arananEtiket = etiketler.toLowerCase();
        liste = liste.filter(y =>
            y.etiketler && y.etiketler.some(etiket => etiket.toLowerCase().includes(arananEtiket))
        );
    }

    res.json(liste);
});

// --- 3. ENDPOINT: Tek Yemek Detayı (ID ile direkt erişim) ---
app.get('/api/yemekler/:id', (req, res) => {
    const liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;
    const id = req.params.id;
    const yemek = liste.find(y => y.id == id);

    if (yemek) {
        res.json(yemek);
    } else {
        res.status(404).json({ mesaj: "Yemek bulunamadı" });
    }
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
