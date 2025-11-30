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

// --- DOKÜMANTASYON (HTML - DETAYLANDIRILMIŞ) ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Listify API v6.3 Dokümantasyonu</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 960px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; color: #343a40; }
                header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
                h1 { color: #007bff; margin: 0; font-size: 2.5em; }
                h2 { color: #495057; border-left: 5px solid #007bff; padding-left: 10px; margin-top: 40px; }
                p { line-height: 1.6; }
                .endpoint-card { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 25px; }
                .method { display: inline-block; background: #28a745; color: #fff; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 0.9em; vertical-align: middle; }
                .url { font-family: 'Consolas', monospace; font-size: 1.2em; color: #d63384; margin-left: 10px; font-weight: bold; vertical-align: middle; }
                .desc { margin-top: 10px; color: #6c757d; font-style: italic; }
                
                table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #fff; }
                th, td { border: 1px solid #dee2e6; padding: 10px; text-align: left; }
                th { background-color: #e9ecef; color: #495057; }
                code { background: #f1f3f5; padding: 2px 6px; border-radius: 4px; font-family: 'Consolas', monospace; color: #c0392b; }
                
                .badge-req { background: #dc3545; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em; }
                .badge-opt { background: #17a2b8; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em; }
                
                a { color: #007bff; text-decoration: none; font-weight: 500; }
                a:hover { text-decoration: underline; }
                .example-box { background: #f8f9fa; border-left: 4px solid #28a745; padding: 10px; margin-top: 10px; }
            </style>
        </head>
        <body>
            <header>
                <h1>🚀 Listify API Dokümantasyonu</h1>
                <p>Yemek Tarifleri, Haftalık Menüler ve Kültürel İçerikler Servisi</p>
                <small>Versiyon: 6.3 | Durum: Aktif</small>
            </header>

            <!-- 1. Haftalık Menü -->
            <div class="endpoint-card">
                <h2>1. Haftalık Menü</h2>
                <div>
                    <span class="method">GET</span> 
                    <span class="url">/api/haftalik-menu</span>
                </div>
                <p class="desc">14 günlük (2 haftalık) döngüye sahip akıllı menü sistemi. Gerçek takvim verilerini kullanarak o günün menüsünü otomatik getirir.</p>

                <h3>Nasıl Çalışır?</h3>
                <p>Sistem, girilen gün numarasını (veya bugünün tarihini) kullanarak haftanın hangi günü olduğunu (Pazartesi-Pazar) hesaplar. 1. hafta için "Versiyon 1", 2. hafta için "Versiyon 2" menülerini sunar.</p>

                <h3>Parametreler</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Parametre</th>
                            <th>Tip</th>
                            <th>Zorunluluk</th>
                            <th>Açıklama</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>gun</code></td>
                            <td>Sayı (1-31)</td>
                            <td><span class="badge-opt">OPSİYONEL</span></td>
                            <td>Ayın kaçıncı günü olduğunu belirtir. Boş bırakılırsa tüm menü verisi döner. Girilirse o güne özel menü hesaplanır.</td>
                        </tr>
                    </tbody>
                </table>

                <div class="example-box">
                    <strong>Örnekler:</strong>
                    <ul>
                        <li><a href="/api/haftalik-menu" target="_blank">/api/haftalik-menu</a> (Tüm ham veri)</li>
                        <li><a href="/api/haftalik-menu?gun=1" target="_blank">/api/haftalik-menu?gun=1</a> (Ayın 1'i için menü)</li>
                        <li><a href="/api/haftalik-menu?gun=15" target="_blank">/api/haftalik-menu?gun=15</a> (Ayın 15'i için menü - v1/v2 döngüsüne göre)</li>
                    </ul>
                </div>
            </div>

            <!-- 2. Yemekler -->
            <div class="endpoint-card">
                <h2>2. Yemekler (Arama & Filtreleme)</h2>
                <div>
                    <span class="method">GET</span> 
                    <span class="url">/api/yemekler</span>
                </div>
                <p class="desc">Tüm yemek veritabanında arama yapmayı sağlar. Çoklu filtreleme destekler (Örn: Hem Türk mutfağı olsun hem 30 dk altı olsun).</p>

                <h3>Parametreler</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Parametre</th>
                            <th>Örnek Değer</th>
                            <th>Açıklama</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>id</code></td>
                            <td>1</td>
                            <td>Tekil yemek ID'si.</td>
                        </tr>
                        <tr>
                            <td><code>yemek_adi</code></td>
                            <td>mantı</td>
                            <td>Yemek isminde geçen kelimeye göre arar.</td>
                        </tr>
                        <tr>
                            <td><code>ulke</code></td>
                            <td>turk</td>
                            <td>Ülke/Mutfak filtresi (turk, italyan, meksika vb.)</td>
                        </tr>
                        <tr>
                            <td><code>ana_kategori</code></td>
                            <td>Ana Yemekler</td>
                            <td>Ana kategori filtresi.</td>
                        </tr>
                        <tr>
                            <td><code>hazirlama_suresi</code></td>
                            <td>30</td>
                            <td>Girilen değere <strong>eşit veya daha kısa</strong> süren yemekleri getirir.</td>
                        </tr>
                         <tr>
                            <td><code>etiketler</code></td>
                            <td>vegan</td>
                            <td>Etiketler içinde arama yapar (yöresel, acılı, vegan vb.)</td>
                        </tr>
                    </tbody>
                </table>

                <div class="example-box">
                    <strong>Örnek Senaryolar:</strong>
                    <ul>
                        <li><a href="/api/yemekler" target="_blank">Tüm Yemekleri Listele</a></li>
                        <li><a href="/api/yemekler?ulke=turk" target="_blank">Sadece Türk Yemekleri</a></li>
                        <li><a href="/api/yemekler?hazirlama_suresi=20" target="_blank">20 dk ve altı pratik yemekler</a></li>
                        <li><a href="/api/yemekler?ulke=turk&kategori=Kebaplar" target="_blank">Türk Mutfağı ve Kebaplar</a></li>
                    </ul>
                </div>
            </div>

            <!-- 3. Meta Veriler -->
            <div class="endpoint-card">
                <h2>3. Meta Veriler (Filtre Seçenekleri)</h2>
                <div>
                    <span class="method">GET</span> 
                    <span class="url">/api/meta</span>
                </div>
                <p class="desc">Uygulama arayüzündeki (Frontend) filtreleme menülerini, dropdown'ları doldurmak için kullanılır. Veritabanındaki benzersiz kategori ve etiketleri listeler.</p>
                <div class="example-box">
                    <a href="/api/meta" target="_blank">Meta Verilerini Görüntüle</a> (JSON Yanıtı)
                </div>
            </div>

            <!-- 4. Trivia -->
            <div class="endpoint-card">
                <h2>4. Günün Bilgisi (Trivia)</h2>
                <div>
                    <span class="method">GET</span> 
                    <span class="url">/api/trivia</span>
                </div>
                <p class="desc">Kullanıcılara her gün farklı bir ilginç bilgi sunar. Tüm kullanıcılar o gün aynı bilgiyi görür.</p>
                
                 <h3>Parametreler</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Parametre</th>
                            <th>Tip</th>
                            <th>Zorunluluk</th>
                            <th>Açıklama</th>
                        </tr>
                    </thead>
                    <tbody>
                         <tr>
                            <td><code>dil</code></td>
                            <td>Metin (tr/en)</td>
                            <td><span class="badge-req">ZORUNLU</span></td>
                            <td>Bilginin hangi dilde döneceğini belirler.</td>
                        </tr>
                        <tr>
                            <td><code>gun</code></td>
                            <td>Sayı</td>
                            <td><span class="badge-opt">OPSİYONEL</span></td>
                            <td>Normalde tarih otomatiktir. Test etmek veya geçmiş bir güne gitmek için manuel gün sayısı girilebilir.</td>
                        </tr>
                    </tbody>
                </table>

                <div class="example-box">
                    <strong>Örnekler:</strong>
                    <ul>
                        <li><a href="/api/trivia?dil=tr" target="_blank">Günün Bilgisi (Türkçe)</a> - Otomatik Tarih</li>
                        <li><a href="/api/trivia?dil=en" target="_blank">Fact of the Day (English)</a> - Auto Date</li>
                        <li><a href="/api/trivia?dil=tr&gun=5" target="_blank">5. Günün Bilgisi (Manuel Seçim)</a></li>
                    </ul>
                </div>
            </div>
            
            <footer style="text-align: center; margin-top: 50px; color: #adb5bd; padding-bottom: 20px;">
                <p>Listify Backend API &copy; 2024</p>
            </footer>
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
    
    // Ülke filtresi burada çalışmaya devam ediyor
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

// --- 5. ENDPOINT: Trivia ---
app.get('/api/trivia', (req, res) => {
    const dil = req.query.dil;
    const gunParam = req.query.gun; 

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
        const istenenGun = parseInt(gunParam);
        if (isNaN(istenenGun)) {
            return res.status(400).json({ hata: "Geçersiz gün parametresi. Lütfen sayı giriniz." });
        }
        secilenIndex = (istenenGun - 1) % tumBilgiler.length;
        if (secilenIndex < 0) secilenIndex += tumBilgiler.length;
        tarihKodu = istenenGun;
    } else {
        const now = new Date();
        const trTime = now.getTime() + (3 * 60 * 60 * 1000); 
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
        tarih_kodu: tarihKodu,
        gunun_indexi: secilenIndex, 
        id: gununBilgisi.id,
        kategori: gununBilgisi.kategori || "genel",
        bilgi: secilenMetin,
        dil: dil
    });
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
