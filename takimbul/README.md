# TakımBul · YaşarOBS için grup ödevi modülü (demo)

> **Ders projesi prototipidir.** Gerçek YaşarOBS'ye bağlı değildir, Yaşar Üniversitesi'nin resmi sistemi değildir. Tüm öğrenci, ders ve not verileri örnektir. Giriş için şifre istenmez.

> Örnek bölüm: **Elektrik-Elektronik Mühendisliği** (EEE 3401 Gömülü Sistem Tasarımı dönem projesi: *IoT Tabanlı Akıllı Enerji İzleme Sistemi*). Ders kodları ve isimler örnektir.

**Canlı demo:** https://emrehanvural.github.io/takimbul/
**Tanıtım videosu (İngilizce):** https://emrehanvural.github.io/takimbul/takimbul-demo-en.mp4

## Problem

Grup ödevlerinde iki sorun tekrar tekrar yaşanıyor:

1. **Ekipler şansa kalıyor.** Rastgele kurulan gruplarda bazı ekiplerde hiç tasarımcı ya da sunum yapabilen kimse olmuyor, üyelerin ortak boş saati bile olmuyor.
2. **İş yükü adil dağılmıyor.** İşi bir iki kişi yapıyor, "bedavacı" üyeler aynı notu alıyor ve öğretim üyesi bunu göremiyor.

## Çözüm: TakımBul

YaşarOBS'nin içine yerleşen yeni bir **İşbirliği** modülü.

### Öğrenci tarafı
- **Profil:** Öğrenci becerilerini (devre tasarımı & simülasyon, PCB & prototip, gömülü yazılım, MATLAB & sinyal analizi, teknik rapor, sunum) kendisi işaretler, boş saatlerini ders programından tek tıkla doldurur. Notlar hiçbir zaman kullanılmaz.
- **Ders geçmişiyle doğrulama:** "İyi" ve üstü beyanlar ilgili dersin tamamlanıp tamamlanmadığıyla kontrol edilir (ör. PCB → EEE 2202 Elektronik Laboratuvarı). Doğrulanmayan beyan yarım seviye düşük sayılır.
- **Arkadaş tercihi (isteğe bağlı):** Bir kişi seçilebilir; yalnızca karşılıklıysa aynı gruba konulur, tercih gizlidir.
- **Grup alanı:** "Neden bu grup?" açıklaması, önerilen roller, herkesin boş olduğu saatler ve ilk buluşma önerisi (.ics olarak takvime eklenir).
- **Görev panosu:** Görevler tek tıkla becerilere ve iş yüküne göre dağıtılır (Yapılacak / Devam ediyor / Bitti).
- **Grup sohbeti** ve **katkı dağılımı** grafiği.
- **Anonim akran değerlendirmesi:** Teslimde ekip arkadaşları yıldızla değerlendirilir.
- **Çalışma arkadaşı bul:** Gönüllü eşleşme; uyum skoru = %40 ortak boş saat + %25 aynı hedef + %15 çalışma tarzı + %20 birbirini tamamlayan beceriler.

### Öğretim üyesi tarafı
- **Grup ödevi oluşturma:** Grup büyüklüğü, teslim tarihi, her grupta bulunması gereken beceriler ve beceri dengesi/ortak zaman önceliği.
- **Akıllı gruplama (animasyonlu):** Rastgele bir dağılımdan başlar, öğrencileri ikişer ikişer takas ederek denge skorunu yükseltir. Sonuçta rastgele gruplamayla karşılaştırma gösterilir.
- **Gerçekçi kısıtlar ve dürüst uyarılar:** Öğrencilerin iş, ulaşım, kulüp gibi zaman kısıtları; karşılıklı tercihler; doğrulanmamış beyanlar dikkate alınır. Çözülemeyen durumlar (ör. sınıfta yeterli PCB bilen yoksa) açıkça uyarı olarak gösterilir.
- **Elle düzenleme:** Hoca iki öğrenciye tıklayarak yerlerini değiştirebilir; skor anında yeniden hesaplanır.
- **İzleme:** Grupların ilerlemesi, hareketsiz üyeler ve dağıtılmamış görevler için risk uyarıları; tek tıkla hatırlatma.
- **Katkı raporu:** Her üyenin tamamlanan iş payı ve anonim akran puanı yan yana. Not ayarlaması tamamen öğretim üyesinin kararıdır.

### Gruplama algoritması (özet)
Her grup için iki puan hesaplanır:
- **Beceri kapsamı:** Gerekli her beceri için gruptaki en yüksek *etkin* seviye (0–3; doğrulanmayan beyan −0,5).
- **Ortak zaman:** Tüm üyelerin boş olduğu saat sayısı (bir kişi eksik olan saatler kısmi puan alır).

Toplam skor = ağırlıklı ortalama − gruplar arası beceri farkı cezası − eksik beceri cezası − ortak saati olmayan grup cezası. Karşılıklı tercih eden öğrenciler takaslarda birlikte hareket eder. Birkaç rastgele başlangıçtan **yerel arama (hill climbing)** ile en iyi takaslar uygulanır. Kod: `app.js` içindeki `groupStats`, `partitionScore`, `optimize` fonksiyonları.

## Demo nasıl kullanılır?
1. Sayfayı açın, **Öğrenci olarak gir**'i seçin. TakımBul → Profilim'den becerileri ve boş saatleri kaydedin.
2. Üst menüdeki **Öğretim Üyesi** düğmesiyle rol değiştirin. **Yeni grup ödevi** → **Akıllı grupları oluştur** → **Yayınla**.
3. Öğrenciye dönün; bildirimden grup alanına gidin, görevleri dağıtın.
4. Sağ alttaki **Demo paneli** ile "Bir hafta ileri sar" diyerek ekiplerin ilerleyişini simüle edin; öğretim üyesi ekranında İzleme ve Katkı raporu sekmelerine bakın.
5. "Demo verilerini sıfırla" her şeyi başa alır. Veriler yalnızca tarayıcınızda (localStorage) tutulur.

## GitHub Pages'te yayınlama
1. GitHub'da yeni bir **public** depo oluşturun (ör. `takimbul`).
2. **Add file → Upload files** ile bu klasördeki her şeyi (`index.html`, `style.css`, `app.js`, `fonts/`, `README.md`) yükleyin ve **Commit changes** deyin.
3. **Settings → Pages → Build and deployment**: Source = *Deploy from a branch*, Branch = `main`, klasör = `/ (root)` → **Save**.
4. 1–2 dakika sonra site `https://KULLANICI-ADINIZ.github.io/takimbul/` adresinde yayında olur.

## Teknik
- Saf HTML + CSS + JavaScript; kütüphane, derleme adımı ya da sunucu gerekmez.
- Arayüz gerçek YaşarOBS'nin düzenine göre tasarlandı (üst bar, sol menü, bilgi kartları, Hızlı Erişim). Logo kullanılmadı; temsili bir amblem var.
- Yazı tipi (Nunito) depoda yerel olarak bulunur, internet olmadan da çalışır.
- Masaüstü ve mobil uyumlu.
