const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const haftalikMenuData = require('./data/endogru_haftalik_menuler.json');
const yemeklerData = require('./data/endogru_tarifler.json');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Listify API Dokümantasyonu</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background-color: #f4f4f9; color: #333; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                h2 { color: #e67e22; margin-top: 30px; }
                .endpoint { background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; }
                .method { display: inline-block; background: #27ae60; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.9em; margin-right: 10px; }
                .url { font-family: monospace; font-size: 1.1em; color: #d35400; }
                ul { line-height: 1.6; }
                code { background: #eee; padding: 2px 5px; border-radius: 3px; font-family: monospace; color: #c0392b; }
                a { color: #2980b9; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .param-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                .param-table th, .param-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .param-table th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>🚀 Listify API v5.3 Dokümantasyonu</h1>
            <p>Bu API, Listify mobil uygulaması için haftalık yemek menüleri, tarif detayları ve filtreleme seçenekleri sunar.</p>

            <!-- ENDPOINT 1 -->
            <div class="endpoint">
                <h2>1. Haftalık Menü</h2>
                <span class="method">GET</span> <span class="url">/api/haftalik-menu</span>
                <p>14 günlük döngüye göre (7 gün v1 + 7 gün v2) haftalık menüyü getirir.</p>
                
                <h3>Parametreler:</h3>
                <table class="param-table">
                    <tr><th>Parametre</th><th>Tip</th><th>Açıklama</th></tr>
                    <tr><td><code>gun</code></td><td>Sayı (1-14)</td><td>Belirtilen günün menüsünü getirir. 1-7 arası Versiyon 1, 8-14 arası Versiyon 2 döner. Boş bırakılırsa tüm ham veriyi (JSON) döner.</td></tr>
                </table>

                <h3>Örnekler:</h3>
                <ul>
                    <li><a href="/api/haftalik-menu" target="_blank">Tüm Menü Verisi (Ham JSON)</a></li>
                    <li><a href="/api/haftalik-menu?gun=1" target="_blank">1. Gün (Pazartesi - v1)</a></li>
                    <li><a href="/api/haftalik-menu?gun=8" target="_blank">8. Gün (Pazartesi - v2)</a></li>
                </ul>
            </div>

            <!-- ENDPOINT 2 -->
            <div class="endpoint">
                <h2>2. Yemekler (Arama & Filtreleme)</h2>
                <span class="method">GET</span> <span class="url">/api/yemekler</span>
                <p>Yemek tariflerini listeler, arar ve detaylı filtreleme yapar. Çoklu filtreleme destekler.</p>
                
                <h3>Parametreler:</h3>
                <table class="param-table">
                    <tr><th>Parametre</th><th>Örnek</th><th>Açıklama</th></tr>
                    <tr><td><code>id</code></td><td>1</td><td>Tekil yemek ID'sine göre getirir.</td></tr>
                    <tr><td><code>yemek_adi</code></td><td>mantı</td><td>İsminde geçen kelimeye göre arar.</td></tr>
                    <tr><td><code>ana_kategori</code></td><td>Ana Yemekler</td><td>Ana kategoriye göre filtreler.</td></tr>
                    <tr><td><code>kategori</code></td><td>Hamur İşi</td><td>Alt kategoriye göre filtreler.</td></tr>
                    <tr><td><code>ulke</code></td><td>turk</td><td>Mutfağına göre filtreler (örn: turk, italyan).</td></tr>
                    <tr><td><code>hazirlama_suresi</code></td><td>30</td><td>Belirtilen dakikaya <strong>eşit veya daha kısa</strong> süren yemekleri getirir.</td></tr>
                    <tr><td><code>etiketler</code></td><td>vegan</td><td>Etiket listesinde arama yapar.</td></tr>
                </table>

                <h3>Örnekler:</h3>
                <ul>
                    <li><a href="/api/yemekler" target="_blank">Tüm Yemekler</a></li>
                    <li><a href="/api/yemekler?ana_kategori=Ana Yemekler" target="_blank">Sadece Ana Yemekler</a></li>
                    <li><a href="/api/yemekler?hazirlama_suresi=30" target="_blank">30 dk ve altı pratik yemekler</a></li>
                    <li><a href="/api/yemekler?ulke=turk&kategori=Kebaplar" target="_blank">Türk Mutfağı ve Kebaplar</a></li>
                </ul>
            </div>

            <!-- ENDPOINT 3 -->
            <div class="endpoint">
                <h2>3. Meta Veriler (Filtre Seçenekleri)</h2>
                <span class="method">GET</span> <span class="url">/api/meta</span>
                <p>Uygulama içindeki filtreleme menülerini (Dropdown/Chip) doldurmak için benzersiz liste verilerini döner.</p>
                
                <h3>Dönen Veriler:</h3>
                <ul>
                    <li><code>ana_kategoriler</code>: Mevcut tüm ana kategoriler.</li>
                    <li><code>alt_kategoriler</code>: Mevcut tüm alt kategoriler.</li>
                    <li><code>ulkeler</code>: Kayıtlı mutfak/ülke türleri.</li>
                    <li><code>etiketler</code>: Kullanılan tüm etiketler.</li>
                    <li><code>sureler</code>: Veritabanındaki süre değerleri.</li>
                </ul>
                <p><a href="/api/meta" target="_blank">Meta Verilerini Gör</a></p>
            </div>

            <p style="text-align: center; color: #7f8c8d; font-size: 0.9em;">Listify Backend © 2024</p>
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
            ulke: secilenMenu.ulke, // YENİ: JSON'daki ülke bilgisini response'a ekledik
            baslik: secilenMenu.baslik,
            yemekler: secilenMenu.yemekler
        });
    } catch (error) {
        res.status(500).json({ hata: "Sunucu hatası." });
    }
});

