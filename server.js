const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Flutter erişimi için izin

// --- DOSYALARI İÇERİ AL (IMPORT) ---
// data klasörünün içindeki iki dosyayı da çağırıyoruz
const haftalikMenuData = require('./data/endogru_haftalik_menuler.json');
const yemeklerData = require('./data/endogru_tarifler.json');

const PORT = process.env.PORT || 3000;

// --- YARDIMCI FONKSİYON: Tarif Bulucu ---
// Menüdeki yemek ismine göre tarif detayını bulur
function tarifDetayiBul(yemekIsmi) {
    if (!yemekIsmi) return null;
    
    // Veri yapısı kontrolü: { "yemekler": [...] } mi yoksa direkt [...] mi?
    const tumYemekler = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;

    // Tam eşleşme veya içerik eşleşmesi (Büyük/küçük harf duyarsız)
    const bulunan = tumYemekler.find(y => 
        y.ad && y.ad.toLowerCase() === yemekIsmi.toLowerCase()
    );

    return bulunan || { ad: yemekIsmi, tarif: "Tarif bulunamadı." };
}

// --- ANA SAYFA ---
app.get('/', (req, res) => {
    res.send(`
        <h1>Listify API Çalışıyor 🚀</h1>
        <p>Endpointler:</p>
        <ul>
            <li><a href="/api/haftalik-menu">/api/haftalik-menu</a> (Tüm Liste)</li>
            <li><a href="/api/haftalik-menu?gun=1">/api/haftalik-menu?gun=1</a> (Gün Detayı ve Tarifler)</li>
            <li><a href="/api/yemekler">/api/yemekler</a> (Tüm Yemek Arşivi)</li>
        </ul>
    `);
});

// --- 1. ENDPOINT: Haftalık Menü (GÜNCELLENDİ) ---
// Kullanım: 
// - Tüm liste: /api/haftalik-menu
// - Özel Gün: /api/haftalik-menu?gun=8 (Versiyon 2, 1. Gün)
app.get('/api/haftalik-menu', (req, res) => {
    // JSON yapısının dizi mi yoksa nesne mi olduğunu garantiye alalım
    const menuler = haftalikMenuData.menuler ? haftalikMenuData.menuler : haftalikMenuData;
    
    const gunParam = req.query.gun;

    // A) Eğer ?gun=X parametresi YOKSA tüm listeyi döndür (Eski hali)
    if (!gunParam) {
        return res.json(menuler);
    }

    // B) Eğer ?gun=X parametresi VARSA
    const istenenGun = parseInt(gunParam);

    if (isNaN(istenenGun) || istenenGun < 1) {
        return res.status(400).json({ hata: "Geçersiz gün değeri. Lütfen sayı girin." });
    }

    // --- MANTIK: 14 GÜNLÜK DÖNGÜ ---
    // Eğer menü listen 14 elemanlıysa (7 gün v1 + 7 gün v2):
    // gun=1 -> index 0
    // gun=8 -> index 7
    // gun=15 -> index 0 (Başa döner - Modulo işlemi)
    const index = (istenenGun - 1) % 14; 
    
    // İlgili günün menüsünü al
    let secilenMenu = menuler[index];

    if (!secilenMenu) {
        return res.status(404).json({ mesaj: "Bu güne ait menü verisi bulunamadı." });
    }

    // --- TARİFLERİ İÇERİ GÖMME (ENRICHMENT) ---
    // Menüdeki yemek isimlerini alıp, tarif detaylarını içine ekliyoruz.
    // Örnek: Menüde sadece "Mercimek Çorbası" yazar, biz buraya tarifini ekleyeceğiz.
    
    // Yeni bir obje oluşturup orijinal veriyi bozmadan detayları ekleyelim
    const detayliMenu = {
        ...secilenMenu,
        istenen_gun_kodu: istenenGun,
        versiyon_bilgisi: index < 7 ? "Versiyon 1" : "Versiyon 2",
        
        // Menüdeki yemekleri (Örn: corba, ana_yemek, yan_yemek) bulup detaylandırıyoruz
        // NOT: JSON'daki anahtar isimlerine göre burayı düzenleyebilirsin.
        yemek_detaylari: {
            corba: tarifDetayiBul(secilenMenu.corba),      // JSON'da key 'corba' ise
            ana_yemek: tarifDetayiBul(secilenMenu.ana_yemek), // JSON'da key 'ana_yemek' ise
            yan_yemek: tarifDetayiBul(secilenMenu.yan_yemek), // JSON'da key 'yan_yemek' ise
            tatli: tarifDetayiBul(secilenMenu.tatli)       // JSON'da key 'tatli' ise
        }
    };

    res.json(detayliMenu);
});

// --- 2. ENDPOINT: Yemekler (Akıllı Filtreleme ile) ---
app.get('/api/yemekler', (req, res) => {
    const kategori = req.query.kategori;
    const liste = yemeklerData.yemekler ? yemeklerData.yemekler : yemeklerData;

    if (kategori) {
        const filtrelenmis = liste.filter(y => 
            y.kategori && y.kategori.toLowerCase().includes(kategori.toLowerCase())
        );
        res.json(filtrelenmis);
    } else {
        res.json(liste);
    }
});

// --- 3. ENDPOINT: Tek Yemek Detayı ---
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
    console.log(`Sunucu ${PORT} portunda data klasörü ile çalışıyor.`);
});
