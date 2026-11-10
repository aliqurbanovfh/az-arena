# AZ Arena

Azərbaycan PUBG Mobile icması üçün sayt. Bu saytda bunlar var:

- screamlər və turnirlər
- çek şəkli ilə ödəniş və təsdiq
- otaq kodunun avtomatik açılması
- klanlar, komandalar və elanlar
- gizli baş admin və icazəli adminlər

Hər şey pulsuzdur:

- **GitHub Pages** saytı göstərir.
- **Supabase** qeydiyyatı, bazanı və çek şəkillərini saxlayır.

## Fayllar

| Fayl | Nədir |
|---|---|
| `index.html` | Saytın əsas səhifəsi |
| `css/style.css` | Görünüş |
| `js/app.js` | Saytın bütün işləri |
| `js/config.js` | **Sənin dəyişəcəyin yeganə fayl**: Supabase açarları və saytın adı |
| `supabase/schema.sql` | Baza: cədvəllər, icazələr, təhlükəsizlik qaydaları |
| `assets/icon.svg` | Sayt ikonu |

---

## Quraşdırma (təxminən 15 dəqiqə)

### 1. Supabase layihəsi yarat

1. [supabase.com](https://supabase.com) saytına daxil ol və **New project** düyməsini bas.
2. Region olaraq **Frankfurt (eu-central-1)** seç, çünki Bakıya ən yaxın odur.
3. Verilənlər bazası şifrəsini bir yerdə saxla.

### 2. E-poçt təsdiqini söndür

İstifadəçilər e-poçt olmadan, sadəcə istifadəçi adı və şifrə ilə qeydiyyatdan keçir. Bunun üçün bu ayarı söndür:

**Authentication → Sign In / Providers → Email**

- **Enable Email provider**: açıq qalsın.
- **Confirm email**: **söndür**.
- **Save** bas.

> Bunu etməsən, qeydiyyatdan keçən adamlar daxil ola bilməyəcək.

### 3. Bazanı qur

1. **SQL Editor → New query** aç.
2. `supabase/schema.sql` faylının hamısını kopyala və yapışdır.
3. **Run** bas.

Sonda "Success" görməlisən.

### 4. Açarları sayta yaz

1. Supabase-də **Project Settings → API Keys** bölməsini aç. Yaxud yuxarıdakı **Connect** düyməsini bas.
2. Bu iki şeyi kopyala:
   - **Project URL** (`https://....supabase.co`)
   - **anon** (və ya **publishable**) açarı
3. `js/config.js` faylını aç və onları `SUPABASE_URL` və `SUPABASE_ANON_KEY` yerinə yaz.

> ⚠️ **service_role** (və ya **secret**) açarını heç vaxt sayta yazma! O açar bütün qaydaları keçir.
> anon açarının saytda görünməsi isə normaldır.

### 5. GitHub Pages-ə yüklə

1. GitHub-da yeni repo yarat, məsələn `az-arena`.
2. Bu qovluqdakı bütün faylları yüklə. `index.html` reponun kökündə olmalıdır.
3. Reponun **Settings → Pages** bölməsinə keç.
4. **Source** olaraq **Deploy from a branch** seç, sonra `main` budağını və `/ (root)` qovluğunu seç. **Save** bas.
5. 1–2 dəqiqə gözlə. Sayt `https://<github-adın>.github.io/az-arena/` ünvanında açılacaq.

İstəsən, Supabase-də **Authentication → URL Configuration → Site URL** sahəsinə bu ünvanı yaz.

### 6. Baş admin ol

1. Saytda öz istifadəçi adınla qeydiyyatdan keç.
2. Supabase-də **SQL Editor** aç və bunu işlət. `SENIN_ADIN` yerinə öz istifadəçi adını yaz:

```sql
insert into public.staff (user_id, role)
select id, 'super_admin' from public.profiles where username = 'SENIN_ADIN';
```

3. Saytı yenilə. Menyuda **Admin** bölməsi görünəcək.
4. **Admin → Ayarlar** bölməsində bunları yaz:
   - Telegram qrupunun linki
   - yuxarıdakı elan zolağı
   - scream limitləri

### 7. Şəkil funksiyalarını aç (bir dəfə)

Supabase-də **SQL Editor** aç, `supabase/02-dizayn.sql` faylının hamısını yapışdır və **Run** bas. Bundan sonra:

- **Admin → Ayarlar → Qarşılama şəkilləri** bölməsindən ana səhifəyə 5-ə qədər öz PUBG ekran şəklini yükləyə bilərsən.
- Tədbir yaradanda **örtük şəkli** əlavə etmək olar. Şəkil olmasa, xəritəyə uyğun illüstrasiya göstərilir.

### 8. M10 və klan icazəsi (bir dəfə)

Supabase-də **SQL Editor** aç, `supabase/03-m10-klan.sql` faylını yapışdır və **Run** bas. Bundan sonra:

- Tədbir yaradanda kart nömrəsi, **M10 nömrəsi** və ya hər ikisi yazıla bilər. İkisi də olsa, oyunçu ödəniş üsulunu özü seçir, sən isə çekin yanında hansı üsulla ödədiyini görürsən.
- **Klanı** yalnız icazə verilən adamlar yarada bilər. İcazəni **Admin → İstifadəçilər → Klan icazəsi ver** düyməsi ilə baş admin və `squads` icazəli adminlər verir. Komanda (ekip) yaratmaq hər kəsə açıqdır.

### 9. Çat (bir dəfə)

Supabase-də **SQL Editor** aç, `supabase/04-chat.sql` faylını yapışdır və **Run** bas. Bundan sonra:

- **Çat** bölməsində hamı üçün ümumi çat açılır. Hər klan və komandanın da yalnız öz üzvlərinə görünən ayrıca çatı olur.
- 30 dəqiqədən köhnə mesajlar görünmür və avtomatik silinir: hər yeni mesajda, bir də hər 30 dəqiqədən bir.
- Spam qarşısını almaq üçün bir adam 2 saniyədə bir mesajdan çox yaza bilməz.
- Bloklanmış adam yaza bilmir. `moderation` icazəli adminlər istənilən mesajı silə bilir.

Mesajlar canlı gəlmirsə, **Database → Publications → supabase_realtime** bölməsində `messages` cədvəlinin işarələndiyini yoxla. İşarələnməsə də, çat hər 10 saniyədən bir yenilənir.

### 10. Təhlükəsizlik (artıq qurulub)

`supabase/05-tehlukesizlik.sql` və `supabase/functions/guard` Supabase-də artıq işləyir:

- **Tor:** sayt hər açılışda serverdən IP-ni yoxlayır. IP Tor çıxış nöqtəsidirsə, "Tor ilə giriş qadağandır" ekranı çıxır və hesabdan çıxış edilir.
- **DevTools (F12):** F12, Ctrl+Shift+I/J/C, Ctrl+U və sağ klik bağlıdır. Açıq DevTools da tutulur. 1-ci və 2-ci dəfə xəbərdarlıq verilir, 3-cü dəfə hesab avtomatik bloklanır və yalnız admin aça bilər. Adminlərə bu yoxlama tətbiq olunmur.
- **IP:** hər daxil olmuş istifadəçinin IP ünvanları qeydə alınır. **Admin → İstifadəçilər** bölməsində IP-yə basanda bütün IP-ləri və **eyni IP-dən açılmış digər hesabları** görürsən (multi-hesabları tutmaq üçün). Baş adminin IP-sini yalnız baş admin görür.
- **Admin → İcmal → Təhlükəsizlik** bölməsində son Tor və F12 hadisələri kimin etdiyi ilə birgə görünür.

Qeyd: bu yoxlamalar adi istifadəçiləri dayandırır. Bilikli adam onları keçə bilər, amma məlumatları onsuz da bazadakı qaydalar qoruyur.

---

## Necə işləyir

### Scream və turnir

- **Scream**: hər qeydiyyatlı istifadəçi yarada bilər. Giriş haqqı və yer sayı limitlidir. Limitləri baş admin **Ayarlar** bölməsində dəyişir (standart: ən çox 2 ₼, 100 yer, eyni anda 3 açıq scream).
- **Turnir**: yalnız `events` icazəli adminlər və **təşkilatçı** statuslu istifadəçilər yarada bilər. Bu statusu `organizers` icazəli admin verir.

Bir tədbirin gedişatı belədir:

1. Təşkilatçı tədbiri yaradır: vaxt, giriş haqqı, kart nömrəsi, yer sayı, mükafat.
2. Oyunçu pulu karta köçürür və çekin şəklini yükləyir. Şəkil avtomatik kiçildilir, belə ki yer az tutur. Statusu "gözləmədə" olur.
3. Təşkilatçı (və ya `payments` icazəli admin) çekə baxır və **Təsdiqlə** və ya **Ləğv et** düyməsini basır. Ləğv edəndə səbəb yazır və oyunçu yeni çek göndərə bilir.
4. Təşkilatçı tədbir səhifəsində otaq ID və şifrəsini yazır.
5. Başlamağa X dəqiqə qalmış (standart 10) kod **yalnız təsdiqlənmiş oyunçulara** açılır. Bunu baza özü yoxlayır, kodu başqası heç cür görə bilməz.
6. Pulsuz tədbirdə (0 ₼) çek tələb olunmur, qoşulan dərhal təsdiqlənir.

### Rollar və icazələr

| Rol | Nə edə bilər |
|---|---|
| **Baş admin** (sən) | Hər şeyi. Admin təyin edir, icazələri seçir, adminliyi götürür. |
| **Admin** | Yalnız sənin verdiyin icazələri. Başqasına adminlik verə **bilməz**. |
| **Təşkilatçı** | Böyük turnir yarada bilər. |
| **İstifadəçi** | Scream yaradır, qoşulur, klan/komanda qurur, elan yerləşdirir. |

Admin icazələri:

- `payments`: bütün tədbirlərdə ödənişləri yoxlamaq
- `events`: bütün tədbirləri idarə etmək və turnir yaratmaq
- `organizers`: təşkilatçı statusu vermək
- `users`: bloklamaq və şifrə sıfırlamaq
- `moderation`: elanlar və şikayətlər
- `squads`: klan və komandaları idarə etmək
- `audit`: əməliyyat jurnalına baxmaq

### Baş adminin gizliliyi

Sənin kimliyin bu yerlərdə gizlidir:

- **Admin siyahısında**: digər adminlər səni görmür.
- **Jurnalda**: sənin etdiklərin "Sistem" kimi yazılır.
- **Ödəniş təsdiqlərində**: kimin təsdiqlədiyi oyunçuya göstərilmir.
- Heç kim səni bloklaya bilməz, şifrəni dəyişə bilməz.

Amma öz hesabınla tədbir və ya elan yaratsan, adi istifadəçi kimi "yaradan" olaraq görünəcəksən. Böyük turnirləri ayrıca hesabdan açmaq daha yaxşıdır. Məsələn, `azarena` adlı hesab yarat və ona admin ver. Tədbir formunda **"Təşkilatçı kimi göstərilən ad"** sahəsinə də "AZ Arena" yaza bilərsən.

### Şifrəsini unudan istifadəçi

E-poçt olmadığı üçün şifrəni admin sıfırlayır:

1. **Admin → İstifadəçilər** bölməsini aç.
2. Adamı tap və **Şifrə təyin et** düyməsini bas.
3. Yeni şifrəni adama özün çatdır.

### Klanlar və komandalar

- **Klan** 100 nəfərə, **komanda (ekip)** 6 nəfərə qədərdir (4 əsas + 2 ehtiyat).
- Hər oyunçu yalnız 1 klanda və 1 komandada ola bilər.
- Oyunçu qoşulma sorğusu göndərir, lider və ya zabit onu qəbul edir.
- Lider liderliyi başqasına verə, üzvü zabit edə və ya çıxara bilər.

### Elanlar

Bölmələr bunlardır:

- hesab satışı
- hesab icarəsi
- komanda axtarıram
- komandaya oyunçu
- klana üzv qəbulu
- digər

Elanlar 30 gündən sonra avtomatik gizlənir. Müəllif onları uzada bilər. Hər adamın eyni anda ən çox 5 aktiv elanı ola bilər.

Hesab satışı və icarəsi bölmələrində xəbərdarlıq göstərilir: bu, PUBG Mobile qaydalarına ziddir və sayt ödənişlərə zəmanət vermir. Şübhəli elanları istifadəçilər şikayət edir, moderatorlar **Admin → Şikayətlər** bölməsində baxır.

---

## Pulsuz limitlər (Supabase Free)

Bu limitlər dəyişə bilər. Dəqiq rəqəmlər üçün supabase.com/pricing səhifəsinə bax.

- **Baza:** 500 MB. Bu, yüz minlərlə tədbir və qoşulmaya kifayət edir.
- **Fayl yaddaşı:** 1 GB. Bir çek təxminən 100–250 KB tutur, yəni bir neçə min çek sığar. Köhnə çekləri **Storage → receipts** bölməsindən qovluq-qovluq silə bilərsən.
- **Fasilə:** 1 həftə heç kim sayta girməsə, layihə "pause" olur. Supabase panelində **Restore** düyməsini basmaq kifayətdir.

---

## Bazanı sıfırlamaq (yalnız lazım olsa)

`schema.sql` faylını ikinci dəfə işlətmək lazım olsa, əvvəlcə bunu işlət. **Bütün məlumatlar silinir!**

```sql
drop trigger if exists on_auth_user_created on auth.users;
drop policy if exists receipts_upload on storage.objects;
drop policy if exists receipts_read on storage.objects;
drop policy if exists receipts_delete_own on storage.objects;
drop table if exists public.audit_log, public.reports, public.listings, public.squad_members, public.squads,
  public.event_entries, public.event_secrets, public.events, public.settings, public.staff, public.profiles cascade;
```

Bundan sonra **Authentication → Users** bölməsindən köhnə istifadəçiləri də sil. Sonra `schema.sql` faylını yenidən işlət.

---

## Növbəti mərhələ üçün təkliflər

- **Telegram bot**. Bu funksiyalar olar:
  - "Ödənişin təsdiqləndi" və "Otaq kodu açıldı" bildirişləri
  - təşkilatçıya "Yeni çek gəldi" bildirişi
  - Telegram vasitəsilə şifrə bərpası

  Bu, Supabase Edge Function ilə pulsuz qurulur.
- **Reytinq cədvəli**: turnir qaliblərinə xal vermək və aylıq ən yaxşı oyunçular.
- **Turnir cədvəli (bracket)** və raund-raund xal sistemi.
- **Etibarlı satıcı nişanı** və adminin vasitəçi olduğu satış.
