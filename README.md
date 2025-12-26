# TempShare

TempShare, geçici dosya paylaşımı için geliştirilmiş hafif ve güvenli bir web uygulamasıdır. Dosya yükleyip, zaman (örn. 1 saat) veya indirme sayısı (örn. 1 veya 3) ile otomatik olarak sona eren tek kullanımlık bir indirme bağlantısı alırsınız. Bağlantılar sahteciliği önlemek için HMAC ile imzalanır ve isteğe bağlı şifre koruması mevcuttur. Alıcılar dosya detaylarını (isim/boyut ve kalan süre/indirme hakkı) görür; kurallar sağlanırsa ve şifre doğruysa indirme başlar, aksi halde sayfa süre dolması veya limit aşımını açıkça bildirir.

Servisin güvenilir kalması için self-healing özellikler ekledik: health check'ler (`/healthz`, `/readyz`), graceful shutdown, otomatik yeniden başlatma (Docker/PM2) ve süresi dolmuş kayıtların temizlenmesi sistemin manuel müdahale olmadan kendini toparlamasına yardımcı olur. Kötüye kullanımı önlemek için rate limiting, net hata mesajları ve hassas bilgilerin dikkatli işlenmesi (düz metin saklama yok; şifreler sadece bcrypt hash'leri olarak saklanır) kullanılır.

## Özellikler
- Dosya yükleme → imzalı bağlantı → doğrulanmış indirme akışı
- Zaman/indirme limitleri ve isteğe bağlı şifre koruması
- Güvenli kodlama: input validation, hash'lenmiş şifreler, güvenlik başlıkları (CSP, Referrer-Policy, NoSniff)
- Self-healing: health check'ler, graceful shutdown, otomatik yeniden başlatma, süresi dolmuş kayıt temizliği
- Sade arayüz: yükleme sayfası + tek dosya sayfası net durum mesajlarıyla
- Kötüye kullanım önleme: rate limiting ve temel audit log'ları (hassas veri log'lanmaz)

## Teknolojiler
- **Frontend:** HTML/CSS ve minimal JavaScript
- **Backend:** Node.js + Express (yükleme, imzalı token'lar, indirme)
- **Veritabanı:** SQLite (tek dosya, sıfır yapılandırma)
- **Güvenlik:** HMAC-imzalı bağlantılar, bcrypt ile şifre hash'leme, güvenlik başlıkları
- **Operasyonlar:** Docker veya PM2 ile otomatik yeniden başlatma; `/healthz` ve `/readyz` health check'leri

## Kurulum ve Çalıştırma

### Gereksinimler
- Node.js v18 veya üzeri (önerilen: v20+)
- npm (Node.js ile birlikte gelir)

### Hızlı Başlangıç

1. **Projeyi klonlayın veya indirin**
   ```bash
   cd database
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```
   
   > **Not:** `better-sqlite3` native modül olduğu için farklı Node.js sürümlerinde sorun çıkabilir. Hata alırsanız `node_modules` ve `package-lock.json` dosyalarını silip tekrar `npm install` çalıştırın.

3. **Sunucuyu başlatın**
   ```bash
   node index.js
   ```

4. **Tarayıcıda açın**
   - Ana sayfa: `http://localhost:3000`
   - İndirme sayfası: `http://localhost:3000/download.html?token=...`

### Sorun Giderme

**"NODE_MODULE_VERSION" hatası:**
- `node_modules` klasörünü silin ve `npm install` çalıştırın
- Projeyi paylaşırken `node_modules` klasörünü dahil etmeyin

**Port 3000 kullanımda:**
- `PORT` environment variable'ını değiştirin veya başka bir port kullanan servisi durdurun