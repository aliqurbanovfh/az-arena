// =====================================================================
//  AZ Arena — ayarlar
//  Supabase → Project Settings → API (və ya "Connect") bölməsindən
//  "Project URL" və "anon / publishable" açarını bura yapışdır.
//  Bu açar gizli deyil, saytda görünməsi normaldır — təhlükəsizliyi
//  bazadakı qaydalar (schema.sql) qoruyur.
//  "service_role" / "secret" açarını HEÇ VAXT bura yazma!
// =====================================================================

window.CONFIG = {
  SITE_NAME: 'AZ Arena',

  SUPABASE_URL: 'https://XXXX.supabase.co',
  SUPABASE_ANON_KEY: 'XXXX',

  // İstifadəçilər e-poçt olmadan, istifadəçi adı ilə qeydiyyatdan keçir.
  // Supabase daxildə "istifadəçiadı@<bu domen>" formasında saxlayır.
  // Sayt işə düşəndən sonra bunu DƏYİŞMƏ, yoxsa köhnə hesablar daxil ola bilməz.
  LOGIN_EMAIL_DOMAIN: 'azarena.app',
};