// --- 2. ENDPOINT: Yemekler (Arama ve Filtreleme) ---
app.get('/api/yemekler', (req, res) => {
    let liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;
    
    // YENİ: 'ulke' parametresi eklendi
    const { id, yemek_adi, ana_kategori, kategori, etiketler, hazirlama_suresi, ulke } = req.query;

    if (id) liste = liste.filter(y => y.id == id);

    if (yemek_adi) {
        liste = liste.filter(y => y.yemek_adi && y.yemek_adi.toLowerCase().includes(yemek_adi.toLowerCase()));
    }

    if (ana_kategori) {
        liste = liste.filter(y => y.ana_kategori && y.ana_kategori.toLowerCase().includes(ana_kategori.toLowerCase()));
    }

    if (kategori) {
        liste = liste.filter(y => y.kategori && y.kategori.toLowerCase().includes(kategori.toLowerCase()));
    }

    // YENİ: Ülke Filtresi (Örn: ?ulke=turk)
    if (ulke) {
        liste = liste.filter(y => y.ulke && y.ulke.toLowerCase().includes(ulke.toLowerCase()));
    }

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
        liste = liste.filter(y =>
            y.etiketler && y.etiketler.some(etiket => etiket.toLowerCase().includes(arananEtiket))
        );
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

// --- 4. YENİ ENDPOINT: Meta Veriler (Filtre Seçenekleri) ---
app.get('/api/meta', (req, res) => {
    const liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;

    const anaKategorilerSet = new Set();
    const altKategorilerSet = new Set();
    const etiketlerSet = new Set();
    const surelerSet = new Set();
    const ulkelerSet = new Set(); // YENİ: Ülkeler listesi

    liste.forEach(yemek => {
        if (yemek.ana_kategori) anaKategorilerSet.add(yemek.ana_kategori);
        if (yemek.kategori) altKategorilerSet.add(yemek.kategori);
        if (yemek.hazirlama_suresi) surelerSet.add(yemek.hazirlama_suresi);
        if (yemek.ulke) ulkelerSet.add(yemek.ulke); // YENİ: Ülkeyi listeye ekle
        
        if (yemek.etiketler && Array.isArray(yemek.etiketler)) {
            yemek.etiketler.forEach(etiket => etiketlerSet.add(etiket));
        }
    });

    const response = {
        toplam_yemek_sayisi: liste.length,
        ana_kategoriler: Array.from(anaKategorilerSet).sort(),
        alt_kategoriler: Array.from(altKategorilerSet).sort(),
        ulkeler: Array.from(ulkelerSet).sort(), // YENİ: Çıktıya ekle
        etiketler: Array.from(etiketlerSet).sort(),
        sureler: Array.from(surelerSet).sort()
    };

    res.json(response);
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
