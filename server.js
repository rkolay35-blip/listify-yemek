const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const haftalikMenuData = require('./data/endogru_haftalik_menuler.json');
const yemeklerData = require('./data/endogru_tarifler.json');

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`<h1>Listify API v5.1 🚀</h1>`);
});

// --- 1. ENDPOINT: Haftalık Menü (AYNI KALDI) ---
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
            baslik: secilenMenu.baslik,
            yemekler: secilenMenu.yemekler
        });
    } catch (error) {
        res.status(500).json({ hata: "Sunucu hatası." });
    }
});

// --- 2. ENDPOINT: Yemekler (GELİŞMİŞ SÜRE MANTIĞI EKLENDİ) ---
app.get('/api/yemekler', (req, res) => {
    let liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;
    const { id, yemek_adi, ana_kategori, kategori, etiketler, hazirlama_suresi } = req.query;

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

    // --- DÜZELTİLEN KISIM: SÜRE FİLTRESİ ---
    if (hazirlama_suresi) {
        // Kullanıcının girdiği değeri sayıya çevir (Örn: "30" -> 30)
        const maksimumSure = parseInt(hazirlama_suresi);

        if (!isNaN(maksimumSure)) {
            liste = liste.filter(y => {
                if (!y.hazirlama_suresi) return false;

                // JSON'daki "90 dakika" yazısını sayıya çevirir. 
                // JavaScript parseInt("90 dakika") dediğinde otomatik "90" sonucunu verir.
                const yemekSuresi = parseInt(y.hazirlama_suresi);

                // MANTIK: Yemek süresi, kullanıcının girdiği süreden KÜÇÜK veya EŞİT ise getir.
                // Yani ?hazirlama_suresi=30 dersen, 20 dk'lık yemek de gelir, 30 dk'lık da gelir.
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

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
