const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// --- VERİ DOSYALARI ---
const haftalikMenuData = require('./data/endogru_haftalik_menuler.json');
const yemeklerData = require('./data/endogru_tarifler.json');
// Trivia bilgileri (Eğer dosya yoksa hata vermemesi için try-catch bloğuna alabilirsin veya direkt require yapabilirsin)
let triviaData = [];
try {
    triviaData = require('./data/trivia_bilgileri.json');
} catch (e) {
    console.log("Trivia dosyası bulunamadı veya hatalı.");
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
            <title>Listify API v5.4</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background-color: #f4f4f9; color: #333; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                h2 { color: #e67e22; margin-top: 30px; }
                .endpoint { background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; }
                .method { display: inline-block; background: #27ae60; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.9em; margin-right: 10px; }
                .url { font-family: monospace; font-size: 1.1em; color: #d35400; }
                .param-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .param-table th, .param-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .param-table th { background-color: #f2f2f2; }
                code { background: #eee; padding: 2px 5px; border-radius: 3px; font-family: monospace; color: #c0392b; }
                a { color: #2980b9; text-decoration: none; }
            </style>
        </head>
        <body>
            <h1>🚀 Listify API v5.4 Dokümantasyonu</h1>

            <!-- 1. Haftalık Menü -->
            <div class="endpoint">
                <h2>1. Haftalık Menü</h2>
                <span class="method">GET</span> <span class="url">/api/haftalik-menu</span>
                <p>14 günlük döngüye göre haftalık menüyü getirir.</p>
                <ul>
                    <li><a href="/api/haftalik-menu?gun=1" target="_blank">?gun=1 (Örnek)</a></li>
                </ul>
            </div>

            <!-- 2. Yemekler -->
            <div class="endpoint">
                <h2>2. Yemekler (Arama & Filtreleme)</h2>
                <span class="method">GET</span> <span class="url">/api/yemekler</span>
                <p>Yemek tariflerini listeler ve filtreler.</p>
                <ul>
                    <li><a href="/api/yemekler?hazirlama_suresi=30" target="_blank">?hazirlama_suresi=30</a></li>
                    <li><a href="/api/yemekler?ulke=turk" target="_blank">?ulke=turk</a></li>
                </ul>
            </div>

            <!-- 3. Meta -->
            <div class="endpoint">
                <h2>3. Meta Veriler</h2>
                <span class="method">GET</span> <span class="url">/api/meta</span>
                <p>Filtreleme seçenekleri için tüm kategorileri döner.</p>
            </div>

            <!-- 4. Trivia (YENİ) -->
            <div class="endpoint">
                <h2>4. Trivia / İlginç Bilgiler</h2>
                <span class="method">GET</span> <span class="url">/api/trivia</span>
                <p>Yükleme ekranları için rastgele bir ilginç bilgi döndürür.</p>
                
                <h3>Parametreler:</h3>
                <table class="param-table">
                    <tr><th>Parametre</th><th>Durum</th><th>Açıklama</th></tr>
                    <tr><td><code>dil</code></td><td><span style="color:red; font-weight:bold;">ZORUNLU</span></td><td>İstenen dil kodu (örn: tr, en).</td></tr>
                </table>

                <h3>Örnekler:</h3>
                <ul>
                    <li><a href="/api/trivia?dil=tr" target="_blank">/api/trivia?dil=tr</a> (Rastgele Türkçe Bilgi)</li>
                    <li><a href="/api/trivia?dil=en" target="_blank">/api/trivia?dil=en</a> (Rastgele İngilizce Bilgi)</li>
                </ul>
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
    if (isNaN(istenenGun) || istenenGun < 1) return res.status(400).json({ hata: "Geçersiz gün." });

    const donguIndex = (istenenGun - 1) % 14; 
    const gunIndex = donguIndex % 7;
    const versiyonIndex = donguIndex < 7 ? 0 : 1;

    try {
        const gunVerisi = gunlerListesi[gunIndex];
        if (!gunVerisi) return res.status(404).json({ mesaj: "Gün verisi yok." });
        
        const secilenMenu = gunVerisi.secenekler[versiyonIndex];
        if (!secilenMenu) return res.status(404).json({ mesaj: "Menü yok." });

        res.json({
            istenen_gun_kodu: istenenGun,
            gun_adi: gunVerisi.gun_adi,
            versiyon_bilgisi: secilenMenu.versiyon_id,
            ulke: secilenMenu.ulke,
            baslik: secilenMenu.baslik,
            yemekler: secilenMenu.yemekler
        });
    } catch (error) {
        res.status(500).json({ hata: "Sunucu hatası." });
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

// --- 5. ENDPOINT: Trivia / İlginç Bilgiler (YENİ) ---
// Kullanım: /api/trivia?dil=tr
// Dil parametresi ZORUNLUDUR. Tek bir rastgele bilgi döner.
app.get('/api/trivia', (req, res) => {
    const dil = req.query.dil;

    // 1. Dil parametresi kontrolü
    if (!dil) {
        return res.status(400).json({ 
            hata: "Dil parametresi zorunludur.", 
            ornek_kullanim: "/api/trivia?dil=tr" 
        });
    }

    // JSON yapısı { "bilgiler": [...] } veya direkt [...] olabilir.
    // Garantiye almak için kontrol ediyoruz.
    const tumBilgiler = triviaData.bilgiler ? triviaData.bilgiler : triviaData;

    if (!Array.isArray(tumBilgiler)) {
        return res.status(500).json({ hata: "Trivia veri yapısı sunucuda hatalı." });
    }

    // 2. Dile göre filtreleme (Büyük/Küçük harf duyarsız)
    const filtrelenmis = tumBilgiler.filter(item => 
        item.dil && item.dil.toLowerCase() === dil.toLowerCase()
    );

    if (filtrelenmis.length === 0) {
        return res.status(404).json({ mesaj: `Bu dilde (${dil}) herhangi bir bilgi bulunamadı.` });
    }

    // 3. Rastgele bir tane seçme
    const randomBilgi = filtrelenmis[Math.floor(Math.random() * filtrelenmis.length)];

    res.json(randomBilgi);
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
