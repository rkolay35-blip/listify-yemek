const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// --- VERİ DOSYALARI ---
const haftalikMenuData = require('./data/endogru_haftalik_menuler.json');
const yemeklerData = require('./data/endogru_tarifler.json');

// Trivia bilgileri
let triviaData = [];
try {
    triviaData = require('./data/trivia_bilgileri.json');
} catch (e) {
    console.log("Trivia dosyası okunamadı:", e.message);
    triviaData = {}; 
}

const PORT = process.env.PORT || 3000;

// --- DOKÜMANTASYON (HTML) ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Listify API v6.0</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background-color: #f4f4f9; color: #333; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                .endpoint { background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; }
                .method { display: inline-block; background: #27ae60; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.9em; margin-right: 10px; }
                .url { font-family: monospace; font-size: 1.1em; color: #d35400; }
                code { background: #eee; padding: 2px 5px; border-radius: 3px; font-family: monospace; color: #c0392b; }
                a { color: #2980b9; text-decoration: none; }
            </style>
        </head>
        <body>
            <h1>🚀 Listify API v6.0 Dokümantasyonu</h1>
            
            <div class="endpoint">
                <h2>1. Haftalık Menü</h2>
                <span class="method">GET</span> <span class="url">/api/haftalik-menu</span>
                <p><strong>Akıllı Takvim Modu:</strong> Girilen günü, mevcut ayın günü olarak kabul eder ve gerçek haftanın gününü hesaplar.</p>
                <p>Parametre: <code>?gun=29</code> (Ayın 29. günü için menü getirir)</p>
            </div>

            <div class="endpoint">
                <h2>2. Yemekler</h2>
                <span class="method">GET</span> <span class="url">/api/yemekler</span>
                <p>Parametreler: <code>?ulke=turk</code>, <code>?hazirlama_suresi=30</code></p>
            </div>

            <div class="endpoint">
                <h2>3. Meta Veriler</h2>
                <span class="method">GET</span> <span class="url">/api/meta</span>
            </div>

            <div class="endpoint">
                <h2>4. Günün Bilgisi (Trivia)</h2>
                <span class="method">GET</span> <span class="url">/api/trivia</span>
                <p><strong>Günlük Rotasyon:</strong> Her gün otomatik olarak yeni bir bilgi seçilir. İstenirse manuel gün seçimi de yapılabilir.</p>
                <p>Parametreler: <code>?dil=tr</code> (Zorunlu), <code>?gun=5</code> (Opsiyonel)</p>
            </div>
            
            <p style="text-align: center; color: #7f8c8d; margin-top: 40px;">Listify Backend © 2024</p>
        </body>
        </html>
    `);
});

// --- 1. ENDPOINT: Haftalık Menü ---
app.get('/api/haftalik-menu', (req, res) => {
    const gunParam = req.query.gun;
    const gunlerListesi = haftalikMenuData.gunler;

    if (!gunlerListesi) return res.status(500).json({ hata: "Veri hatası." });
    if (!gunParam) return res.json(haftalikMenuData);

    let istenenGun = parseInt(gunParam);
    if (isNaN(istenenGun) || istenenGun < 1) return res.status(400).json({ hata: "Geçersiz gün değeri." });

    try {
        const bugun = new Date();
        const currentYear = bugun.getFullYear();
        const currentMonth = bugun.getMonth(); 
        const hedefTarih = new Date(currentYear, currentMonth, istenenGun);

        const jsGun = hedefTarih.getDay();
        const gunIndex = (jsGun + 6) % 7;
        const haftaIndex = Math.floor((istenenGun - 1) / 7);
        const versiyonIndex = haftaIndex % 2;

        const gunVerisi = gunlerListesi[gunIndex];
        if (!gunVerisi) return res.status(404).json({ mesaj: "Gün verisi bulunamadı." });

        const secilenMenu = gunVerisi.secenekler[versiyonIndex];
        if (!secilenMenu) return res.status(404).json({ mesaj: "Menü versiyonu bulunamadı." });

        res.json({
            istenen_gun_kodu: istenenGun,
            takvim_tarihi: hedefTarih.toLocaleDateString('tr-TR'),
            gun_adi: gunVerisi.gun_adi,
            versiyon_bilgisi: secilenMenu.versiyon_id,
            ulke: secilenMenu.ulke,
            baslik: secilenMenu.baslik,
            yemekler: secilenMenu.yemekler
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ hata: "Tarih hesaplama hatası." });
    }
});

// --- 2. ENDPOINT: Yemekler ---
app.get('/api/yemekler', (req, res) => {
    let liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;
    const { id, yemek_adi, ana_kategori, kategori, etiketler, hazirlama_suresi, ulke } = req.query;

    if (id) liste = liste.filter(y => y.id == id);
    if (yemek_adi) liste = liste.filter(y => y.yemek_adi && y.yemek_adi.toLowerCase().includes(yemek_adi.toLowerCase()));
    if (ana_kategori) liste = liste.filter(y => y.ana_kategori && y.ana_kategori.toLowerCase().includes(ana_kategori.toLowerCase()));
    if (kategori) liste = liste.filter(y => y.kategori && y.kategori.toLowerCase().includes(kategori.toLowerCase()));
    if (ulke) liste = liste.filter(y => y.ulke && y.ulke.toLowerCase().includes(ulke.toLowerCase()));

    if (hazirlama_suresi) {
        const maksimumSure = parseInt(hazirlama_suresi);
        if (!isNaN(maksimumSure)) {
            liste = liste.filter(y => {
                if (!y.hazirlama_suresi) return false;
                const yemekSuresi = parseInt(y.hazirlama_suresi);
                return yemekSuresi <= maksimumSure;
            });
        }
    }

    if (etiketler) {
        const arananEtiket = etiketler.toLowerCase();
        liste = liste.filter(y => y.etiketler && y.etiketler.some(etiket => etiket.toLowerCase().includes(arananEtiket)));
    }

    res.json(liste);
});

// --- 3. ENDPOINT: Tek Yemek ---
app.get('/api/yemekler/:id', (req, res) => {
    const liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;
    const yemek = liste.find(y => y.id == req.params.id);
    if (yemek) res.json(yemek);
    else res.status(404).json({ mesaj: "Yemek bulunamadı" });
});

// --- 4. ENDPOINT: Meta Veriler ---
app.get('/api/meta', (req, res) => {
    const liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;
    const anaKategorilerSet = new Set();
    const altKategorilerSet = new Set();
    const etiketlerSet = new Set();
    const surelerSet = new Set();
    const ulkelerSet = new Set();

    liste.forEach(yemek => {
        if (yemek.ana_kategori) anaKategorilerSet.add(yemek.ana_kategori);
        if (yemek.kategori) altKategorilerSet.add(yemek.kategori);
        if (yemek.hazirlama_suresi) surelerSet.add(yemek.hazirlama_suresi);
        if (yemek.ulke) ulkelerSet.add(yemek.ulke);
        if (yemek.etiketler && Array.isArray(yemek.etiketler)) {
            yemek.etiketler.forEach(etiket => etiketlerSet.add(etiket));
        }
    });

    res.json({
        toplam_yemek_sayisi: liste.length,
        ana_kategoriler: Array.from(anaKategorilerSet).sort(),
        alt_kategoriler: Array.from(altKategorilerSet).sort(),
        ulkeler: Array.from(ulkelerSet).sort(),
        etiketler: Array.from(etiketlerSet).sort(),
        sureler: Array.from(surelerSet).sort()
    });
});

// --- 5. ENDPOINT: Trivia (GÜNLÜK ROTASYONLU + MANUEL SEÇİM) ---
app.get('/api/trivia', (req, res) => {
    const dil = req.query.dil;
    const gunParam = req.query.gun; // Opsiyonel parametre

    if (!dil || (dil !== 'tr' && dil !== 'en')) {
        return res.status(400).json({ hata: "Geçersiz veya eksik dil parametresi. (?dil=tr)" });
    }

    let tumBilgiler = null;
    if (triviaData.veriler && Array.isArray(triviaData.veriler)) {
        tumBilgiler = triviaData.veriler;
    } else if (Array.isArray(triviaData)) {
        tumBilgiler = triviaData;
    }

    if (!tumBilgiler || tumBilgiler.length === 0) {
        return res.status(500).json({ hata: "Trivia verisi bulunamadı." });
    }

    let secilenIndex;
    let tarihKodu;

    if (gunParam) {
        // --- MANUEL SEÇİM ---
        const istenenGun = parseInt(gunParam);
        if (isNaN(istenenGun)) {
            return res.status(400).json({ hata: "Geçersiz gün parametresi. Lütfen sayı giriniz." });
        }
        
        // Kullanıcının girdiği güne göre döngüsel index (1 girerse 0. index)
        secilenIndex = (istenenGun - 1) % tumBilgiler.length;
        
        // Negatif kontrolü (eğer yanlışlıkla negatif girilirse)
        if (secilenIndex < 0) secilenIndex += tumBilgiler.length;
        
        tarihKodu = istenenGun; // Manuel kod
    } else {
        // --- GÜNLÜK OTOMATİK ROTASYON ---
        const now = new Date();
        const trTime = now.getTime() + (3 * 60 * 60 * 1000); // TR saati ile zaman damgası
        const birGunMs = 24 * 60 * 60 * 1000;
        
        const gunSayisi = Math.floor(trTime / birGunMs);
        secilenIndex = gunSayisi % tumBilgiler.length;
        tarihKodu = gunSayisi;
    }

    const gununBilgisi = tumBilgiler[secilenIndex];
    const secilenMetin = dil === 'tr' ? gununBilgisi.bilgi_tr : gununBilgisi.bilgi_en;

    if (!secilenMetin) {
        return res.status(404).json({ mesaj: "Bu dilde içerik bulunamadı." });
    }

    res.json({
        tarih_kodu: tarihKodu, // Debug için: Hangi gün sayısındayız
        gunun_indexi: secilenIndex, // Debug için: Listeden kaçıncı eleman seçildi
        id: gununBilgisi.id,
        kategori: gununBilgisi.kategori || "genel",
        bilgi: secilenMetin,
        dil: dil
    });
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
