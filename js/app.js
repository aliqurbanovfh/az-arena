/* =====================================================================
   AZ Arena — sayt proqramı (GitHub Pages + Supabase)
   Səhifələr: ana, tədbirlər, tədbir, klanlar, elanlar, profil, admin
   ===================================================================== */
(function () {
  'use strict';

  const C = window.CONFIG || {};
  const SITE = C.SITE_NAME || 'AZ Arena';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const app = $('#app');

  // ------------------------------------------------------------------
  // İkonlar
  // ------------------------------------------------------------------
  const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    home: svg('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>'),
    zone: svg('<circle cx="12" cy="12" r="8.5" stroke-dasharray="3 2.6"/><circle cx="13.5" cy="10.5" r="4"/>'),
    users: svg('<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16 14.2c2.4.1 4 1.7 4.5 4.3"/>'),
    board: svg('<path d="M4 10v4h3l7 4V6l-7 4H4z"/><path d="M17.5 9.5a3.5 3.5 0 0 1 0 5"/>'),
    user: svg('<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/>'),
    copy: svg('<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'),
    x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    lock: svg('<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    flag: svg('<path d="M5.5 21V4.5"/><path d="M5.5 4.5h11l-2 4 2 4h-11"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    cash: svg('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>'),
    shield: svg('<path d="M12 3l7.5 3v6c0 4.5-3.2 7.6-7.5 9-4.3-1.4-7.5-4.5-7.5-9V6z"/>'),
    list: svg('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'),
    gear: svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
    trophy: svg('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4c0 3 1.5 4.5 3.5 4.5M17 6h3c0 3-1.5 4.5-3.5 4.5M12 14v4M8 20h8"/>'),
    image: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5-8 8.5"/>'),
  };

  // ------------------------------------------------------------------
  // Köməkçilər
  // ------------------------------------------------------------------
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
  const fmtHM = (d) => { d = new Date(d); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const dayDiff = (d) => { const a = new Date(d); a.setHours(0, 0, 0, 0); const b = new Date(); b.setHours(0, 0, 0, 0); return Math.round((a - b) / 864e5); };
  const fmtDay = (d) => { const k = dayDiff(d); if (k === 0) return 'Bu gün'; if (k === 1) return 'Sabah'; if (k === -1) return 'Dünən'; const x = new Date(d); return x.getDate() + ' ' + MONTHS[x.getMonth()]; };
  const fmtFull = (d) => fmtDay(d) + ', ' + fmtHM(d);
  const fmtDate = (d) => { const x = new Date(d); return x.getDate() + ' ' + MONTHS[x.getMonth()] + ' ' + x.getFullYear(); };
  const fmtAgo = (d) => {
    const s = Math.max(0, (Date.now() - Date.parse(d)) / 1000);
    if (s < 60) return 'indicə';
    if (s < 3600) return Math.floor(s / 60) + ' dəq əvvəl';
    if (s < 86400) return Math.floor(s / 3600) + ' saat əvvəl';
    if (s < 86400 * 30) return Math.floor(s / 86400) + ' gün əvvəl';
    return fmtDate(d);
  };
  const split = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return { d: Math.floor(s / 86400), t: pad(Math.floor((s % 86400) / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60) }; };
  const leftText = (ms) => { const f = split(ms); return (f.d ? f.d + ' gün ' : '') + f.t; };
  const toLocalInput = (iso) => { const d = new Date(iso); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const money = (n) => { const v = Number(n || 0); return v === 0 ? 'Pulsuz' : v.toFixed(2) + ' ₼'; };
  const tgHandle = (t) => (t || '').replace(/^@/, '').trim();
  const toEmail = (u) => `${u}@${C.LOGIN_EMAIL_DOMAIN || 'azarena.app'}`;

  const KIND = { scream: 'Scream', tournament: 'Turnir' };
  const STATUS = { open: 'Qeydiyyat açıq', closed: 'Qeydiyyat bağlı', finished: 'Bitib', cancelled: 'Ləğv edilib' };
  const ENTRY = { pending: 'Gözləmədə', approved: 'Təsdiqləndi', rejected: 'Ləğv edildi' };
  const SQUAD = { clan: 'Klan', team: 'Komanda' };
  const ROLE = { leader: 'Lider', officer: 'Zabit', member: 'Üzv' };
  const CATS = {
    account_sale: 'Hesab satışı', account_rent: 'Hesab icarəsi', looking_for_team: 'Komanda axtarıram',
    looking_for_players: 'Komandaya oyunçu', clan_recruit: 'Klana üzv qəbulu', other: 'Digər',
  };
  const PERMS = {
    payments: 'Ödənişləri yoxlamaq (bütün tədbirlərdə)',
    events: 'Bütün tədbirləri idarə etmək, böyük turnir yaratmaq',
    organizers: 'İstifadəçilərə turnir təşkilatçısı icazəsi vermək',
    users: 'İstifadəçiləri bloklamaq və şifrə sıfırlamaq',
    moderation: 'Elanlar və şikayətlər',
    squads: 'Klan və komandaları idarə etmək',
    audit: 'Əməliyyat jurnalına baxmaq',
  };
  const MODES = ['Solo TPP', 'Duo TPP', 'Squad TPP', 'Solo FPP', 'Duo FPP', 'Squad FPP', 'TDM', 'Arena', 'Digər'];
  const MAPS = ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik', 'Karakin', 'Rondo', 'Nusa', 'TDM xəritəsi', 'Digər'];

  function errMsg(e) {
    const m = (e && (e.message || e.error_description || e.msg)) || String(e || '');
    const map = [
      [/Invalid login credentials/i, 'İstifadəçi adı və ya şifrə yanlışdır'],
      [/already registered|already been registered|User already exists/i, 'Bu istifadəçi adı artıq tutulub'],
      [/Password should be at least/i, 'Şifrə ən azı 6 simvol olmalıdır'],
      [/Email not confirmed/i, 'Hesab təsdiqlənməyib. Admin: Supabase-də "Confirm email" söndürülməlidir.'],
      [/Signups not allowed/i, 'Qeydiyyat hazırda bağlıdır'],
      [/rate limit|too many requests/i, 'Çox tez-tez cəhd edirsiniz, bir az gözləyin'],
      [/row-level security|permission denied/i, 'Bu əməliyyat üçün icazəniz yoxdur'],
      [/squads_name_uq/i, 'Bu adda qrup artıq var'],
      [/squad_one_per_kind/i, 'Bu oyunçu artıq başqa qrupdadır'],
      [/reports_reporter_id_target_type_target_id_key/i, 'Bu barədə artıq şikayət göndərmisiniz'],
      [/event_entries_event_id_user_id_key/i, 'Siz artıq bu tədbirə qoşulmusunuz'],
      [/duplicate key/i, 'Bu artıq mövcuddur'],
      [/violates check constraint/i, 'Məlumatlardan biri düzgün deyil (uzunluğu və ya formatı yoxlayın)'],
      [/Failed to fetch|NetworkError|Load failed/i, 'İnternet bağlantısını yoxlayın'],
      [/Database error saving new user/i, 'Qeydiyyat alınmadı: istifadəçi adı tutulmuş ola bilər'],
      [/JWT expired/i, 'Sessiya bitib, yenidən daxil olun'],
      [/cover_url|hero_images|Bucket not found/i, 'Şəkil funksiyası hələ aktiv deyil: Supabase-də supabase/02-dizayn.sql faylını işlədin'],
      [/exceeded the maximum allowed size|Payload too large/i, 'Şəkil çox böyükdür'],
    ];
    for (const [re, t] of map) if (re.test(m)) return t;
    return m || 'Xəta baş verdi';
  }

  // ------------------------------------------------------------------
  // Ayar yoxlaması
  // ------------------------------------------------------------------
  const configured = /^https:\/\//.test(C.SUPABASE_URL || '') && !/XXXX/.test(C.SUPABASE_URL) &&
    C.SUPABASE_ANON_KEY && C.SUPABASE_ANON_KEY !== 'XXXX';
  if (!configured || !window.supabase) {
    app.innerHTML = `<div class="panel stack" style="max-width:620px;margin:30px auto">
      <h1>Sayt hələ qoşulmayıb</h1>
      <p class="muted">${!window.supabase ? 'Supabase kitabxanası yüklənmədi. İnternet bağlantısını yoxlayın.' :
        '<b>js/config.js</b> faylında Supabase layihənizin <b>URL</b> və <b>anon/publishable</b> açarını yazın. Addımlar README faylındadır.'}</p></div>`;
    return;
  }
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);

  // ------------------------------------------------------------------
  // Vəziyyət
  // ------------------------------------------------------------------
  const blankAccess = () => ({ role: 'user', permissions: [], is_organizer: false, is_banned: false, ban_reason: null });
  const S = { session: null, profile: null, access: blankAccess(), settings: {}, pending: 0 };
  const uid = () => (S.session && S.session.user && S.session.user.id) || null;
  const isSuper = () => S.access.role === 'super_admin';
  const hasPerm = (p) => isSuper() || (S.access.permissions || []).includes(p);
  const canHost = () => hasPerm('events') || !!S.access.is_organizer;
  const banned = () => !!S.access.is_banned;

  async function loadSettings() {
    const { data } = await sb.from('settings').select('*').eq('id', 1).maybeSingle();
    S.settings = data || {};
  }
  async function loadMe() {
    if (!uid()) { S.profile = null; S.access = blankAccess(); S.pending = 0; return; }
    const [p, a] = await Promise.all([
      sb.from('profiles').select('*').eq('id', uid()).maybeSingle(),
      sb.rpc('get_my_access'),
    ]);
    S.profile = p.data || null;
    S.access = Object.assign(blankAccess(), a.data || {});
    await loadPending();
  }
  async function loadPending() {
    S.pending = 0;
    if (!uid() || !hasPerm('payments')) return;
    const { count } = await sb.from('event_entries').select('id', { count: 'exact', head: true }).eq('status', 'pending');
    S.pending = count || 0;
  }

  // ------------------------------------------------------------------
  // Bildiriş və pəncərələr
  // ------------------------------------------------------------------
  function toast(msg, type = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), type === 'bad' ? 5000 : 3000);
  }

  // ask({ title, text, input, placeholder, required, html, collect(root), ok, okClass })
  function ask(o) {
    return new Promise((resolve) => {
      const root = $('#modal-root');
      root.innerHTML = `<div class="modal-back" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><div class="modal">
        <div class="modal-head"><h3>${esc(o.title)}</h3><button type="button" class="icon-btn" data-m="x" aria-label="Bağla">${I.x}</button></div>
        ${o.text ? `<p class="muted">${esc(o.text)}</p>` : ''}
        ${o.input ? `<div class="field" style="margin-top:12px"><${o.input === 'line' ? 'input type="text"' : 'textarea rows="3"'} id="m-input" placeholder="${esc(o.placeholder || '')}"${o.input === 'line' ? '>' : '></textarea>'}</div>` : ''}
        ${o.html || ''}
        <div class="form-actions">${o.ok === false ? '' : `<button type="button" class="btn ${o.okClass || 'btn-primary'}" data-m="ok">${esc(o.ok || 'Təsdiqlə')}</button>`}
        <button type="button" class="btn btn-ghost" data-m="x">${o.ok === false ? 'Bağla' : 'İmtina'}</button></div>
      </div></div>`;
      const back = root.firstElementChild;
      const done = (v) => { root.innerHTML = ''; document.removeEventListener('keydown', onKey); resolve(v); };
      const onKey = (e) => { if (e.key === 'Escape') done(null); };
      document.addEventListener('keydown', onKey);
      back.addEventListener('click', (e) => {
        if (e.target === back) return done(null);
        const b = e.target.closest('[data-m]');
        if (!b) return;
        if (b.dataset.m === 'x') return done(null);
        if (o.collect) { const v = o.collect(back); if (v !== undefined) done(v); return; }
        if (o.input) {
          const v = $('#m-input').value.trim();
          if (o.required && !v) { $('#m-input').focus(); return; }
          return done(v);
        }
        done(true);
      });
      if (o.onOpen) o.onOpen(back, done);
      setTimeout(() => { const f = o.input ? $('#m-input') : back.querySelector('[data-m=ok]') || back.querySelector('[data-m=x]'); if (f) f.focus(); }, 30);
    });
  }
  const confirmAsk = (title, text, ok = 'Bəli', okClass = 'btn-primary') => ask({ title, text, ok, okClass });

  // Çek şəklinə baxmaq (istəyə görə təsdiq/ləğv düymələri ilə)
  async function showReceipt(entry, onDecide) {
    if (!entry.receipt_path) return toast('Bu sorğuda çek yoxdur');
    const { data, error } = await sb.storage.from('receipts').createSignedUrl(entry.receipt_path, 600);
    if (error) return toast(errMsg(error), 'bad');
    const who = entry.profile ? `${entry.profile.nick} (@${entry.profile.username})` : entry.pubg_nick;
    await ask({
      title: 'Çek: ' + (who || ''),
      html: `<img src="${esc(data.signedUrl)}" alt="Ödəniş çeki">
        <p class="small muted" style="margin-top:10px">PUBG ID: ${esc(entry.pubg_id || '—')}${entry.team_name ? ', komanda: ' + esc(entry.team_name) : ''}. Göndərilib: ${fmtAgo(entry.created_at)}</p>
        ${onDecide && entry.status !== 'approved' ? `<div class="row" style="margin-top:12px"><button type="button" class="btn btn-ok" data-dec="1">Təsdiqlə</button><button type="button" class="btn btn-bad" data-dec="0">Ləğv et</button></div>` : ''}`,
      ok: false,
      onOpen: (root, done) => {
        root.addEventListener('click', async (e) => {
          const b = e.target.closest('[data-dec]');
          if (!b) return;
          done(null);
          await onDecide(b.dataset.dec === '1');
        });
      },
    });
  }

  async function reviewEntry(id, approve) {
    let reason = null;
    if (!approve) {
      reason = await ask({ title: 'Sorğunu ləğv et', text: 'Səbəb oyunçuya görünəcək. O, yeni çek göndərə biləcək.', input: true, placeholder: 'Məs: çekdə məbləğ düzgün deyil', ok: 'Ləğv et', okClass: 'btn-bad' });
      if (reason === null) return false;
    }
    const { error } = await sb.rpc('review_entry', { p_entry: id, p_approve: approve, p_reason: reason || null });
    if (error) { toast(errMsg(error), 'bad'); return false; }
    toast(approve ? 'Təsdiqləndi' : 'Ləğv edildi', 'ok');
    await loadPending();
    return true;
  }

  async function report(type, id) {
    if (!uid()) { location.hash = '#/login'; return; }
    const reason = await ask({ title: 'Şikayət et', text: 'Nə baş verdiyini qısaca yaz. Şikayəti yalnız moderatorlar görür.', input: true, required: true, placeholder: 'Məs: pulu aldı, hesabı vermədi', ok: 'Göndər', okClass: 'btn-bad' });
    if (!reason) return;
    const { error } = await sb.from('reports').insert({ target_type: type, target_id: id, reason });
    error ? toast(errMsg(error), 'bad') : toast('Şikayət göndərildi', 'ok');
  }

  // Formu "gözləyin" vəziyyətinə salıb funksiyanı icra edir
  async function busy(el, fn) {
    const btn = el.tagName === 'FORM' ? el.querySelector('button:not([type=button])') : el;
    const old = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Gözləyin…'; }
    try { return await fn(); } catch (e) { console.error(e); toast(errMsg(e), 'bad'); } finally {
      if (btn && btn.isConnected) { btn.disabled = false; btn.innerHTML = old; }
    }
  }

  // ------------------------------------------------------------------
  // Şəkil sıxılması və yüklənməsi
  // ------------------------------------------------------------------
  function compressImage(file, max = 1400, q = 0.82) {
    return new Promise((res, rej) => {
      if (!file || !/^image\//.test(file.type)) return rej(new Error('Şəkil faylı seçin (JPG və ya PNG)'));
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob((b) => { URL.revokeObjectURL(url); b ? res(b) : rej(new Error('Şəkil oxunmadı')); }, 'image/jpeg', q);
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Şəkil oxunmadı. JPG və ya PNG seçin.')); };
      img.src = url;
    });
  }
  async function uploadReceipt(eventId, file) {
    const blob = await compressImage(file);
    if (blob.size > 3 * 1024 * 1024) throw new Error('Şəkil çox böyükdür');
    const path = `${uid()}/${eventId}/${Date.now()}.jpg`;
    const { error } = await sb.storage.from('receipts').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    return path;
  }
  async function uploadMedia(file, folder, max = 1920) {
    const blob = await compressImage(file, max, 0.85);
    if (blob.size > 5 * 1024 * 1024) throw new Error('Şəkil çox böyükdür');
    const path = `${uid()}/${folder}/${Date.now()}.jpg`;
    const { error } = await sb.storage.from('media').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
    if (error) throw error;
    return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
  }
  async function signedThumbs(entries) {
    const paths = entries.map((e) => e.receipt_path).filter(Boolean);
    if (!paths.length) return {};
    const { data } = await sb.storage.from('receipts').createSignedUrls(paths, 900);
    const out = {};
    (data || []).forEach((d) => { if (d.signedUrl) out[d.path] = d.signedUrl; });
    return out;
  }

  // ------------------------------------------------------------------
  // Naviqasiya və çərçivə
  // ------------------------------------------------------------------
  let actions = {}, forms = {}, renderSeq = 0;

  function paint(ctx, html, acts = {}, frms = {}) {
    if (ctx.seq !== renderSeq) return false;
    app.innerHTML = ctx.wrap ? ctx.wrap(html) : html;
    actions = acts; forms = frms;
    tick();
    return true;
  }
  const refresh = () => render({ keep: true });
  function go(hash) { if (location.hash === hash) refresh(); else location.hash = hash; }
  function requireLogin(ctx) {
    if (uid()) return true;
    location.replace('#/login?next=' + encodeURIComponent(ctx.path));
    return false;
  }

  app.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || !app.contains(el)) return;
    const fn = actions[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  app.addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-form]');
    if (!f) return;
    e.preventDefault();
    const fn = forms[f.dataset.form];
    if (fn) busy(f, () => fn(f));
  });
  app.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('input[type=file][data-preview]')) {
      const img = document.getElementById(t.dataset.preview);
      if (img && t.files[0]) { img.src = URL.createObjectURL(t.files[0]); img.classList.remove('hidden'); }
      const nm = t.closest('.file-pick') && t.closest('.file-pick').querySelector('[data-fname]');
      if (nm && t.files[0]) nm.textContent = t.files[0].name;
    }
    if (t.matches('[data-toggle]')) {
      $$(t.dataset.toggle).forEach((el) => el.classList.toggle('hidden', !t.checked && t.type === 'checkbox'));
    }
    if (t.name === 'kind' && t.form && t.form.dataset.form === 'event') eventFormKindHint(t.form);
    if (t.name === 'category' && t.form && t.form.dataset.form === 'listing') {
      const w = $('#acc-warn'); if (w) w.classList.toggle('hidden', !/^account_/.test(t.value));
    }
  });
  app.addEventListener('input', (e) => {
    if (e.target.matches('[data-filter]')) {
      const q = e.target.value.trim().toLowerCase();
      $$(e.target.dataset.filter).forEach((el) => el.classList.toggle('hidden', q && !el.dataset.name.includes(q)));
    }
  });
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-copy]');
    if (c) {
      e.preventDefault();
      const txt = c.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(() => toast('Kopyalandı'))
        .catch(() => { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); toast('Kopyalandı'); });
      return;
    }
    const r = e.target.closest('[data-report]');
    if (r) { e.preventDefault(); const [type, id] = r.dataset.report.split(':'); report(type, id); }
    const lo = e.target.closest('[data-logout]');
    if (lo) { e.preventDefault(); logout(); }
  });

  async function logout() {
    await sb.auth.signOut();
    S.session = null;
    await loadMe();
    location.hash = '#/';
    refresh();
  }

  function adminTabs() { return ADMIN_TABS.filter((t) => t.can()); }

  function renderChrome(path) {
    const top = (path || '').split('/')[0];
    const sect = { event: 'events', events: 'events', squad: 'squads', squads: 'squads', listing: 'listings', listings: 'listings', profile: 'profile', u: 'profile', login: 'profile', register: 'profile', admin: 'admin' }[top] || (top === '' ? 'home' : '');
    const badge = S.pending ? ` <span class="badge-count">${S.pending}</span>` : '';
    const hasAdmin = uid() && adminTabs().length > 0;

    $('#topnav').innerHTML =
      [['events', 'Tədbirlər'], ['squads', 'Klanlar'], ['listings', 'Elanlar']]
        .map(([h, t]) => `<a href="#/${h}" class="${sect === h ? 'active' : ''}">${t}</a>`).join('') +
      (hasAdmin ? `<a href="#/admin" class="${sect === 'admin' ? 'active' : ''}">Admin${badge}</a>` : '');

    $('#topuser').innerHTML = uid()
      ? `<a class="btn btn-sm btn-ghost" href="#/profile">${I.user}<span>${esc((S.profile && S.profile.nick) || 'Profil')}</span></a>`
      : `<a class="btn btn-sm btn-ghost hide-mobile" href="#/login">Daxil ol</a><a class="btn btn-sm btn-primary" href="#/register">Qeydiyyat</a>`;

    const tabs = [['', 'Ana', I.home, 'home'], ['events', 'Tədbirlər', I.zone, 'events'], ['squads', 'Klanlar', I.users, 'squads'], ['listings', 'Elanlar', I.board, 'listings'],
      uid() ? ['profile', 'Profil', I.user, 'profile'] : ['login', 'Daxil ol', I.user, 'profile']];
    $('#tabbar').innerHTML = tabs.map(([h, t, ic, key]) =>
      `<a href="#/${h}" class="${sect === key || (key === 'profile' && sect === 'admin') ? 'active' : ''}">${ic}<span>${t}</span>${key === 'profile' && hasAdmin && S.pending ? `<span class="badge-count">${S.pending}</span>` : ''}</a>`).join('');

    let banners = '';
    if (S.settings.site_notice) banners += `<div class="banner banner-notice"><div class="wrap">${I.info}<span>${esc(S.settings.site_notice)}</span></div></div>`;
    if (banned()) banners += `<div class="banner banner-bad"><div class="wrap">${I.lock}<span>Hesabınız bloklanıb${S.access.ban_reason ? ': ' + esc(S.access.ban_reason) : ''}. Tədbirlərə qoşula və elan yerləşdirə bilməzsiniz.</span></div></div>`;
    $('#banners').innerHTML = banners;

    const tg = S.settings.telegram_group;
    const tgSafe = tg && /^https:\/\/t\.me\/[\w+\/-]+$/.test(tg) ? tg : null;
    $('#footer').innerHTML = `<p>${esc(SITE)} — Azərbaycan PUBG Mobile oyunçularının icma saytı.${tgSafe ? ` <a href="${esc(tgSafe)}" target="_blank" rel="noopener">Telegram qrupumuz</a>.` : ''}</p>
      <p style="margin-top:6px">Bu sayt rəsmi PUBG MOBILE saytı deyil. Oyunun adı və nişanları öz sahiblərinə məxsusdur.</p>`;
  }

  const ROUTES = [
    [/^$/, pageHome],
    [/^events$/, pageEvents],
    [/^event\/new$/, pageEventForm],
    [/^event\/([\w-]+)\/edit$/, pageEventForm],
    [/^event\/([\w-]+)$/, pageEvent],
    [/^squads$/, pageSquads],
    [/^squad\/new$/, pageSquadForm],
    [/^squad\/([\w-]+)$/, pageSquad],
    [/^listings$/, pageListings],
    [/^listing\/new$/, pageListingForm],
    [/^listing\/([\w-]+)\/edit$/, pageListingForm],
    [/^login$/, pageLogin],
    [/^register$/, pageRegister],
    [/^profile$/, pageProfile],
    [/^u\/([a-z0-9_]+)$/, pageUser],
    [/^admin(?:\/(\w+))?$/, pageAdmin],
  ];

  async function render(opts = {}) {
    const seq = ++renderSeq;
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    const ctx = { seq, path, q: new URLSearchParams(qs || ''), params: [] };
    renderChrome(path);
    let fn = null;
    for (const [re, f] of ROUTES) { const m = path.match(re); if (m) { fn = f; ctx.params = m.slice(1); break; } }
    if (!opts.keep) { app.innerHTML = '<div class="loading">Yüklənir…</div>'; window.scrollTo(0, 0); }
    if (!fn) return paint(ctx, emptyPage('Səhifə tapılmadı', '<a class="btn" href="#/">Ana səhifə</a>'));
    try { await fn(ctx); } catch (e) {
      console.error(e);
      paint(ctx, emptyPage(errMsg(e), '<button class="btn" data-act="retry">Yenidən cəhd et</button>'), { retry: refresh });
    }
  }
  window.addEventListener('hashchange', () => render());

  // ------------------------------------------------------------------
  // Geri sayım (hər saniyə)
  // ------------------------------------------------------------------
  const RING = 2 * Math.PI * 54;
  function tick() {
    const now = Date.now();
    $$('[data-until]').forEach((el) => {
      const until = Date.parse(el.dataset.until);
      const left = until - now;
      if (el.classList.contains('zone')) {
        const from = Date.parse(el.dataset.from || el.dataset.until);
        const total = Math.max(1, until - Math.max(from, until - 7 * 864e5));
        const frac = Math.min(1, Math.max(0, left / total));
        const f = split(left);
        el.querySelector('.z-arc').style.strokeDashoffset = String(RING * (1 - frac));
        el.querySelector('.z-time').textContent = f.t;
        el.querySelector('.z-days').textContent = left > 0 && f.d ? f.d + ' gün' : '';
        el.querySelector('.z-label').textContent = left > 0 ? 'başlamağa' : (now - until < 3 * 3600e3 ? 'gedir' : 'bitib');
        el.classList.toggle('urgent', left > 0 && left < 30 * 60e3);
      } else {
        el.textContent = left > 0 ? leftText(left) : (el.dataset.doneText || '00:00:00');
      }
      if (left <= 0 && el.dataset.onzero === 'refresh' && !el.dataset.fired) {
        el.dataset.fired = '1';
        setTimeout(refresh, 1200);
      }
    });
  }
  setInterval(tick, 1000);
  setInterval(async () => {
    if (!hasPerm('payments')) return;
    const before = S.pending;
    await loadPending();
    if (before !== S.pending) renderChrome(location.hash.replace(/^#\/?/, '').split('?')[0]);
  }, 60000);

  // ------------------------------------------------------------------
  // Ortaq parçalar
  // ------------------------------------------------------------------
  const emptyPage = (msg, extra = '') => `<div class="empty" style="margin-top:20px"><p>${esc(msg)}</p>${extra}</div>`;
  const kindChip = (k) => `<span class="chip kind-${k}">${KIND[k]}</span>`;
  const statusChip = (s) => (s && s !== 'open' ? `<span class="chip st-${s}">${STATUS[s]}</span>` : '');
  const entryChip = (s) => `<span class="chip st-${s}">${ENTRY[s]}</span>`;
  const userLink = (p) => (p ? `<a href="#/u/${esc(p.username)}">${esc(p.nick)}</a> <span class="dim small">@${esc(p.username)}</span>` : '<span class="dim">silinmiş</span>');
  const hostName = (e) => e.org_name || (e.creator && e.creator.nick) || '';
  const EV_SEL = '*, creator:profiles(nick, username)';

  function zoneHTML(e, cls = '') {
    return `<div class="zone ${cls}" data-until="${esc(e.starts_at)}" data-from="${esc(e.created_at)}" role="timer" aria-label="Başlamağa qalan vaxt">
      <svg viewBox="0 0 120 120"><circle class="z-track" cx="60" cy="60" r="54"/><circle class="z-arc" cx="60" cy="60" r="54" stroke-dasharray="${RING.toFixed(2)}" stroke-dashoffset="0"/></svg>
      <div class="z-center"><span class="z-days"></span><span class="z-time">--:--:--</span><span class="z-label">başlamağa</span></div>
    </div>`;
  }

  // ------------------------------------------------------------------
  // İllüstrasiyalar: hər xəritə üçün öz mənzərəsi (SVG, şəkilsiz)
  // ------------------------------------------------------------------
  let artSeq = 0;
  function rng(seed) {
    let h = 2166136261;
    for (const c of String(seed || 'az')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function ridge(r, base, amp) {
    const f1 = 0.004 + r() * 0.006, f2 = 0.012 + r() * 0.014, p1 = r() * 6.28, p2 = r() * 6.28;
    return (x) => base + amp * (0.65 * Math.sin(x * f1 + p1) + 0.35 * Math.sin(x * f2 + p2));
  }
  function ridgePath(fn, W, H, step = 16) {
    let d = `M0 ${H} L0 ${fn(0).toFixed(1)}`;
    for (let x = step; x <= W; x += step) d += ` L${x} ${fn(x).toFixed(1)}`;
    return d + ` L${W} ${H} Z`;
  }
  const pine = (x, y, s, c) => `<path d="M${x} ${y - s * 3.2}L${x + s * 0.9} ${y - s * 1.4}L${x + s * 0.5} ${y - s * 1.4}L${x + s * 1.2} ${y}L${x - s * 1.2} ${y}L${x - s * 0.5} ${y - s * 1.4}L${x - s * 0.9} ${y - s * 1.4}Z" fill="${c}"/>`;
  const palm = (x, y, s, c) => `<g fill="none" stroke="${c}" stroke-linecap="round"><path d="M${x} ${y}Q${x + s * 0.6} ${y - s * 1.8} ${x + s * 0.2} ${y - s * 3.4}" stroke-width="${s * 0.28}"/>` +
    [[-2, -0.4], [-1.6, 0.6], [1.8, -0.2], [1.5, 0.8], [0.2, -1.2]].map(([dx, dy]) => `<path d="M${x + s * 0.2} ${y - s * 3.4}q${dx * s * 0.6} ${(dy - 0.6) * s} ${dx * s} ${dy * s + s * 0.6}" stroke-width="${s * 0.22}"/>`).join('') + '</g>';
  const cactus = (x, y, s, c) => `<g fill="${c}"><rect x="${x - s * 0.25}" y="${y - s * 2.6}" width="${s * 0.5}" height="${s * 2.6}" rx="${s * 0.25}"/><rect x="${x - s * 0.95}" y="${y - s * 1.9}" width="${s * 0.38}" height="${s}" rx="${s * 0.19}"/><rect x="${x - s * 0.95}" y="${y - s * 1.1}" width="${s * 0.8}" height="${s * 0.34}" rx="${s * 0.17}"/><rect x="${x + s * 0.57}" y="${y - s * 2.2}" width="${s * 0.38}" height="${s * 0.9}" rx="${s * 0.19}"/><rect x="${x + 0.1 * s}" y="${y - s * 1.6}" width="${s * 0.85}" height="${s * 0.34}" rx="${s * 0.17}"/></g>`;
  const house = (x, y, s, c) => `<path d="M${x - s * 1.4} ${y}V${y - s * 1.3}L${x} ${y - s * 2.3}L${x + s * 1.4} ${y - s * 1.3}V${y}Z" fill="${c}"/>`;
  const tower = (x, y, s, c) => `<g fill="${c}"><rect x="${x - s * 0.9}" y="${y - s * 4.6}" width="${s * 1.8}" height="${s * 1.1}" rx="${s * 0.3}"/><path d="M${x - s * 0.7} ${y}L${x - s * 0.3} ${y - s * 3.5}H${x + s * 0.3}L${x + s * 0.7} ${y}Z"/></g>`;
  function chute(x, y, s, c) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0C-14-10-7-15 0-15S14-10 14 0Q10.5-3 7 0Q3.5-3 0 0Q-3.5-3-7 0Q-10.5-3-14 0Z" fill="${c}"/>
      <path d="M-7-14.2C-6-9-6.5-4-7 0M7-14.2C6-9 6.5-4 7 0" stroke="rgba(0,0,0,.18)" stroke-width="1.2" fill="none"/>
      <path d="M-14 0L-1.5 17M14 0L1.5 17M-7 0L-1 17M7 0L1 17" stroke="rgba(20,20,20,.55)" stroke-width=".7"/>
      <circle cy="18" r="2.2" fill="#14181a"/><rect x="-2" y="19.5" width="4" height="7" rx="1.6" fill="#14181a"/></g>`;
  }
  function crate(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-16" y="-16" width="32" height="32" rx="2" fill="#2F6FA8"/><rect x="-16" y="-16" width="32" height="32" rx="2" fill="none" stroke="#1B4669" stroke-width="2"/>
      <path d="M-16-3H16M-16 5H16M-3-16V16M5-16V16" stroke="#E8E2D0" stroke-width="2.4"/><rect x="-16" y="-16" width="32" height="5" fill="#235985"/></g>`;
  }
  function plane(x, y, s, c) {
    return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M-46 0C-40-4 30-5 44-2C48-1 48 2 44 3C30 5-40 4-46 0Z"/><path d="M-6-2L-20-26H-12L14-2ZM-6 2L-20 26H-12L14 2Z"/><path d="M-40-1L-48-14H-42L-30-1ZM-40 1L-48 14H-42L-30 1Z"/></g>`;
  }
  function smoke(x, y, s, idf) {
    let out = '';
    for (let i = 0; i < 7; i++) out += `<circle cx="${x + Math.sin(i * 1.3) * 10 * s + i * 6 * s}" cy="${y - i * 22 * s}" r="${(12 + i * 4) * s}" fill="#FF4A30" opacity="${0.55 - i * 0.065}"/>`;
    return `<g filter="url(#${idf})">${out}</g>`;
  }

  const MAP_THEMES = {
    erangel: { sky: ['#20304A', '#B9634A', '#F2B56A'], sun: '#FFD27D', far: '#5B6C5A', mid: '#3B4E38', near: '#1E2A1C', deco: 'pine', extra: ['house', 'tower'] },
    miramar: { sky: ['#3A2B47', '#D9693F', '#FFC77E'], sun: '#FFE09A', far: '#B9774A', mid: '#8B5131', near: '#4E2B1A', deco: 'cactus', extra: ['house'] },
    sanhok: { sky: ['#0F3138', '#2F7F72', '#BFE0A0'], sun: '#F3F7C8', far: '#2F6B4F', mid: '#1E4E39', near: '#0F2D21', deco: 'palm' },
    vikendi: { sky: ['#1A2742', '#5E7FB2', '#DCE7F4'], sun: '#FFFFFF', far: '#B6C8DE', mid: '#8EA6C2', near: '#DCE6F2', deco: 'pine', decoColor: '#2E4256' },
    livik: { sky: ['#183150', '#3F86B0', '#F0D49A'], sun: '#FFE7A8', far: '#467F6C', mid: '#2C5D4E', near: '#173A2F', deco: 'pine', water: '#3E7EA6' },
    karakin: { sky: ['#33283C', '#C77A4C', '#F5D3A0'], sun: '#FFF0C2', far: '#A0805E', mid: '#74563D', near: '#3F2D20', deco: 'cactus' },
    rondo: { sky: ['#2A2140', '#B4524F', '#F1B07A'], sun: '#FFD9A0', far: '#7A6A52', mid: '#5A4A38', near: '#2B2219', deco: 'house' },
    city: { sky: ['#0C1022', '#2A1C48', '#7A2E58'], sun: '#FF8A6B', city: true },
  };
  function themeFor(map, mode) {
    const m = String(map || '').toLowerCase();
    if (/tdm|arena/i.test(m) || /tdm|arena/i.test(mode || '')) return MAP_THEMES.city;
    if (m.startsWith('nusa')) return MAP_THEMES.sanhok;
    return MAP_THEMES[m] || MAP_THEMES.erangel;
  }

  // Mənzərə: W×H ölçüsündə SVG. opts: { chutes, plane, crate, smoke, zone }
  function scene(seed, th, W, H, opts = {}) {
    const r = rng(seed);
    const id = 'a' + (++artSeq);
    let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>
      <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${th.sky[0]}"/><stop offset=".62" stop-color="${th.sky[1]}"/><stop offset="1" stop-color="${th.sky[2]}"/></linearGradient>
      <radialGradient id="${id}g"><stop offset="0" stop-color="${th.sun}" stop-opacity=".9"/><stop offset=".35" stop-color="${th.sun}" stop-opacity=".35"/><stop offset="1" stop-color="${th.sun}" stop-opacity="0"/></radialGradient>
      <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${W / 160}"/></filter></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}s)"/>`;
    const sx = W * (0.55 + r() * 0.3), sy = H * 0.66;
    s += `<circle cx="${sx}" cy="${sy}" r="${H * 0.5}" fill="url(#${id}g)"/><circle cx="${sx}" cy="${sy}" r="${H * 0.09}" fill="${th.sun}" opacity=".95"/>`;
    for (let i = 0; i < 4; i++) s += `<ellipse cx="${r() * W}" cy="${H * (0.12 + r() * 0.3)}" rx="${W * (0.08 + r() * 0.1)}" ry="${H * 0.018}" fill="#fff" opacity="${0.06 + r() * 0.08}"/>`;
    if (opts.zone) s += `<circle cx="${W * 0.5}" cy="${H * 1.15}" r="${H * 0.95}" fill="none" stroke="#4FC3F7" stroke-width="${W / 400}" stroke-dasharray="${W / 90} ${W / 110}" opacity=".45"/>`;
    if (opts.plane) {
      const py = H * (0.12 + r() * 0.08), px = W * (0.6 + r() * 0.2);
      s += `<path d="M${-W * 0.05} ${py + H * 0.05} L${px - W * 0.03} ${py}" stroke="#fff" stroke-opacity=".22" stroke-width="${H / 160}" stroke-linecap="round"/>` + plane(px, py, W / 1400, 'rgba(15,18,22,.85)');
    }
    if (th.city) {
      for (let layer = 0; layer < 2; layer++) {
        let x = 0; const col = layer ? '#0A0D16' : '#1B1631';
        while (x < W) {
          const bw = W * (0.04 + r() * 0.06), bh = H * (layer ? 0.18 + r() * 0.3 : 0.3 + r() * 0.3);
          s += `<rect x="${x}" y="${H - bh}" width="${bw + 1}" height="${bh}" fill="${col}"/>`;
          if (layer) for (let wy = H - bh + H * 0.03; wy < H - H * 0.03; wy += H * 0.05) for (let wx = x + bw * 0.15; wx < x + bw - bw * 0.2; wx += bw * 0.25) if (r() > 0.55) s += `<rect x="${wx}" y="${wy}" width="${bw * 0.1}" height="${H * 0.018}" fill="#FFB21E" opacity="${0.4 + r() * 0.5}"/>`;
          x += bw;
        }
      }
    } else {
      const far = ridge(r, H * 0.62, H * 0.07), mid = ridge(r, H * 0.74, H * 0.06), near = ridge(r, H * 0.88, H * 0.05);
      s += `<path d="${ridgePath(far, W, H, W / 80)}" fill="${th.far}" opacity=".9"/>`;
      if (th.water) s += `<rect x="0" y="${H * 0.76}" width="${W}" height="${H * 0.08}" fill="${th.water}" opacity=".8"/><rect x="${W * 0.1}" y="${H * 0.785}" width="${W * 0.3}" height="${H * 0.006}" fill="#fff" opacity=".35"/>`;
      s += `<path d="${ridgePath(mid, W, H, W / 80)}" fill="${th.mid}"/>`;
      const dc = th.decoColor || th.near;
      const mk = { pine, palm, cactus, house }[th.deco];
      const n = Math.round(W / 60);
      for (let i = 0; i < n; i++) {
        const x = r() * W; const sz = H * (0.02 + r() * 0.02);
        if (r() > 0.4) s += mk(x, mid(x) + 2, sz, th.mid);
      }
      if (th.extra && th.extra.includes('tower')) { const tx = W * (0.15 + r() * 0.2); s += tower(tx, mid(tx) + 2, H * 0.03, th.mid); }
      s += `<path d="${ridgePath(near, W, H, W / 80)}" fill="${th.near}"/>`;
      for (let i = 0; i < n; i++) {
        const x = r() * W; const sz = H * (0.035 + r() * 0.035);
        if (r() > 0.45) s += mk(x, near(x) + 3, sz, dc);
      }
      if (th.extra && th.extra.includes('house')) { const hx = W * (0.55 + r() * 0.3); s += house(hx, near(hx) + 3, H * 0.035, dc); }
      if (opts.crate) {
        const cx = W * (0.72 + r() * 0.12), cy = near(cx) - H * 0.02;
        if (opts.smoke) s += smoke(cx - W * 0.012, cy - H * 0.04, H / 500, id + 'b');
        s += crate(cx, cy, H / 600);
      }
    }
    if (opts.chutes) {
      const cols = ['#FFB21E', '#FF5A3C', '#F3EEE3', '#4FC3F7', '#FFB21E'];
      let g = '';
      for (let i = 0; i < opts.chutes; i++) {
        const x0 = opts.xMin ?? 0.08; const cx = W * (x0 + r() * (0.92 - x0)), cy = H * (0.18 + r() * 0.32), sc = (H / 260) * (0.5 + r() * 0.7);
        g += chute(cx, cy, sc, cols[i % cols.length]);
      }
      if (opts.airdrop) {
        const ax = W * (opts.xMin ? 0.68 : 0.3), ay = H * 0.22, sc = H / 300;
        g += `<g transform="translate(${ax} ${ay})">${chute(0, 0, sc * 1.5, '#FF5A3C')}${crate(0, 30 * sc * 1.5, sc * 0.55)}</g>`;
      }
      s += `<g class="${opts.animate ? 'chutes' : ''}">${g}</g>`;
    }
    return s + '</svg>';
  }

  const eventArt = (e, W = 640, H = 320) => e.cover_url && /^https:\/\//.test(e.cover_url)
    ? `<img src="${esc(e.cover_url)}" alt="" loading="lazy">`
    : scene(e.id, themeFor(e.map, e.mode), W, H, { chutes: e.kind === 'tournament' ? 4 : 2, plane: e.kind === 'tournament', crate: e.kind === 'tournament', smoke: e.kind === 'tournament' });

  // Kiçik illüstrasiyalı ikonlar (bölmələr üçün)
  const ILL = {
    scream: `<svg class="f-ill" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(79,195,247,.14)"/>${chute(32, 30, 1.25, '#4FC3F7')}</svg>`,
    tournament: `<svg class="f-ill" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(255,178,30,.15)"/><path d="M21 16h22v8c0 7-5 12-11 12s-11-5-11-12z" fill="#FFB21E"/><path d="M21 19h-6c0 6 3 9 7 9M43 19h6c0 6-3 9-7 9" stroke="#FFB21E" stroke-width="3" fill="none"/><rect x="29" y="35" width="6" height="8" fill="#E39A10"/><rect x="22" y="43" width="20" height="6" rx="2" fill="#FFB21E"/></svg>`,
    clan: `<svg class="f-ill" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(111,208,140,.14)"/><path d="M32 12l17 6v13c0 11-7 18-17 22-10-4-17-11-17-22V18z" fill="#6FD08C"/><path d="M32 20l3 7h7l-6 4 2 8-6-5-6 5 2-8-6-4h7z" fill="#0F2D1A"/></svg>`,
    listing: `<svg class="f-ill" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="rgba(255,90,60,.15)"/><path d="M14 28v9h7l16 9V19l-16 9z" fill="#FF5A3C"/><path d="M43 26c3 3 3 9 0 12M47 22c6 6 6 14 0 20" stroke="#FF5A3C" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  };

  // Avatar və klan emblemi (baş hərflərdən, rəng adın özündən)
  const AV_COLORS = ['#FFB21E', '#4FC3F7', '#6FD08C', '#FF7A5C', '#C59BFF', '#FFD166', '#5FD4C4'];
  const avColor = (s) => { let h = 0; for (const c of String(s || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; };
  const initials = (s) => (String(s || '?').replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2) || '?').toUpperCase();
  const avatar = (p, cls = '') => p ? `<span class="avatar ${cls}" style="background:${avColor(p.username || p.nick)}" aria-hidden="true">${esc(initials(p.nick || p.username))}</span>` : '<span class="avatar" style="background:#3A4950" aria-hidden="true">?</span>';
  const emblem = (q, cls = '') => `<span class="emblem ${cls}" style="background:${avColor(q.name)}" aria-hidden="true">${esc((q.tag || initials(q.name)).slice(0, 4))}</span>`;

  function eventCard(e) {
    const pct = Math.min(100, Math.round((e.taken / e.slots) * 100));
    const free = Number(e.entry_fee) === 0;
    const host = hostName(e);
    return `<a class="ev-card" href="#/event/${e.id}">
      <div class="ev-cover">${eventArt(e)}
        <div class="ev-tl">${kindChip(e.kind)}${statusChip(e.status)}</div>
        <div class="ev-tr"><span class="ev-price ${free ? 'free' : ''}">${money(e.entry_fee)}</span></div>
        <div class="ev-bl"><span class="ev-time">${fmtHM(e.starts_at)}</span><span class="ev-day">${fmtDay(e.starts_at)}</span></div>
      </div>
      <div class="ev-body">
        <h3>${esc(e.title)}</h3>
        <p class="ev-meta">${esc([e.mode, e.map].filter(Boolean).join(', '))}${host ? (e.mode || e.map ? '. ' : '') + 'Təşkilatçı: ' + esc(host) : ''}</p>
        ${e.prize ? `<p class="small" style="color:var(--gold)">Mükafat: ${esc(e.prize)}</p>` : ''}
        <div class="ev-foot"><div class="bar"><i style="width:${pct}%"></i></div><span class="slots"><b>${e.taken}</b>/${e.slots} yer</span></div>
      </div>
    </a>`;
  }

  function pageHeadHTML(title, sub, seed, theme, right = '') {
    return `<header class="page-head"><div class="ph-art">${scene(seed, MAP_THEMES[theme] || MAP_THEMES.erangel, 1400, 300, { chutes: 3 })}</div>
      <div><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}</div>${right ? `<div class="row">${right}</div>` : ''}</header>`;
  }

  // ==================================================================
  // ANA SƏHİFƏ
  // ==================================================================
  let heroTimer = null;
  async function pageHome(ctx) {
    const since = new Date(Date.now() - 3 * 3600e3).toISOString();
    const cnt = (q) => q.then((r) => r.count || 0, () => 0);
    const [evR, clansR, nPlayers, nEvents, nClans] = await Promise.all([
      sb.from('events').select(EV_SEL).in('status', ['open', 'closed']).gte('starts_at', since).order('starts_at').limit(13),
      sb.from('squads').select('*').eq('kind', 'clan').order('members_count', { ascending: false }).limit(8),
      cnt(sb.from('profiles').select('id', { count: 'exact', head: true })),
      cnt(sb.from('events').select('id', { count: 'exact', head: true }).in('status', ['open', 'closed']).gte('starts_at', since)),
      cnt(sb.from('squads').select('id', { count: 'exact', head: true })),
    ]);
    if (evR.error) throw evR.error;
    const data = evR.data || [];
    const clans = clansR.data || [];
    const now = Date.now();
    const upcoming = data.filter((e) => Date.parse(e.starts_at) > now);
    const next = upcoming.find((e) => e.status === 'open' && e.taken < e.slots) || upcoming[0];
    const rest = data.filter((e) => e !== next).slice(0, 6);
    const photos = (S.settings.hero_images || []).filter((u) => /^https:\/\//.test(u));
    const nick = S.profile && S.profile.nick;

    const hero = `<section class="landing-hero">
      <div class="lh-scene">${scene('hero-az', MAP_THEMES.erangel, 1600, 900, { chutes: 5, xMin: 0.5, airdrop: true, plane: true, crate: true, smoke: true, zone: true, animate: true })}</div>
      ${photos.map((u, i) => `<div class="lh-photo ${i === 0 ? 'on' : ''}" style="background-image:url('${esc(u)}')"></div>`).join('')}
      <div class="lh-content">
        <span class="lh-kicker"><i></i>${nick ? 'Xoş gəldin, ' + esc(nick) : (nEvents ? nEvents + ' tədbir qeydiyyat gözləyir' : 'Azərbaycan PUBG Mobile icması')}</span>
        <h1 class="lh-title">Meydana tullan. Qələbəni qazan.</h1>
        <p class="lh-sub">Hər axşam screamlər, mükafatlı turnirlər, klanlar və komandalar: Azərbaycanın PUBG Mobile oyunçuları bir yerdə.</p>
        <div class="lh-cta">
          ${uid() ? `<a class="btn btn-primary btn-lg" href="#/events">Tədbirlərə bax</a>${banned() ? '' : '<a class="btn btn-glass btn-lg" href="#/event/new">Scream yarat</a>'}`
            : '<a class="btn btn-primary btn-lg" href="#/register">Qeydiyyatdan keç</a><a class="btn btn-glass btn-lg" href="#/events">Tədbirlərə bax</a>'}
        </div>
        <div class="lh-stats">
          <div><b>${nPlayers}</b><span>oyunçu</span></div>
          <div><b>${nEvents}</b><span>aktiv tədbir</span></div>
          <div><b>${nClans}</b><span>klan və komanda</span></div>
        </div>
      </div>
    </section>`;

    const nextCard = next ? `<section class="next-card">
        <div class="nc-art">${eventArt(next, 460, 340)}</div>
        <div class="nc-body">
          <span class="nc-label">Növbəti döyüş: ${fmtFull(next.starts_at)}</span>
          <h3><a href="#/event/${next.id}">${esc(next.title)}</a></h3>
          <div class="row">${kindChip(next.kind)}<span class="muted small">${esc([next.mode, next.map].filter(Boolean).join(', '))}</span></div>
          <div class="row" style="gap:18px;margin-top:4px">
            <span><span class="dim small">Giriş</span> <b style="color:${Number(next.entry_fee) ? 'var(--gold)' : 'var(--ok)'}">${money(next.entry_fee)}</b></span>
            <span><span class="dim small">Yerlər</span> <b class="num">${next.taken}/${next.slots}</b></span>
            ${next.prize ? `<span><span class="dim small">Mükafat</span> <b>${esc(next.prize)}</b></span>` : ''}
          </div>
        </div>
        <div class="nc-side">${zoneHTML(next)}<a class="btn btn-primary" href="#/event/${next.id}">Qoşul</a></div>
      </section>` : '';

    const features = `<section>
      <div class="section-head"><div><h2>Burada nə var</h2></div></div>
      <div class="features">
        <a class="feature" href="#/events?t=scream">${ILL.scream}<h3>Screamlər</h3><p>Hər axşam ucuz screamlər. Qoşul, otaq kodu vaxtında özü gəlsin.</p></a>
        <a class="feature" href="#/events?t=tournament">${ILL.tournament}<h3>Turnirlər</h3><p>Mükafat fondlu böyük turnirlər və nəticələr.</p></a>
        <a class="feature" href="#/squads">${ILL.clan}<h3>Klanlar</h3><p>Klanını və komandanı qur, üzv qəbul et.</p></a>
        <a class="feature" href="#/listings">${ILL.listing}<h3>Elanlar</h3><p>Komanda axtar, oyunçu tap, elan yerləşdir.</p></a>
      </div></section>`;

    const events = `<section><div class="section-head"><div><h2>Yaxın tədbirlər</h2></div><a href="#/events">Hamısına bax</a></div>
      ${rest.length ? `<div class="ev-cards">${rest.map(eventCard).join('')}</div>`
        : `<div class="empty">${next ? 'Başqa yaxın tədbir yoxdur.' : 'Hələ açıq tədbir yoxdur.'}${uid() && !banned() ? '<br><a class="btn btn-primary" href="#/event/new">Scream yarat</a>' : ''}</div>`}</section>`;

    const clanSec = clans.length ? `<section><div class="section-head"><div><h2>Ən böyük klanlar</h2></div><a href="#/squads">Hamısı</a></div>
      <div class="clan-strip">${clans.map((q) => `<a class="squad-card" href="#/squad/${q.id}">${emblem(q)}<div class="sc-body"><h3>${esc(q.name)}</h3>
        <p class="small muted">${q.members_count} üzv${q.recruiting ? ', üzv qəbul edir' : ''}</p></div></a>`).join('')}</div></section>` : '';

    const cta = uid() ? '' : `<section class="cta-band"><div class="cb-art">${scene('cta', MAP_THEMES.miramar, 1400, 260, { chutes: 4 })}</div>
      <div><h2>Döyüşə hazırsan?</h2><p>Qeydiyyat bir dəqiqə çəkir. E-poçt lazım deyil.</p></div>
      <a class="btn btn-primary btn-lg" href="#/register">Qeydiyyatdan keç</a></section>`;

    paint(ctx, `<div class="stack-lg">${hero}${nextCard}${features}${events}${clanSec}${cta}</div>`);

    clearInterval(heroTimer);
    if (photos.length > 1) {
      let i = 0;
      heroTimer = setInterval(() => {
        const els = $$('.lh-photo');
        if (!els.length) return clearInterval(heroTimer);
        els[i % els.length].classList.remove('on'); i++; els[i % els.length].classList.add('on');
      }, 6000);
    }
  }

  // ==================================================================
  // TƏDBİRLƏR
  // ==================================================================
  async function pageEvents(ctx) {
    const tab = ctx.q.get('t') || 'all';
    const since = new Date(Date.now() - 3 * 3600e3).toISOString();
    let qb = sb.from('events').select(EV_SEL);
    if (tab === 'past') {
      qb = qb.or(`status.in.(finished,cancelled),starts_at.lt."${since}"`).order('starts_at', { ascending: false }).limit(40);
    } else {
      qb = qb.in('status', ['open', 'closed']).gte('starts_at', since).order('starts_at').limit(80);
      if (tab === 'scream' || tab === 'tournament') qb = qb.eq('kind', tab);
    }
    const { data, error } = await qb;
    if (error) throw error;
    const tabs = [['all', 'Hamısı'], ['scream', 'Screamlər'], ['tournament', 'Turnirlər'], ['past', 'Keçmiş']];
    const cta = uid() ? (banned() ? '' : '<a class="btn btn-primary" href="#/event/new">' + I.plus + 'Tədbir yarat</a>') : '<a class="btn" href="#/login?next=event/new">Tədbir yarat</a>';
    paint(ctx, `<div class="stack">
      ${pageHeadHTML('Tədbirlər', 'Screamlər və turnirlər. Qoşul, ödənişi et, otaq kodu vaxtında açılsın.', 'events-' + tab, tab === 'tournament' ? 'miramar' : 'erangel', cta)}
      <nav class="tabs" aria-label="Filtr">${tabs.map(([k, t]) => `<a href="#/events${k === 'all' ? '' : '?t=' + k}" class="${tab === k ? 'on' : ''}">${t}</a>`).join('')}</nav>
      ${data.length ? `<div class="ev-cards">${data.map(eventCard).join('')}</div>`
        : `<div class="empty">${tab === 'past' ? 'Keçmiş tədbir yoxdur.' : 'Hazırda açıq tədbir yoxdur.'}${uid() && !banned() && tab !== 'past' ? '<br><a class="btn btn-primary" href="#/event/new">Scream yarat</a>' : ''}</div>`}
    </div>`);
  }

  // ------------------------------------------------------------------
  // Tədbir səhifəsi
  // ------------------------------------------------------------------
  async function pageEvent(ctx) {
    const id = ctx.params[0];
    const { data: ev, error } = await sb.from('events').select(EV_SEL).eq('id', id).maybeSingle();
    if (error) throw error;
    if (!ev) return paint(ctx, emptyPage('Tədbir tapılmadı', '<a class="btn" href="#/events">Tədbirlər</a>'));

    const me = uid();
    const isCreator = !!me && ev.creator_id === me;
    const canEdit = isCreator || hasPerm('events');
    const canReview = isCreator || hasPerm('payments');
    const none = Promise.resolve({ data: null });
    const [appr, mineR, roomR, allR, secR] = await Promise.all([
      sb.from('event_entries').select('pubg_nick, team_name').eq('event_id', id).eq('status', 'approved').order('created_at'),
      me ? sb.from('event_entries').select('*').eq('event_id', id).eq('user_id', me).maybeSingle() : none,
      me ? sb.rpc('get_room', { p_event: id }) : none,
      canReview ? sb.from('event_entries').select('*, profile:profiles(nick, username)').eq('event_id', id).order('created_at') : none,
      canEdit ? sb.from('event_secrets').select('*').eq('event_id', id).maybeSingle() : none,
    ]);
    const approved = appr.data || [];
    const mine = mineR.data;
    const room = roomR.data || {};
    const all = allR.data || [];
    const secret = secR.data || {};
    const thumbs = canReview ? await signedThumbs(all.filter((e) => e.status === 'pending')) : {};

    const now = Date.now();
    const started = now >= Date.parse(ev.starts_at);
    const regOpen = ev.status === 'open' && !started;
    const full = ev.taken >= ev.slots;
    const paid = Number(ev.entry_fee) > 0;
    const needsTeam = ev.kind === 'tournament' || /duo|squad/i.test(ev.mode || '');

    // --- Qoşulma paneli
    const teamField = (val = '') => needsTeam ? `<div class="field" style="margin-top:10px"><label for="j-team">Komanda adı <span class="dim">(istəyə görə)</span></label><input id="j-team" name="team" type="text" maxlength="40" value="${esc(val)}"></div>` : '';
    const receiptField = `<label class="file-pick">${I.image}<span data-fname>Çekin şəklini seç</span><input type="file" name="receipt" accept="image/*" required data-preview="j-prev"></label><img id="j-prev" class="preview-img hidden" alt="Seçilmiş çek">`;
    const cardBlock = `<div class="card-num"><span>${esc(ev.card_number)}</span><button type="button" class="icon-btn" data-copy="${esc((ev.card_number || '').replace(/\s/g, ''))}" aria-label="Kart nömrəsini kopyala">${I.copy}</button></div>
      ${ev.card_holder ? `<p class="small muted" style="margin-top:6px">Kart sahibi: ${esc(ev.card_holder)}</p>` : ''}`;

    function roomBox() {
      if (room.available) {
        return `<div class="room open"><b>Otaq açıqdır, uğurlar!</b><dl class="room-codes">
          <div class="room-code"><dt>Otaq ID</dt><dd><span>${esc(room.room_id)}</span><button class="icon-btn" data-copy="${esc(room.room_id)}" aria-label="Otaq ID-ni kopyala">${I.copy}</button></dd></div>
          <div class="room-code"><dt>Şifrə</dt><dd><span>${esc(room.room_password || '—')}</span>${room.room_password ? `<button class="icon-btn" data-copy="${esc(room.room_password)}" aria-label="Şifrəni kopyala">${I.copy}</button>` : ''}</dd></div>
        </dl></div>`;
      }
      if (ev.status === 'cancelled') return '';
      const rev = room.reveal_at || new Date(Date.parse(ev.starts_at) - ev.reveal_minutes * 60e3).toISOString();
      if (now < Date.parse(rev)) {
        return `<div class="room"><div class="row" style="gap:8px">${I.lock.replace('<svg', '<svg width="18" height="18"')}<b>Otaq kodu bağlıdır</b></div>
          <p class="small muted" style="margin-top:6px">Açılma vaxtı: ${fmtFull(rev)}. Qalıb: <span class="num" data-until="${esc(rev)}" data-onzero="refresh"></span></p></div>`;
      }
      return `<div class="room"><b>Təşkilatçı hələ otaq kodunu yazmayıb</b><p class="small muted" style="margin-top:4px">Bir az sonra yenilə.</p>
        <button class="btn btn-sm" style="margin-top:8px" data-act="reload">Yenilə</button></div>`;
    }

    let join;
    if (!me) {
      join = `<h3>Qoşulmaq üçün daxil ol</h3><p class="muted">Hesabın yoxdursa, qeydiyyat bir dəqiqə çəkir.</p>
        <div class="row" style="margin-top:12px"><a class="btn btn-primary" href="#/login?next=event/${ev.id}">Daxil ol</a><a class="btn" href="#/register">Qeydiyyat</a></div>`;
    } else if (mine && mine.status === 'approved') {
      join = `<div class="row-between"><h3>Qoşulmusan</h3>${entryChip('approved')}</div>${roomBox()}`;
    } else if (mine && mine.status === 'pending') {
      join = `<div class="row-between"><h3>Çekin yoxlanılır</h3>${entryChip('pending')}</div>
        <p class="muted">Təşkilatçı ödənişi təsdiqləyəndən sonra otaq kodu burada açılacaq.</p>
        <button class="btn btn-ghost btn-sm" style="margin-top:10px" data-act="leave">Sorğunu geri götür</button>`;
    } else if (mine && mine.status === 'rejected') {
      join = `<div class="row-between"><h3>Sorğun ləğv edildi</h3>${entryChip('rejected')}</div>
        ${mine.reject_reason ? `<p style="margin-top:8px">Səbəb: ${esc(mine.reject_reason)}</p>` : ''}
        ${regOpen && !full ? `<form data-form="resubmit" style="margin-top:14px"><p class="small muted">Düzgün çeki yenidən göndər:</p>${receiptField}
          <button class="btn btn-primary btn-block" style="margin-top:12px">Yeni çeki göndər</button></form>` : ''}
        <button class="btn btn-ghost btn-sm" style="margin-top:10px" data-act="leave">Sorğunu sil</button>`;
    } else if (banned()) {
      join = '<h3>Hesabınız bloklanıb</h3><p class="muted">Bloklanmış hesab tədbirlərə qoşula bilməz.</p>';
    } else if (ev.status === 'cancelled') {
      join = '<h3>Tədbir ləğv edilib</h3>';
    } else if (!regOpen) {
      join = `<h3>Qeydiyyat bağlıdır</h3><p class="muted">${started ? 'Tədbir artıq başlayıb.' : 'Təşkilatçı qeydiyyatı bağlayıb.'}</p>`;
    } else if (full) {
      join = '<h3>Yer qalmayıb</h3><p class="muted">Bütün yerlər tutulub. Ləğv edilən sorğu olsa, yer boşalacaq.</p>';
    } else if (!paid) {
      join = `<h3>Pulsuz qoşul</h3><form data-form="join">${teamField()}<button class="btn btn-primary btn-block" style="margin-top:12px">Qoşul</button></form>`;
    } else {
      join = `<h3 style="margin-bottom:14px">Qoşul: ${money(ev.entry_fee)}</h3>
        <form data-form="join"><ol class="pay-steps">
          <li><b>${money(ev.entry_fee)} köçür</b>${cardBlock}</li>
          <li><b>Çekin şəklini yüklə</b><p class="small muted">Ekran şəkli olar. Məbləğ və vaxt aydın görünsün.</p>${receiptField}</li>
          <li><b>Göndər və təsdiqi gözlə</b>${teamField()}
            <button class="btn btn-primary btn-block" style="margin-top:12px">Çeki göndər</button>
            <p class="small dim" style="margin-top:8px">Saxta çek göndərən hesablar daimi bloklanır.</p></li>
        </ol></form>`;
    }

    // --- Təşkilatçı paneli
    let manage = '';
    if (canEdit || canReview) {
      const pend = all.filter((e) => e.status === 'pending');
      const ok = all.filter((e) => e.status === 'approved');
      const rej = all.filter((e) => e.status === 'rejected');
      const entryItem = (e) => `<div class="list-item">
          ${e.receipt_path && thumbs[e.receipt_path] ? `<img class="receipt-thumb" src="${esc(thumbs[e.receipt_path])}" alt="Çek" data-act="receipt" data-id="${e.id}">` : ''}
          ${avatar(e.profile)}<div class="grow"><div class="title">${userLink(e.profile)}</div>
            <div class="small muted">Oyunda: ${esc(e.pubg_nick || '—')}, ID ${esc(e.pubg_id || '—')}${e.team_name ? ', komanda: ' + esc(e.team_name) : ''}. ${fmtAgo(e.created_at)}</div>
            ${e.reject_reason ? `<div class="small" style="color:var(--bad)">Səbəb: ${esc(e.reject_reason)}</div>` : ''}</div>
          <div class="row">
            ${e.receipt_path ? `<button class="btn btn-sm" data-act="receipt" data-id="${e.id}">Çek</button>` : ''}
            ${canReview && e.status !== 'approved' ? `<button class="btn btn-sm btn-ok" data-act="approve" data-id="${e.id}">Təsdiqlə</button>` : ''}
            ${canReview && e.status !== 'rejected' ? `<button class="btn btn-sm btn-bad" data-act="reject" data-id="${e.id}">Ləğv et</button>` : ''}
          </div></div>`;
      manage = `<section class="panel stack" id="manage">
        <div class="row-between"><h2>İdarəetmə</h2>${canEdit ? `<a class="btn btn-sm" href="#/event/${ev.id}/edit">Redaktə et</a>` : ''}</div>
        ${canEdit ? `<form data-form="room" class="panel-flat">
          <h3>Otaq məlumatı</h3>
          <p class="small muted" style="margin-top:4px">Təsdiqlənmiş oyunçular kodu başlamağa ${ev.reveal_minutes} dəqiqə qalmış görəcək.</p>
          <div class="grid-2" style="margin-top:10px">
            <div class="field"><label for="r-id">Otaq ID</label><input id="r-id" name="room_id" type="text" maxlength="40" value="${esc(secret.room_id || '')}"></div>
            <div class="field"><label for="r-pw">Şifrə</label><input id="r-pw" name="room_password" type="text" maxlength="40" value="${esc(secret.room_password || '')}"></div>
          </div><div class="form-actions" style="margin-top:12px"><button class="btn btn-primary btn-sm">Kodu yadda saxla</button></div></form>` : ''}
        ${canReview ? `<div>
          <div class="row-between" style="margin-bottom:8px"><h3>Gözləyən sorğular (${pend.length})</h3>
            ${ok.length ? '<button class="btn btn-sm btn-ghost" data-act="copylist">Siyahını kopyala</button>' : ''}</div>
          ${pend.length ? `<div class="list">${pend.map(entryItem).join('')}</div>` : '<div class="empty">Gözləyən sorğu yoxdur.</div>'}
          <div class="list" style="margin-top:12px">
            <details class="fold" style="border-top:0"><summary>Təsdiqlənmiş (${ok.length})</summary>${ok.map(entryItem).join('')}</details>
            <details class="fold"><summary>Ləğv edilmiş (${rej.length})</summary>${rej.map(entryItem).join('')}</details>
          </div></div>` : ''}
        ${canEdit ? `<div class="panel-flat stack">
          <h3>Vəziyyət</h3>
          <div class="row">
            ${ev.status === 'open' ? '<button class="btn btn-sm" data-act="status" data-v="closed">Qeydiyyatı bağla</button>' : ''}
            ${ev.status === 'closed' ? '<button class="btn btn-sm" data-act="status" data-v="open">Qeydiyyatı aç</button>' : ''}
            ${ev.status !== 'finished' && ev.status !== 'cancelled' ? '<button class="btn btn-sm" data-act="status" data-v="finished">Bitdi</button><button class="btn btn-sm btn-bad" data-act="status" data-v="cancelled">Ləğv et</button>' : ''}
            ${ev.taken === 0 ? '<button class="btn btn-sm btn-bad" data-act="delete">Sil</button>' : ''}
          </div>
          <form data-form="results"><div class="field"><label for="ev-res">Nəticələr və qaliblər</label>
            <textarea id="ev-res" name="results" maxlength="2000" placeholder="1. yer: ...&#10;2. yer: ...">${esc(ev.results || '')}</textarea></div>
            <div class="form-actions" style="margin-top:10px"><button class="btn btn-sm">Nəticələri saxla</button></div></form>
        </div>` : ''}
      </section>`;
    }

    const facts = [
      ['Başlayır', fmtFull(ev.starts_at)], ['Rejim', ev.mode], ['Xəritə', ev.map], ['Giriş haqqı', money(ev.entry_fee)],
      ['Yerlər', `${ev.taken} / ${ev.slots}`], ['Mükafat', ev.prize], ['Təşkilatçı', hostName(ev)],
    ].filter(([, v]) => v);

    const html = `<div class="stack-lg">
      <div class="ev-banner"><div class="ev-banner-art">${eventArt(ev, 1400, 420)}</div><div class="ev-banner-in"><div>
        <a class="back" href="#/events">Bütün tədbirlər</a>
        <div class="row" style="gap:6px">${kindChip(ev.kind)}${statusChip(ev.status)}</div>
        <h1>${esc(ev.title)}</h1>
        ${ev.creator ? `<p class="small" style="color:#E2DCCF">Yaradan: ${userLink(ev.creator)}</p>` : ''}
      </div>${ev.status === 'cancelled' ? '' : zoneHTML(ev, 'zone-sm')}</div></div>
      <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
      <div class="ev-grid">
        <div class="stack-lg">
          ${ev.results ? `<section class="panel results"><h2>Nəticələr</h2><p class="desc">${esc(ev.results)}</p></section>` : ''}
          ${ev.description ? `<section><h2 style="margin-bottom:8px">Qaydalar və təfərrüatlar</h2><p class="desc">${esc(ev.description)}</p></section>` : ''}
          <section><h2 style="margin-bottom:10px">Təsdiqlənmiş iştirakçılar (${approved.length})</h2>
            ${approved.length ? `<div class="plist">${approved.map((p) => `<span>${esc(p.pubg_nick)}${p.team_name ? ' <span class="dim">[' + esc(p.team_name) + ']</span>' : ''}</span>`).join('')}</div>` : '<p class="muted">Hələ təsdiqlənmiş iştirakçı yoxdur.</p>'}
          </section>
          ${manage}
        </div>
        <aside class="panel">${join}</aside>
      </div></div>`;

    const findEntry = (el) => all.find((x) => x.id === el.dataset.id);
    paint(ctx, html, {
      reload: refresh,
      leave: async () => {
        if (!(await confirmAsk('Sorğunu silmək?', 'Yerin boşalacaq. Ödəniş etmisənsə, təşkilatçı ilə əlaqə saxla.', 'Sil', 'btn-bad'))) return;
        const { error: e } = await sb.from('event_entries').delete().eq('id', mine.id);
        if (e) return toast(errMsg(e), 'bad');
        if (mine.receipt_path) sb.storage.from('receipts').remove([mine.receipt_path]);
        toast('Sorğu silindi'); refresh();
      },
      receipt: (el) => { const e = findEntry(el); if (e) showReceipt(e, canReview ? async (ok) => { if (await reviewEntry(e.id, ok)) refresh(); } : null); },
      approve: async (el) => { if (await reviewEntry(el.dataset.id, true)) refresh(); },
      reject: async (el) => { if (await reviewEntry(el.dataset.id, false)) refresh(); },
      copylist: () => {
        const ok = all.filter((e) => e.status === 'approved');
        const txt = `${ev.title} (${fmtFull(ev.starts_at)})\n` + ok.map((e, i) => `${i + 1}. ${e.pubg_nick}${e.pubg_id ? ' (' + e.pubg_id + ')' : ''}${e.team_name ? ' [' + e.team_name + ']' : ''}`).join('\n');
        navigator.clipboard.writeText(txt).then(() => toast('Siyahı kopyalandı'));
      },
      status: async (el) => {
        const v = el.dataset.v;
        if (v === 'cancelled' && !(await confirmAsk('Tədbiri ləğv etmək?', 'Ödəniş edənlərə pulu qaytarmağı unutma.', 'Ləğv et', 'btn-bad'))) return;
        const { error: e } = await sb.from('events').update({ status: v }).eq('id', ev.id);
        if (e) return toast(errMsg(e), 'bad');
        toast('Yeniləndi', 'ok'); refresh();
      },
      delete: async () => {
        if (!(await confirmAsk('Tədbiri silmək?', 'Bu əməliyyat geri qaytarılmır.', 'Sil', 'btn-bad'))) return;
        const { data: d, error: e } = await sb.from('events').delete().eq('id', ev.id).select('id');
        if (e) return toast(errMsg(e), 'bad');
        if (!d || !d.length) return toast('Qoşulanlar olduğu üçün silmək olmur. Tədbiri ləğv edin.', 'bad');
        toast('Tədbir silindi'); go('#/events');
      },
    }, {
      join: async (f) => {
        let path = null;
        if (paid) {
          const file = f.receipt && f.receipt.files[0];
          if (!file) throw new Error('Çekin şəklini seçin');
          path = await uploadReceipt(ev.id, file);
        }
        const { error: e } = await sb.from('event_entries').insert({ event_id: ev.id, user_id: uid(), team_name: (f.team && f.team.value.trim()) || null, receipt_path: path });
        if (e) { if (path) sb.storage.from('receipts').remove([path]); throw e; }
        toast(paid ? 'Çek göndərildi. Təsdiq gözlənilir.' : 'Qoşuldun!', 'ok');
        refresh();
      },
      resubmit: async (f) => {
        const file = f.receipt.files[0];
        if (!file) throw new Error('Çekin şəklini seçin');
        const path = await uploadReceipt(ev.id, file);
        const { error: e } = await sb.rpc('resubmit_entry', { p_entry: mine.id, p_path: path });
        if (e) { sb.storage.from('receipts').remove([path]); throw e; }
        if (mine.receipt_path) sb.storage.from('receipts').remove([mine.receipt_path]);
        toast('Yeni çek göndərildi', 'ok'); refresh();
      },
      room: async (f) => {
        const { error: e } = await sb.from('event_secrets').upsert({
          event_id: ev.id, room_id: f.room_id.value.trim() || null, room_password: f.room_password.value.trim() || null, updated_at: new Date().toISOString(),
        });
        if (e) throw e;
        toast('Otaq kodu yadda saxlanıldı', 'ok');
      },
      results: async (f) => {
        const { error: e } = await sb.from('events').update({ results: f.results.value.trim() || null }).eq('id', ev.id);
        if (e) throw e;
        toast('Nəticələr saxlanıldı', 'ok'); refresh();
      },
    });
  }

  // ------------------------------------------------------------------
  // Tədbir yaratmaq / redaktə
  // ------------------------------------------------------------------
  function eventFormKindHint(f) {
    const kind = (f.querySelector('input[name=kind]:checked') || {}).value;
    const hint = $('#fee-hint');
    if (!hint) return;
    hint.textContent = kind === 'scream' && !hasPerm('events')
      ? `Scream üçün ən çox ${money(S.settings.max_scream_fee ?? 2)}, ən çox ${S.settings.max_scream_slots ?? 100} yer.`
      : 'Pulsuz tədbir üçün 0 yazın.';
  }

  async function pageEventForm(ctx) {
    if (!requireLogin(ctx)) return;
    if (banned()) return paint(ctx, emptyPage('Bloklanmış hesab tədbir yarada bilməz.'));
    const id = ctx.params[0];
    let ev = null;
    if (id) {
      const { data, error } = await sb.from('events').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) return paint(ctx, emptyPage('Tədbir tapılmadı'));
      if (!(data.creator_id === uid() || hasPerm('events'))) return paint(ctx, emptyPage('Bu tədbiri redaktə etməyə icazən yoxdur.'));
      ev = data;
    }
    const start = new Date(Date.now() + 60 * 60e3); start.setMinutes(0, 0, 0); start.setHours(start.getHours() + 1);
    const v = ev || { kind: canHost() && ctx.q.get('kind') === 'tournament' ? 'tournament' : 'scream', starts_at: start.toISOString(), reveal_minutes: 10, entry_fee: 0.5, slots: 100, mode: 'Squad TPP', map: 'Erangel', card_number: '', card_holder: '' };
    const lockKind = !!ev;
    const opt = (list, cur) => ['<option value="">Seçin</option>'].concat(list.map((x) => `<option ${x === cur ? 'selected' : ''}>${esc(x)}</option>`)).join('');

    paint(ctx, `<div class="stack">
      ${ev ? `<a class="back" href="#/event/${ev.id}">Tədbirə qayıt</a>` : ''}
      <h1>${ev ? 'Tədbiri redaktə et' : 'Yeni tədbir'}</h1>
      <form data-form="event" class="form panel" novalidate>
        <div class="field"><span class="label">Növ</span>
          <div class="choice">
            <div><input type="radio" name="kind" id="k-s" value="scream" ${v.kind === 'scream' ? 'checked' : ''} ${lockKind ? 'disabled' : ''}>
              <label for="k-s"><b>Scream</b><small>Hər kəs yarada bilər. Kiçik giriş haqqı.</small></label></div>
            <div><input type="radio" name="kind" id="k-t" value="tournament" ${v.kind === 'tournament' ? 'checked' : ''} ${lockKind || !canHost() ? 'disabled' : ''}>
              <label for="k-t"><b>Turnir</b><small>${canHost() ? 'Böyük turnir, istənilən giriş haqqı.' : 'Admin icazəsi ilə açılır.'}</small></label></div>
          </div></div>
        <div class="field"><label for="e-title">Ad</label><input id="e-title" name="title" type="text" maxlength="80" required value="${esc(v.title || '')}" placeholder="Məs: Night Scream, Erangel"></div>
        <div class="grid-2">
          <div class="field"><label for="e-mode">Rejim</label><select id="e-mode" name="mode">${opt(MODES, v.mode)}</select></div>
          <div class="field"><label for="e-map">Xəritə</label><select id="e-map" name="map">${opt(MAPS, v.map)}</select></div>
        </div>
        <div class="grid-2">
          <div class="field"><label for="e-start">Başlama vaxtı</label><input id="e-start" name="starts_at" type="datetime-local" required value="${toLocalInput(v.starts_at)}"></div>
          <div class="field"><label for="e-rev">Otaq kodu neçə dəqiqə əvvəl açılsın</label><input id="e-rev" name="reveal_minutes" type="number" min="0" max="180" value="${esc(v.reveal_minutes)}"></div>
        </div>
        <div class="grid-2">
          <div class="field"><label for="e-fee">Giriş haqqı (₼)</label><input id="e-fee" name="entry_fee" type="number" min="0" step="0.1" value="${esc(v.entry_fee)}"><span class="hint" id="fee-hint"></span></div>
          <div class="field"><label for="e-slots">Yer sayı</label><input id="e-slots" name="slots" type="number" min="1" max="1000" value="${esc(v.slots)}"></div>
        </div>
        <div class="grid-2">
          <div class="field"><label for="e-card">Kart nömrəsi</label><input id="e-card" name="card_number" type="text" inputmode="numeric" maxlength="30" value="${esc(v.card_number || '')}" placeholder="4169 0000 0000 0000"><span class="hint">Ödənişlər bu karta köçürüləcək.</span></div>
          <div class="field"><label for="e-holder">Kart sahibi <span class="dim">(istəyə görə)</span></label><input id="e-holder" name="card_holder" type="text" maxlength="60" value="${esc(v.card_holder || '')}"></div>
        </div>
        <div class="field"><label for="e-prize">Mükafat <span class="dim">(istəyə görə)</span></label><input id="e-prize" name="prize" type="text" maxlength="200" value="${esc(v.prize || '')}" placeholder="Məs: 1-ci yer 30 ₼, 2-ci yer 15 ₼"></div>
        <div class="field"><label for="e-org">Təşkilatçı kimi göstərilən ad <span class="dim">(istəyə görə)</span></label><input id="e-org" name="org_name" type="text" maxlength="40" value="${esc(v.org_name || '')}"><span class="hint">Boş qalsa, sənin nikin göstəriləcək.</span></div>
        <div class="field"><span class="label">Örtük şəkli <span class="dim">(istəyə görə)</span></span>
          <label class="file-pick">${I.image}<span data-fname>${v.cover_url ? 'Yeni şəkil seç' : 'Şəkil seç (məs: oyundan ekran şəkli)'}</span><input type="file" name="cover" accept="image/*" data-preview="e-cprev"></label>
          <img id="e-cprev" class="preview-img ${v.cover_url ? '' : 'hidden'}" src="${esc(v.cover_url || '')}" alt="Örtük şəkli">
          ${v.cover_url ? '<label class="check" style="margin-top:8px"><input type="checkbox" name="cover_remove"><span class="small">Şəkli sil, xəritə illüstrasiyası göstərilsin</span></label>' : ''}
          <span class="hint">Şəkil seçməsən, xəritəyə uyğun illüstrasiya göstərilir.</span></div>
        <div class="field"><label for="e-desc">Qaydalar və təfərrüatlar</label><textarea id="e-desc" name="description" maxlength="2000" rows="5" placeholder="Məs: emulyator qadağandır, komandada 4 nəfər...">${esc(v.description || '')}</textarea></div>
        <div class="form-actions"><button class="btn btn-primary">${ev ? 'Yadda saxla' : 'Tədbiri yarat'}</button><a class="btn btn-ghost" href="${ev ? '#/event/' + ev.id : '#/events'}">İmtina</a></div>
      </form></div>`, {}, {
      event: async (f) => {
        const kind = ev ? ev.kind : (f.querySelector('input[name=kind]:checked') || {}).value;
        const fee = Number(f.entry_fee.value || 0);
        const slots = parseInt(f.slots.value, 10);
        const startIso = f.starts_at.value ? new Date(f.starts_at.value).toISOString() : null;
        if (f.title.value.trim().length < 3) throw new Error('Ad ən azı 3 simvol olmalıdır');
        if (!startIso) throw new Error('Başlama vaxtını seçin');
        if (!ev && Date.parse(startIso) < Date.now()) throw new Error('Başlama vaxtı keçmiş ola bilməz');
        if (!(slots >= 1)) throw new Error('Yer sayını yazın');
        if (fee < 0 || Number.isNaN(fee)) throw new Error('Giriş haqqı düzgün deyil');
        if (fee > 0 && !f.card_number.value.trim()) throw new Error('Ödənişli tədbir üçün kart nömrəsi yazın');
        const payload = {
          title: f.title.value.trim(), mode: f.mode.value || null, map: f.map.value || null, starts_at: startIso,
          reveal_minutes: parseInt(f.reveal_minutes.value || '10', 10), entry_fee: fee, slots,
          card_number: f.card_number.value.trim() || null, card_holder: f.card_holder.value.trim() || null,
          prize: f.prize.value.trim() || null, org_name: f.org_name.value.trim() || null, description: f.description.value.trim() || null,
        };
        const coverFile = f.cover && f.cover.files[0];
        if (coverFile) payload.cover_url = await uploadMedia(coverFile, 'covers', 1600);
        else if (f.cover_remove && f.cover_remove.checked) payload.cover_url = null;
        if (ev) {
          const { error } = await sb.from('events').update(payload).eq('id', ev.id);
          if (error) throw error;
          toast('Yadda saxlanıldı', 'ok'); location.hash = '#/event/' + ev.id;
        } else {
          const { data, error } = await sb.from('events').insert({ ...payload, kind }).select('id').single();
          if (error) throw error;
          toast('Tədbir yaradıldı. İndi otaq kodunu əlavə edə bilərsən.', 'ok'); location.hash = '#/event/' + data.id;
        }
      },
    });
    eventFormKindHint($('form[data-form=event]'));
  }

  // ==================================================================
  // KLANLAR VƏ KOMANDALAR
  // ==================================================================
  const SQUAD_MAX = { clan: 100, team: 6 };

  async function myMemberships() {
    if (!uid()) return [];
    const { data } = await sb.from('squad_members').select('squad_id, kind, status, role').eq('user_id', uid());
    return data || [];
  }

  async function pageSquads(ctx) {
    const kind = ctx.q.get('t') === 'team' ? 'team' : 'clan';
    const [{ data, error }, mine] = await Promise.all([
      sb.from('squads').select('*, leader:profiles(nick, username)').eq('kind', kind).order('members_count', { ascending: false }).limit(200),
      myMemberships(),
    ]);
    if (error) throw error;
    const inOne = mine.some((m) => m.kind === kind && m.status === 'member');
    const mineIds = new Set(mine.filter((m) => m.status === 'member').map((m) => m.squad_id));
    const cta = !uid() ? `<a class="btn" href="#/login?next=squad/new">${kind === 'clan' ? 'Klan yarat' : 'Komanda yarat'}</a>`
      : (inOne || banned() ? '' : `<a class="btn btn-primary" href="#/squad/new?kind=${kind}">${I.plus}${kind === 'clan' ? 'Klan yarat' : 'Komanda yarat'}</a>`);
    paint(ctx, `<div class="stack">
      ${pageHeadHTML('Klanlar və komandalar', 'Birlikdə oyna, birlikdə qazan.', 'squads-' + kind, kind === 'clan' ? 'vikendi' : 'sanhok', cta)}
      <nav class="tabs"><a href="#/squads" class="${kind === 'clan' ? 'on' : ''}">Klanlar</a><a href="#/squads?t=team" class="${kind === 'team' ? 'on' : ''}">Komandalar</a></nav>
      <p class="muted small">${kind === 'clan' ? 'Klan: böyük birlik, 100 nəfərə qədər.' : 'Komanda (ekip): turnirlərə birlikdə çıxanlar, 4 əsas + 2 ehtiyat.'} Hər oyunçu yalnız bir ${kind === 'clan' ? 'klanda' : 'komandada'} ola bilər.</p>
      ${data.length > 6 ? `<input type="search" placeholder="Ada görə axtar" data-filter=".squad-card" aria-label="Axtar">` : ''}
      ${data.length ? `<div class="squad-grid">${data.map((s) => `<a class="squad-card" href="#/squad/${s.id}" data-name="${esc((s.name + ' ' + (s.tag || '')).toLowerCase())}">${emblem(s)}<div class="sc-body">
          <h3>${esc(s.name)}${s.tag ? ` <span class="tag">[${esc(s.tag)}]</span>` : ''}</h3>
          ${s.description ? `<p class="muted small" style="margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(s.description)}</p>` : ''}
          <div class="row" style="margin-top:10px">
            <span class="chip num">${s.members_count}/${SQUAD_MAX[s.kind]}</span>
            ${s.recruiting ? '<span class="chip st-approved">Üzv qəbul edir</span>' : '<span class="chip">Qəbul bağlıdır</span>'}
            ${mineIds.has(s.id) ? '<span class="chip role-admin">Sənin</span>' : ''}
          </div>
          <p class="small dim" style="margin-top:8px">Lider: ${esc(s.leader ? s.leader.nick : '—')}</p></div></a>`).join('')}</div>`
        : `<div class="empty">Hələ ${kind === 'clan' ? 'klan' : 'komanda'} yoxdur.${cta ? '<br>' + cta : ''}</div>`}
    </div>`);
  }

  async function pageSquadForm(ctx) {
    if (!requireLogin(ctx)) return;
    if (banned()) return paint(ctx, emptyPage('Bloklanmış hesab qrup yarada bilməz.'));
    const kind = ctx.q.get('kind') === 'team' ? 'team' : 'clan';
    paint(ctx, `<div class="stack"><h1>Yeni ${kind === 'clan' ? 'klan' : 'komanda'}</h1>
      <form data-form="squad" class="form panel">
        <div class="field"><span class="label">Növ</span><div class="choice">
          <div><input type="radio" name="kind" id="sk-c" value="clan" ${kind === 'clan' ? 'checked' : ''}><label for="sk-c"><b>Klan</b><small>100 nəfərə qədər</small></label></div>
          <div><input type="radio" name="kind" id="sk-t" value="team" ${kind === 'team' ? 'checked' : ''}><label for="sk-t"><b>Komanda</b><small>4 əsas + 2 ehtiyat</small></label></div>
        </div></div>
        <div class="grid-2">
          <div class="field"><label for="s-name">Ad</label><input id="s-name" name="name" type="text" maxlength="30" required></div>
          <div class="field"><label for="s-tag">Teq <span class="dim">(istəyə görə)</span></label><input id="s-tag" name="tag" type="text" maxlength="6" placeholder="Məs: AZE"></div>
        </div>
        <div class="field"><label for="s-desc">Haqqında</label><textarea id="s-desc" name="description" maxlength="1000" placeholder="Kimləri axtarırsınız, nə vaxt oynayırsınız, tələblər..."></textarea></div>
        <label class="check" style="margin-top:14px"><input type="checkbox" name="recruiting" checked><span>Yeni üzv qəbul edirik</span></label>
        <div class="form-actions"><button class="btn btn-primary">Yarat</button><a class="btn btn-ghost" href="#/squads">İmtina</a></div>
      </form></div>`, {}, {
      squad: async (f) => {
        const name = f.name.value.trim();
        if (name.length < 2) throw new Error('Ad ən azı 2 simvol olmalıdır');
        const { data, error } = await sb.from('squads').insert({
          kind: f.querySelector('input[name=kind]:checked').value, name,
          tag: f.tag.value.trim().toUpperCase() || null, description: f.description.value.trim() || null, recruiting: f.recruiting.checked,
        }).select('id').single();
        if (error) throw error;
        toast('Yaradıldı', 'ok'); location.hash = '#/squad/' + data.id;
      },
    });
  }

  async function pageSquad(ctx) {
    const id = ctx.params[0];
    const [{ data: s, error }, { data: members, error: e2 }] = await Promise.all([
      sb.from('squads').select('*, leader:profiles(nick, username)').eq('id', id).maybeSingle(),
      sb.from('squad_members').select('*, profile:profiles(nick, username, pubg_id)').eq('squad_id', id).order('created_at'),
    ]);
    if (error || e2) throw error || e2;
    if (!s) return paint(ctx, emptyPage('Tapılmadı', '<a class="btn" href="#/squads">Klanlar</a>'));
    const me = (members || []).find((m) => m.user_id === uid());
    const myRole = me && me.status === 'member' ? me.role : null;
    const isLeader = myRole === 'leader';
    const staff = hasPerm('squads');
    const canManage = staff || myRole === 'leader' || myRole === 'officer';
    const canLead = staff || isLeader;
    const list = (members || []).filter((m) => m.status === 'member').sort((a, b) => ['leader', 'officer', 'member'].indexOf(a.role) - ['leader', 'officer', 'member'].indexOf(b.role));
    const pend = (members || []).filter((m) => m.status === 'pending');

    let joinBox = '';
    if (!uid()) joinBox = `<a class="btn btn-primary" href="#/login?next=squad/${s.id}">Qoşulmaq üçün daxil ol</a>`;
    else if (me && me.status === 'pending') joinBox = `<div class="row"><span class="chip st-pending">Sorğun göndərilib</span><button class="btn btn-sm btn-ghost" data-act="leave">Geri götür</button></div>`;
    else if (myRole) joinBox = `<div class="row"><span class="chip role-admin">Sən: ${ROLE[myRole]}</span>${isLeader ? '' : '<button class="btn btn-sm btn-ghost" data-act="leave">Çıx</button>'}</div>`;
    else if (!banned() && s.recruiting) joinBox = '<button class="btn btn-primary" data-act="join">Qoşulma sorğusu göndər</button>';
    else if (!s.recruiting) joinBox = '<span class="chip">Hazırda üzv qəbul edilmir</span>';

    const memberRow = (m) => {
      const btns = [];
      if (canManage && m.user_id !== uid() && m.role !== 'leader') {
        if (canLead && m.role === 'member') btns.push(`<button class="btn btn-sm" data-act="m" data-a="promote" data-u="${m.user_id}">Zabit et</button>`);
        if (canLead && m.role === 'officer') btns.push(`<button class="btn btn-sm" data-act="m" data-a="demote" data-u="${m.user_id}">Üzv et</button>`);
        if (canLead) btns.push(`<button class="btn btn-sm" data-act="m" data-a="make_leader" data-u="${m.user_id}">Lider et</button>`);
        if (canLead || m.role === 'member') btns.push(`<button class="btn btn-sm btn-bad" data-act="m" data-a="kick" data-u="${m.user_id}">Çıxar</button>`);
      }
      return `<div class="list-item">${avatar(m.profile)}<div class="grow"><div class="title">${userLink(m.profile)}</div>
        <div class="small muted">${m.profile && m.profile.pubg_id ? 'PUBG ID ' + esc(m.profile.pubg_id) : ''}</div></div>
        <span class="chip ${m.role === 'leader' ? 'role-super' : m.role === 'officer' ? 'role-admin' : ''}">${ROLE[m.role]}</span>
        ${btns.length ? `<div class="row">${btns.join('')}</div>` : ''}</div>`;
    };

    paint(ctx, `<div class="stack-lg">
      <div><a class="back" href="#/squads${s.kind === 'team' ? '?t=team' : ''}">${s.kind === 'clan' ? 'Bütün klanlar' : 'Bütün komandalar'}</a>
        <div class="row-between"><div class="row" style="gap:16px;align-items:center">${emblem(s, 'emblem-lg')}<div><span class="chip">${SQUAD[s.kind]}</span>
          <h1 style="margin-top:8px">${esc(s.name)}${s.tag ? ` <span class="tag" style="font-size:1.4rem">[${esc(s.tag)}]</span>` : ''}</h1>
          <p class="muted small" style="margin-top:4px">${s.members_count}/${SQUAD_MAX[s.kind]} üzv. Yaradılıb: ${fmtDate(s.created_at)}</p></div></div>
          <div>${joinBox}</div></div></div>
      ${s.description ? `<p class="desc">${esc(s.description)}</p>` : ''}
      ${canManage && pend.length ? `<section><h2 style="margin-bottom:10px">Qoşulma sorğuları (${pend.length})</h2><div class="list">${pend.map((m) => `<div class="list-item">
          ${avatar(m.profile)}<div class="grow"><div class="title">${userLink(m.profile)}</div><div class="small muted">${fmtAgo(m.created_at)}</div></div>
          <div class="row"><button class="btn btn-sm btn-ok" data-act="m" data-a="approve" data-u="${m.user_id}">Qəbul et</button>
          <button class="btn btn-sm btn-bad" data-act="m" data-a="reject" data-u="${m.user_id}">Rədd et</button></div></div>`).join('')}</div></section>` : ''}
      <section><h2 style="margin-bottom:10px">Üzvlər</h2><div class="list">${list.map(memberRow).join('')}</div></section>
      ${canLead ? `<section class="panel"><h2>Ayarlar</h2>
        <form data-form="edit" class="form" style="margin-top:12px">
          <div class="grid-2"><div class="field"><label for="se-name">Ad</label><input id="se-name" name="name" type="text" maxlength="30" value="${esc(s.name)}"></div>
          <div class="field"><label for="se-tag">Teq</label><input id="se-tag" name="tag" type="text" maxlength="6" value="${esc(s.tag || '')}"></div></div>
          <div class="field"><label for="se-desc">Haqqında</label><textarea id="se-desc" name="description" maxlength="1000">${esc(s.description || '')}</textarea></div>
          <label class="check" style="margin-top:14px"><input type="checkbox" name="recruiting" ${s.recruiting ? 'checked' : ''}><span>Yeni üzv qəbul edirik</span></label>
          <div class="form-actions"><button class="btn btn-primary btn-sm">Yadda saxla</button><button type="button" class="btn btn-bad btn-sm" data-act="del">Qrupu sil</button></div>
        </form></section>` : ''}
      ${uid() && !myRole ? `<p><button class="btn btn-ghost btn-sm" data-report="squad:${s.id}">${I.flag}Şikayət et</button></p>` : ''}
    </div>`, {
      join: async (el) => busy(el, async () => { const { error: e } = await sb.rpc('squad_join', { p_squad: s.id }); if (e) throw e; toast('Sorğu göndərildi', 'ok'); refresh(); }),
      leave: async () => {
        if (!(await confirmAsk(myRole ? 'Qrupdan çıxmaq?' : 'Sorğunu geri götürmək?', '', 'Bəli', 'btn-bad'))) return;
        const { error: e } = await sb.rpc('squad_leave', { p_squad: s.id }); if (e) return toast(errMsg(e), 'bad'); refresh();
      },
      m: async (el) => {
        const a = el.dataset.a;
        if (a === 'make_leader' && !(await confirmAsk('Liderliyi vermək?', 'Sən zabit olacaqsan.'))) return;
        if (a === 'kick' && !(await confirmAsk('Üzvü çıxarmaq?', '', 'Çıxar', 'btn-bad'))) return;
        busy(el, async () => { const { error: e } = await sb.rpc('squad_manage', { p_squad: s.id, p_user: el.dataset.u, p_action: a }); if (e) throw e; toast('Hazırdır', 'ok'); refresh(); });
      },
      del: async () => {
        if (!(await confirmAsk('Qrupu silmək?', 'Bütün üzvlük məlumatları silinəcək. Geri qaytarılmır.', 'Sil', 'btn-bad'))) return;
        const { error: e } = await sb.from('squads').delete().eq('id', s.id); if (e) return toast(errMsg(e), 'bad');
        toast('Silindi'); go('#/squads');
      },
    }, {
      edit: async (f) => {
        const { error: e } = await sb.from('squads').update({ name: f.name.value.trim(), tag: f.tag.value.trim().toUpperCase() || null, description: f.description.value.trim() || null, recruiting: f.recruiting.checked }).eq('id', s.id);
        if (e) throw e; toast('Yadda saxlanıldı', 'ok'); refresh();
      },
    });
  }

  // ==================================================================
  // ELANLAR
  // ==================================================================
  function contactHTML(c) {
    c = (c || '').trim();
    if (!c) return '';
    let m;
    if ((m = c.match(/^@?([A-Za-z0-9_]{4,32})$/)) && /[A-Za-z]/.test(m[1])) return `<a href="https://t.me/${m[1]}" target="_blank" rel="noopener">@${esc(m[1])}</a>`;
    if ((m = c.match(/^(?:https?:\/\/)?t\.me\/([A-Za-z0-9_]{4,32})$/))) return `<a href="https://t.me/${m[1]}" target="_blank" rel="noopener">@${esc(m[1])}</a>`;
    const digits = c.replace(/[^\d+]/g, '');
    if (/^\+?\d{9,13}$/.test(digits)) {
      const wa = digits.replace(/^\+/, '').replace(/^0/, '994');
      return `<a href="https://wa.me/${wa}" target="_blank" rel="noopener">${esc(c)}</a>`;
    }
    return esc(c);
  }
  const accWarn = (hidden) => `<div class="warn-box ${hidden ? 'hidden' : ''}" id="acc-warn"><b>Diqqət:</b> hesab alqı-satqısı və icarəsi PUBG Mobile qaydalarına ziddir, belə hesablar bloklana bilər. Sayt yalnız elan lövhəsidir və ödənişlərə zəmanət vermir. Tanımadığın adama əvvəlcədən pul göndərmə, şübhəli elanı şikayət et.</div>`;

  function listingCard(l, opts = {}) {
    const mineOrMod = uid() && (l.author_id === uid() || hasPerm('moderation'));
    const expired = !l.is_active || Date.parse(l.expires_at) < Date.now();
    return `<article class="listing">
      <div class="row-between"><span class="chip ${/^account_/.test(l.category) ? 'kind-tournament' : 'kind-scream'}">${CATS[l.category]}</span>
        ${expired ? '<span class="chip st-closed">Aktiv deyil</span>' : `<span class="small dim">${fmtAgo(l.created_at)}</span>`}</div>
      <h3>${esc(l.title)}</h3>
      ${l.price != null ? `<div class="price">${Number(l.price).toFixed(2)} ₼${l.price_unit ? ' <span class="small muted">' + esc(l.price_unit) + '</span>' : ''}</div>` : ''}
      ${l.description ? `<p class="desc">${esc(l.description)}</p>` : ''}
      <div class="row-between" style="margin-top:12px">
        <div class="small">${l.author ? userLink(l.author) : ''}${l.contact ? `<br>Əlaqə: ${contactHTML(l.contact)}` : ''}</div>
        <div class="row" style="gap:6px">
          ${mineOrMod ? `<a class="btn btn-sm" href="#/listing/${l.id}/edit">Redaktə</a>` : ''}
          ${opts.owner && l.author_id === uid() ? `<button class="btn btn-sm" data-act="renew" data-id="${l.id}">30 gün uzat</button>` : ''}
          ${mineOrMod ? `<button class="btn btn-sm btn-bad" data-act="ldel" data-id="${l.id}">Sil</button>` : ''}
          ${uid() && l.author_id !== uid() ? `<button class="icon-btn" title="Şikayət et" aria-label="Şikayət et" data-report="listing:${l.id}">${I.flag}</button>` : ''}
        </div></div>
    </article>`;
  }
  const listingActions = () => ({
    ldel: async (el) => {
      if (!(await confirmAsk('Elanı silmək?', '', 'Sil', 'btn-bad'))) return;
      const { error } = await sb.from('listings').delete().eq('id', el.dataset.id);
      if (error) return toast(errMsg(error), 'bad');
      toast('Elan silindi'); refresh();
    },
    renew: async (el) => {
      const { error } = await sb.rpc('renew_listing', { p_listing: el.dataset.id });
      if (error) return toast(errMsg(error), 'bad');
      toast('Elan 30 gün uzadıldı', 'ok'); refresh();
    },
  });

  async function pageListings(ctx) {
    const cat = CATS[ctx.q.get('c')] ? ctx.q.get('c') : 'all';
    let qb = sb.from('listings').select('*, author:profiles(nick, username)').eq('is_active', true)
      .gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(80);
    if (cat !== 'all') qb = qb.eq('category', cat);
    const { data, error } = await qb;
    if (error) throw error;
    const cta = !uid() ? '<a class="btn" href="#/login?next=listing/new">Elan yerləşdir</a>' : banned() ? '' : `<a class="btn btn-primary" href="#/listing/new${cat !== 'all' ? '?c=' + cat : ''}">${I.plus}Elan yerləşdir</a>`;
    paint(ctx, `<div class="stack">
      ${pageHeadHTML('Elanlar', 'Komanda axtar, oyunçu tap, klanına üzv qəbul et.', 'listings', 'livik', cta)}
      <nav class="tabs"><a href="#/listings" class="${cat === 'all' ? 'on' : ''}">Hamısı</a>${Object.entries(CATS).map(([k, t]) => `<a href="#/listings?c=${k}" class="${cat === k ? 'on' : ''}">${t}</a>`).join('')}</nav>
      ${cat === 'all' || /^account_/.test(cat) ? accWarn(false) : ''}
      ${data.length ? `<div class="listings-grid">${data.map((l) => listingCard(l)).join('')}</div>` : `<div class="empty">Bu bölmədə elan yoxdur.</div>`}
    </div>`, listingActions());
  }

  async function pageListingForm(ctx) {
    if (!requireLogin(ctx)) return;
    if (banned()) return paint(ctx, emptyPage('Bloklanmış hesab elan yerləşdirə bilməz.'));
    const id = ctx.params[0];
    let l = null;
    if (id) {
      const { data, error } = await sb.from('listings').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data || !(data.author_id === uid() || hasPerm('moderation'))) return paint(ctx, emptyPage('Elan tapılmadı'));
      l = data;
    }
    const v = l || { category: CATS[ctx.q.get('c')] ? ctx.q.get('c') : 'looking_for_team', contact: S.profile && S.profile.telegram ? '@' + tgHandle(S.profile.telegram) : '' };
    paint(ctx, `<div class="stack"><h1>${l ? 'Elanı redaktə et' : 'Yeni elan'}</h1>
      <form data-form="listing" class="form panel">
        <div class="field"><label for="l-cat">Bölmə</label><select id="l-cat" name="category">${Object.entries(CATS).map(([k, t]) => `<option value="${k}" ${v.category === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        <div style="margin-top:14px">${accWarn(!/^account_/.test(v.category))}</div>
        <div class="field" style="margin-top:14px"><label for="l-title">Başlıq</label><input id="l-title" name="title" type="text" maxlength="80" required value="${esc(v.title || '')}" placeholder="Məs: Squad üçün 2 aktiv oyunçu axtarırıq"></div>
        <div class="field"><label for="l-desc">Təfərrüat</label><textarea id="l-desc" name="description" maxlength="1500" rows="5" placeholder="Rank, KD, oynadığın saatlar, tələblər...">${esc(v.description || '')}</textarea></div>
        <div class="grid-2">
          <div class="field"><label for="l-price">Qiymət, ₼ <span class="dim">(istəyə görə)</span></label><input id="l-price" name="price" type="number" min="0" step="0.5" value="${v.price != null ? esc(v.price) : ''}"></div>
          <div class="field"><label for="l-unit">Qiymət nəyə görə</label><select id="l-unit" name="price_unit">${['', 'saatlıq', 'günlük', 'həftəlik', 'razılaşma ilə'].map((u) => `<option value="${u}" ${(v.price_unit || '') === u ? 'selected' : ''}>${u || 'Birdəfəlik'}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label for="l-contact">Əlaqə</label><input id="l-contact" name="contact" type="text" maxlength="60" value="${esc(v.contact || '')}" placeholder="@telegram və ya telefon"><span class="hint">Telegram adı (@ ilə) və ya WhatsApp nömrəsi.</span></div>
        <div class="form-actions"><button class="btn btn-primary">${l ? 'Yadda saxla' : 'Yerləşdir'}</button><a class="btn btn-ghost" href="#/listings">İmtina</a></div>
      </form></div>`, {}, {
      listing: async (f) => {
        if (f.title.value.trim().length < 3) throw new Error('Başlıq ən azı 3 simvol olmalıdır');
        const payload = {
          category: f.category.value, title: f.title.value.trim(), description: f.description.value.trim() || null,
          price: f.price.value === '' ? null : Number(f.price.value), price_unit: f.price_unit.value || null, contact: f.contact.value.trim() || null,
        };
        const { error } = l ? await sb.from('listings').update(payload).eq('id', l.id) : await sb.from('listings').insert(payload);
        if (error) throw error;
        toast(l ? 'Yadda saxlanıldı' : 'Elan yerləşdirildi', 'ok'); location.hash = '#/listings?c=' + payload.category;
      },
    });
  }

  // ==================================================================
  // GİRİŞ VƏ QEYDİYYAT
  // ==================================================================
  function nextHash(ctx) { const n = ctx.q.get('next') || ''; return '#/' + (/^[\w\/-]*$/.test(n) ? n : ''); }

  async function pageLogin(ctx) {
    if (uid()) { location.replace(nextHash(ctx)); return; }
    paint(ctx, `<div class="auth-wrap"><div class="auth-art"><div class="aa-svg">${scene('login', MAP_THEMES.erangel, 700, 700, { chutes: 5, plane: true, airdrop: true })}</div>
      <div><h2>Yenidən meydanda</h2><p>Daxil ol və növbəti scream-ə qoşul.</p></div></div><div class="auth-form">
      <h1>Daxil ol</h1>
      <form data-form="login" style="margin-top:16px">
        <div class="field"><label for="l-u">İstifadəçi adı</label><input id="l-u" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required></div>
        <div class="field"><label for="l-p">Şifrə</label><input id="l-p" name="password" type="password" autocomplete="current-password" required></div>
        <button class="btn btn-primary btn-block" style="margin-top:18px">Daxil ol</button>
      </form>
      <p class="small muted" style="margin-top:16px">Hesabın yoxdur? <a href="#/register${ctx.q.get('next') ? '?next=' + encodeURIComponent(ctx.q.get('next')) : ''}">Qeydiyyatdan keç</a></p>
      <p class="small dim" style="margin-top:6px">Şifrəni unutmusan? Adminə yaz, sənə yeni şifrə təyin edəcək.</p>
    </div></div>`, {}, {
      login: async (f) => {
        const u = f.username.value.trim().toLowerCase().replace(/^@/, '');
        const { data, error } = await sb.auth.signInWithPassword({ email: toEmail(u), password: f.password.value });
        if (error) throw error;
        S.session = data.session;
        await loadMe();
        toast('Xoş gəldin, ' + ((S.profile && S.profile.nick) || u) + '!', 'ok');
        location.hash = nextHash(ctx);
      },
    });
  }

  async function pageRegister(ctx) {
    if (uid()) { location.replace('#/'); return; }
    paint(ctx, `<div class="auth-wrap"><div class="auth-art"><div class="aa-svg">${scene('register', MAP_THEMES.miramar, 700, 700, { chutes: 5, crate: true, smoke: true })}</div>
      <div><h2>Komandaya qoşul</h2><p>Screamlər, turnirlər, klanlar: hamısı bir hesabla.</p></div></div><div class="auth-form">
      <h1>Qeydiyyat</h1>
      <p class="muted small" style="margin-top:6px">E-poçt lazım deyil. İstifadəçi adını və şifrəni yadda saxla.</p>
      <form data-form="register" style="margin-top:16px">
        <div class="field"><label for="r-u">İstifadəçi adı</label><input id="r-u" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20" required>
          <span class="hint">3–20 simvol: kiçik latın hərfləri, rəqəm və _ . Sonradan dəyişmir.</span></div>
        <div class="field"><label for="r-n">Oyundakı nikin</label><input id="r-n" name="nick" type="text" maxlength="30" required></div>
        <div class="field"><label for="r-id">PUBG ID <span class="dim">(istəyə görə)</span></label><input id="r-id" name="pubg_id" type="text" inputmode="numeric" maxlength="15" placeholder="5123456789"></div>
        <div class="field"><label for="r-tg">Telegram <span class="dim">(istəyə görə)</span></label><input id="r-tg" name="telegram" type="text" maxlength="33" placeholder="@istifadeci"></div>
        <div class="grid-2">
          <div class="field"><label for="r-p">Şifrə</label><input id="r-p" name="password" type="password" autocomplete="new-password" minlength="6" required></div>
          <div class="field"><label for="r-p2">Şifrə (təkrar)</label><input id="r-p2" name="password2" type="password" autocomplete="new-password" minlength="6" required></div>
        </div>
        <label class="check" style="margin-top:16px"><input type="checkbox" name="rules" required>
          <span class="small">Qaydalarla razıyam: saxta çek, fırıldaq və təhqir qadağandır, pozanlar bloklanır.</span></label>
        <button class="btn btn-primary btn-block" style="margin-top:18px">Qeydiyyatdan keç</button>
      </form>
      <p class="small muted" style="margin-top:16px">Hesabın var? <a href="#/login">Daxil ol</a></p>
    </div></div>`, {}, {
      register: async (f) => {
        const u = f.username.value.trim().toLowerCase();
        const nick = f.nick.value.trim();
        const pubg = f.pubg_id.value.trim();
        const tg = tgHandle(f.telegram.value);
        if (!/^[a-z0-9_]{3,20}$/.test(u)) throw new Error('İstifadəçi adı: 3–20 simvol, yalnız kiçik latın hərfləri, rəqəm və _');
        if (!nick) throw new Error('Oyundakı nikini yaz');
        if (pubg && !/^\d{5,15}$/.test(pubg)) throw new Error('PUBG ID yalnız rəqəmlərdən ibarət olmalıdır');
        if (tg && !/^[A-Za-z0-9_]{4,32}$/.test(tg)) throw new Error('Telegram adı düzgün deyil');
        if (f.password.value.length < 6) throw new Error('Şifrə ən azı 6 simvol olmalıdır');
        if (f.password.value !== f.password2.value) throw new Error('Şifrələr eyni deyil');
        if (!f.rules.checked) throw new Error('Qaydalarla razılaşmalısan');
        const { data: free } = await sb.rpc('username_available', { p_username: u });
        if (free === false) throw new Error('Bu istifadəçi adı artıq tutulub');
        const { data, error } = await sb.auth.signUp({
          email: toEmail(u), password: f.password.value,
          options: { data: { username: u, nick, pubg_id: pubg || null, telegram: tg || null } },
        });
        if (error) throw error;
        S.session = data.session;
        if (!S.session) {
          const r = await sb.auth.signInWithPassword({ email: toEmail(u), password: f.password.value });
          if (r.error) throw r.error;
          S.session = r.data.session;
        }
        await loadMe();
        toast('Xoş gəldin, ' + nick + '!', 'ok');
        location.hash = nextHash(ctx);
      },
    });
  }

  // ==================================================================
  // PROFİL
  // ==================================================================
  function roleChips(p, staffRow) {
    const out = [];
    if (staffRow && staffRow.role === 'super_admin') out.push('<span class="chip role-super">Baş admin</span>');
    else if (staffRow && staffRow.role === 'admin') out.push('<span class="chip role-admin">Admin</span>');
    if (p.is_organizer) out.push('<span class="chip kind-tournament">Təşkilatçı</span>');
    if (p.is_banned) out.push('<span class="chip st-rejected">Bloklu</span>');
    return out.join('');
  }

  async function pageProfile(ctx) {
    if (!requireLogin(ctx)) return;
    const me = uid();
    const p = S.profile;
    if (!p) return paint(ctx, emptyPage('Profil tapılmadı. Çıxıb yenidən daxil olun.', '<button class="btn" data-logout>Çıxış</button>'));
    const [ent, evs, sq, ls] = await Promise.all([
      sb.from('event_entries').select('id, status, reject_reason, created_at, event:events(id, title, starts_at, kind, status)').eq('user_id', me).order('created_at', { ascending: false }).limit(30),
      sb.from('events').select('id, title, starts_at, kind, status, taken, slots').eq('creator_id', me).order('starts_at', { ascending: false }).limit(30),
      sb.from('squad_members').select('status, role, squad:squads(id, name, tag, kind)').eq('user_id', me),
      sb.from('listings').select('*').eq('author_id', me).order('created_at', { ascending: false }),
    ]);
    const myEvents = evs.data || [];
    let pendingBy = {};
    if (myEvents.length) {
      const { data } = await sb.from('event_entries').select('event_id').eq('status', 'pending').in('event_id', myEvents.map((e) => e.id));
      (data || []).forEach((r) => { pendingBy[r.event_id] = (pendingBy[r.event_id] || 0) + 1; });
    }
    const staffRow = S.access.role !== 'user' ? { role: S.access.role } : null;
    const hasAdmin = adminTabs().length > 0;

    paint(ctx, `<div class="stack-lg">
      <div class="row-between"><div class="profile-head">${avatar(p, 'avatar-lg')}<div>
        <h1>${esc(p.nick)}</h1>
        <div class="row" style="margin-top:6px"><span class="muted">@${esc(p.username)}</span>${roleChips(p, staffRow)}</div></div></div>
        <div class="row">${hasAdmin ? `<a class="btn btn-primary" href="#/admin">Admin panel${S.pending ? ` <span class="badge-count">${S.pending}</span>` : ''}</a>` : ''}
          <a class="btn" href="#/u/${esc(p.username)}">Açıq profil</a><button class="btn btn-ghost" data-logout>Çıxış</button></div>
      </div>

      <section><h2 style="margin-bottom:10px">Qoşulmalarım</h2>
        ${(ent.data || []).length ? `<div class="list">${ent.data.filter((e) => e.event).map((e) => `<a class="list-item" href="#/event/${e.event.id}">
          <div class="grow"><div class="title">${esc(e.event.title)}</div><div class="small muted">${fmtFull(e.event.starts_at)}${e.reject_reason ? '. Səbəb: ' + esc(e.reject_reason) : ''}</div></div>
          ${entryChip(e.status)}</a>`).join('')}</div>` : '<div class="empty">Hələ heç bir tədbirə qoşulmamısan. <br><a class="btn" href="#/events">Tədbirlərə bax</a></div>'}
      </section>

      ${myEvents.length ? `<section><h2 style="margin-bottom:10px">Yaratdığım tədbirlər</h2><div class="list">${myEvents.map((e) => `<a class="list-item" href="#/event/${e.id}">
          <div class="grow"><div class="title">${esc(e.title)}</div><div class="small muted">${fmtFull(e.starts_at)}, ${e.taken}/${e.slots} yer</div></div>
          ${pendingBy[e.id] ? `<span class="chip st-pending">${pendingBy[e.id]} gözləyən çek</span>` : ''}${statusChip(e.status)}</a>`).join('')}</div></section>` : ''}

      <section><h2 style="margin-bottom:10px">Klan və komanda</h2>
        ${(sq.data || []).filter((m) => m.squad).length ? `<div class="list">${sq.data.filter((m) => m.squad).map((m) => `<a class="list-item" href="#/squad/${m.squad.id}">
          <div class="grow"><div class="title">${esc(m.squad.name)}${m.squad.tag ? ' <span class="tag">[' + esc(m.squad.tag) + ']</span>' : ''}</div><div class="small muted">${SQUAD[m.squad.kind]}</div></div>
          ${m.status === 'pending' ? '<span class="chip st-pending">Sorğu gözləyir</span>' : `<span class="chip">${ROLE[m.role]}</span>`}</a>`).join('')}</div>`
          : '<div class="empty">Hələ heç bir klanda və ya komandada deyilsən. <br><a class="btn" href="#/squads">Klanlara bax</a></div>'}
      </section>

      <section><div class="section-head"><h2>Elanlarım</h2>${banned() ? '' : '<a href="#/listing/new">Yeni elan</a>'}</div>
        ${(ls.data || []).length ? `<div class="listings-grid">${ls.data.map((l) => listingCard(l, { owner: true })).join('')}</div>` : '<p class="muted">Elanın yoxdur.</p>'}
      </section>

      <section class="panel"><h2>Profil məlumatları</h2>
        <form data-form="profile" class="form" style="margin-top:12px">
          <div class="grid-2">
            <div class="field"><label for="p-n">Oyundakı nik</label><input id="p-n" name="nick" type="text" maxlength="30" required value="${esc(p.nick)}"></div>
            <div class="field"><label for="p-id">PUBG ID</label><input id="p-id" name="pubg_id" type="text" inputmode="numeric" maxlength="15" value="${esc(p.pubg_id || '')}"></div>
          </div>
          <div class="field"><label for="p-tg">Telegram</label><input id="p-tg" name="telegram" type="text" maxlength="33" value="${p.telegram ? '@' + esc(tgHandle(p.telegram)) : ''}" placeholder="@istifadeci"></div>
          <div class="field"><label for="p-bio">Haqqımda</label><textarea id="p-bio" name="bio" maxlength="300" placeholder="Rank, rol (sniper, rusher...), oynadığın saatlar">${esc(p.bio || '')}</textarea></div>
          <div class="form-actions"><button class="btn btn-primary btn-sm">Yadda saxla</button></div>
        </form>
        <form data-form="password" class="form" style="margin-top:24px">
          <h3>Şifrəni dəyiş</h3>
          <div class="grid-2" style="margin-top:10px">
            <div class="field"><label for="p-pw">Yeni şifrə</label><input id="p-pw" name="pw" type="password" autocomplete="new-password" minlength="6" required></div>
            <div class="field"><label for="p-pw2">Təkrar</label><input id="p-pw2" name="pw2" type="password" autocomplete="new-password" minlength="6" required></div>
          </div>
          <div class="form-actions"><button class="btn btn-sm">Şifrəni dəyiş</button></div>
        </form>
      </section>
    </div>`, listingActions(), {
      profile: async (f) => {
        const pubg = f.pubg_id.value.trim(); const tg = tgHandle(f.telegram.value);
        if (!f.nick.value.trim()) throw new Error('Nik boş ola bilməz');
        if (pubg && !/^\d{5,15}$/.test(pubg)) throw new Error('PUBG ID yalnız rəqəmlərdən ibarət olmalıdır');
        if (tg && !/^[A-Za-z0-9_]{4,32}$/.test(tg)) throw new Error('Telegram adı düzgün deyil');
        const { error } = await sb.from('profiles').update({ nick: f.nick.value.trim(), pubg_id: pubg || null, telegram: tg || null, bio: f.bio.value.trim() || null }).eq('id', me);
        if (error) throw error;
        await loadMe(); toast('Yadda saxlanıldı', 'ok'); refresh();
      },
      password: async (f) => {
        if (f.pw.value.length < 6) throw new Error('Şifrə ən azı 6 simvol olmalıdır');
        if (f.pw.value !== f.pw2.value) throw new Error('Şifrələr eyni deyil');
        const { error } = await sb.auth.updateUser({ password: f.pw.value });
        if (error) throw error;
        f.reset(); toast('Şifrə dəyişdirildi', 'ok');
      },
    });
  }

  async function pageUser(ctx) {
    const username = ctx.params[0];
    const { data: p, error } = await sb.from('profiles').select('*').eq('username', username).maybeSingle();
    if (error) throw error;
    if (!p) return paint(ctx, emptyPage('İstifadəçi tapılmadı'));
    const [sq, ls, st] = await Promise.all([
      sb.from('squad_members').select('role, squad:squads(id, name, tag, kind)').eq('user_id', p.id).eq('status', 'member'),
      sb.from('listings').select('*, author:profiles(nick, username)').eq('author_id', p.id).eq('is_active', true).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
      uid() ? sb.from('staff').select('role').eq('user_id', p.id).maybeSingle() : Promise.resolve({ data: null }),
    ]);
    const canAdmin = uid() && (hasPerm('users') || hasPerm('organizers') || isSuper());
    paint(ctx, `<div class="stack-lg">
      <div class="row-between"><div class="profile-head">${avatar(p, 'avatar-lg')}<div><h1>${esc(p.nick)}</h1>
        <div class="row" style="margin-top:6px"><span class="muted">@${esc(p.username)}</span>${roleChips(p, st.data)}</div></div></div>
        <div class="row">${canAdmin && p.id !== uid() ? `<a class="btn btn-sm" href="#/admin/users?q=${esc(p.username)}">Admin paneldə aç</a>` : ''}
          ${uid() && p.id !== uid() ? `<button class="btn btn-sm btn-ghost" data-report="user:${p.id}">${I.flag}Şikayət et</button>` : ''}</div></div>
      <dl class="facts">
        <div><dt>PUBG ID</dt><dd>${p.pubg_id ? `${esc(p.pubg_id)} <button class="icon-btn" style="width:26px;height:26px;vertical-align:middle" data-copy="${esc(p.pubg_id)}" aria-label="PUBG ID-ni kopyala">${I.copy}</button>` : '—'}</dd></div>
        <div><dt>Telegram</dt><dd>${p.telegram ? contactHTML('@' + tgHandle(p.telegram)) : '—'}</dd></div>
        <div><dt>Qeydiyyat</dt><dd>${fmtDate(p.created_at)}</dd></div>
        ${(sq.data || []).filter((m) => m.squad).map((m) => `<div><dt>${SQUAD[m.squad.kind]}</dt><dd><a href="#/squad/${m.squad.id}">${esc(m.squad.name)}</a> <span class="dim small">${ROLE[m.role]}</span></dd></div>`).join('')}
      </dl>
      ${p.bio ? `<p class="desc">${esc(p.bio)}</p>` : ''}
      ${(ls.data || []).length ? `<section><h2 style="margin-bottom:10px">Elanları</h2><div class="listings-grid">${ls.data.map((l) => listingCard(l)).join('')}</div></section>` : ''}
    </div>`, listingActions());
  }

  // ==================================================================
  // ADMİN PANEL
  // ==================================================================
  const ADMIN_TABS = [
    { id: 'overview', name: 'İcmal', icon: 'chart', can: () => isSuper() || (S.access.permissions || []).length > 0, fn: adminOverview },
    { id: 'payments', name: 'Ödənişlər', icon: 'cash', can: () => hasPerm('payments'), fn: adminPayments },
    { id: 'users', name: 'İstifadəçilər', icon: 'users', can: () => hasPerm('users') || hasPerm('organizers'), fn: adminUsers },
    { id: 'admins', name: 'Adminlər', icon: 'shield', can: () => isSuper(), fn: adminAdmins },
    { id: 'reports', name: 'Şikayətlər', icon: 'flag', can: () => hasPerm('moderation'), fn: adminReports },
    { id: 'audit', name: 'Jurnal', icon: 'list', can: () => hasPerm('audit'), fn: adminAudit },
    { id: 'settings', name: 'Ayarlar', icon: 'gear', can: () => isSuper(), fn: adminSettings },
  ];

  async function pageAdmin(ctx) {
    if (!requireLogin(ctx)) return;
    const tabs = adminTabs();
    if (!tabs.length) return paint(ctx, emptyPage('Bu bölməyə giriş icazən yoxdur.'));
    const cur = tabs.find((t) => t.id === ctx.params[0]) || tabs[0];
    const nav = `<nav class="admin-nav" aria-label="Admin menyusu">
      <div class="an-title">Admin <span>${isSuper() ? 'Baş admin' : 'Admin'}</span></div>
      ${tabs.map((t) => `<a href="#/admin/${t.id}" class="${t.id === cur.id ? 'on' : ''}">${I[t.icon] || ''}<span>${t.name}</span>${t.id === 'payments' && S.pending ? `<span class="badge-count">${S.pending}</span>` : ''}</a>`).join('')}
    </nav>`;
    ctx.wrap = (html) => `<div class="admin-layout">${nav}<div class="admin-main">${html}</div></div>`;
    await cur.fn(ctx, `<h1>${esc(cur.name)}</h1>`);
  }

  async function adminOverview(ctx, head) {
    const nowIso = new Date().toISOString();
    const dayEnd = new Date(); dayEnd.setHours(23, 59, 59, 999);
    const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const cnt = (q) => q.then((r) => r.count || 0, () => 0);
    const none = Promise.resolve(0);
    const [pend, today, users, newUsers, reports, squads, listings, upcoming, recent, pendList] = await Promise.all([
      hasPerm('payments') ? cnt(sb.from('event_entries').select('id', { count: 'exact', head: true }).eq('status', 'pending')) : none,
      cnt(sb.from('events').select('id', { count: 'exact', head: true }).in('status', ['open', 'closed']).gte('starts_at', nowIso).lte('starts_at', dayEnd.toISOString())),
      cnt(sb.from('profiles').select('id', { count: 'exact', head: true })),
      cnt(sb.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', weekAgo)),
      hasPerm('moderation') ? cnt(sb.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open')) : none,
      cnt(sb.from('squads').select('id', { count: 'exact', head: true })),
      cnt(sb.from('listings').select('id', { count: 'exact', head: true }).eq('is_active', true).gt('expires_at', nowIso)),
      sb.from('events').select(EV_SEL).in('status', ['open', 'closed']).gte('starts_at', nowIso).order('starts_at').limit(5),
      sb.from('profiles').select('*').order('created_at', { ascending: false }).limit(6),
      hasPerm('payments') ? sb.from('event_entries').select('*, profile:profiles(nick, username), event:events(id, title, entry_fee)').eq('status', 'pending').order('created_at').limit(5) : Promise.resolve({ data: [] }),
    ]);
    const tile = (n, label, icon, href, hot) => `<${href ? `a href="${href}"` : 'div'} class="stat ${hot ? 'hot' : ''}">${I[icon]}<b>${n}</b><span>${label}</span></${href ? 'a' : 'div'}>`;
    const ev = upcoming.data || [];
    const pl = pendList.data || [];
    paint(ctx, `<div class="stack-lg">${head}
      <div class="stat-tiles">
        ${hasPerm('payments') ? tile(pend, 'gözləyən çek', 'cash', '#/admin/payments', pend > 0) : ''}
        ${tile(today, 'bu gün tədbir', 'zone', '#/events')}
        ${tile(users, 'oyunçu', 'users', hasPerm('users') || hasPerm('organizers') ? '#/admin/users' : '')}
        ${tile('+' + newUsers, 'son 7 gündə qeydiyyat', 'user', '')}
        ${hasPerm('moderation') ? tile(reports, 'açıq şikayət', 'flag', '#/admin/reports', reports > 0) : ''}
        ${tile(squads, 'klan və komanda', 'shield', '#/squads')}
        ${tile(listings, 'aktiv elan', 'board', '#/listings')}
      </div>
      <div class="row">
        <a class="btn btn-primary" href="#/event/new?kind=tournament">${I.trophy}Turnir yarat</a>
        <a class="btn" href="#/event/new">${I.plus}Scream yarat</a>
        ${isSuper() ? `<a class="btn" href="#/admin/settings">${I.image}Qarşılama şəkilləri</a>` : ''}
      </div>
      <div class="two-col">
        ${hasPerm('payments') ? `<section><div class="section-head"><h2>Yoxlanılası çeklər</h2><a href="#/admin/payments">Hamısı</a></div>
          ${pl.length ? `<div class="list">${pl.map((e) => `<a class="list-item" href="#/admin/payments">${avatar(e.profile)}<div class="grow"><div class="title">${esc(e.profile ? e.profile.nick : '')}</div>
            <div class="small muted">${esc(e.event ? e.event.title : '')}, ${fmtAgo(e.created_at)}</div></div><b style="color:var(--gold)">${e.event ? money(e.event.entry_fee) : ''}</b></a>`).join('')}</div>`
            : '<div class="empty">Hamısı yoxlanılıb.</div>'}</section>` : ''}
        <section><div class="section-head"><h2>Yaxın tədbirlər</h2><a href="#/events">Hamısı</a></div>
          ${ev.length ? `<div class="list">${ev.map((e) => `<a class="list-item" href="#/event/${e.id}"><div class="grow"><div class="title">${esc(e.title)}</div>
            <div class="small muted">${fmtFull(e.starts_at)}, ${e.taken}/${e.slots} yer</div></div>${kindChip(e.kind)}</a>`).join('')}</div>` : '<div class="empty">Yaxın tədbir yoxdur.</div>'}</section>
        <section><div class="section-head"><h2>Yeni oyunçular</h2>${hasPerm('users') ? '<a href="#/admin/users">Hamısı</a>' : ''}</div>
          <div class="list">${(recent.data || []).map((p) => `<a class="list-item" href="#/u/${esc(p.username)}">${avatar(p)}<div class="grow"><div class="title">${esc(p.nick)}</div>
            <div class="small muted">@${esc(p.username)}, ${fmtAgo(p.created_at)}</div></div></a>`).join('')}</div></section>
      </div>
    </div>`);
  }

  async function adminPayments(ctx, head) {
    const { data, error } = await sb.from('event_entries')
      .select('*, profile:profiles(nick, username), event:events(id, title, starts_at, entry_fee, card_number)')
      .eq('status', 'pending').order('created_at').limit(100);
    if (error) throw error;
    const thumbs = await signedThumbs(data);
    paint(ctx, `<div class="stack-lg">${head}
      <p class="muted">Çekə toxunub böyüt, məbləği və kartı yoxla, sonra təsdiqlə və ya səbəb yazıb ləğv et.</p>
      ${data.length ? `<div class="list">${data.map((e) => `<div class="list-item">
          ${thumbs[e.receipt_path] ? `<img class="receipt-thumb" src="${esc(thumbs[e.receipt_path])}" alt="Çek" data-act="receipt" data-id="${e.id}">` : ''}
          ${avatar(e.profile)}<div class="grow"><div class="title">${userLink(e.profile)}</div>
            <div class="small muted">${e.event ? `<a href="#/event/${e.event.id}">${esc(e.event.title)}</a>, ${fmtFull(e.event.starts_at)}. Məbləğ: <b style="color:var(--flare)">${money(e.event.entry_fee)}</b>, kart ...${esc((e.event.card_number || '').replace(/\s/g, '').slice(-4))}` : ''}</div>
            <div class="small dim">Göndərilib: ${fmtAgo(e.created_at)}</div></div>
          <div class="row"><button class="btn btn-sm btn-ok" data-act="approve" data-id="${e.id}">Təsdiqlə</button><button class="btn btn-sm btn-bad" data-act="reject" data-id="${e.id}">Ləğv et</button></div>
        </div>`).join('')}</div>` : '<div class="empty">Yoxlanılası çek yoxdur.</div>'}
    </div>`, {
      receipt: (el) => { const e = data.find((x) => x.id === el.dataset.id); if (e) showReceipt(e, async (ok) => { if (await reviewEntry(e.id, ok)) refresh(); }); },
      approve: async (el) => { if (await reviewEntry(el.dataset.id, true)) refresh(); },
      reject: async (el) => { if (await reviewEntry(el.dataset.id, false)) refresh(); },
    });
  }

  function permChecks(selected = []) {
    return `<div class="perm-grid">${Object.entries(PERMS).map(([k, t]) => `<label class="check"><input type="checkbox" name="perm" value="${k}" ${selected.includes(k) ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div>`;
  }
  async function editAdmin(userId, name, current) {
    const perms = await ask({
      title: 'Admin icazələri: ' + name,
      text: 'Admin yalnız seçdiyin işləri görə biləcək. Başqasına adminlik verə bilməz.',
      html: permChecks(current), ok: 'Yadda saxla',
      collect: (root) => $$('input[name=perm]:checked', root).map((i) => i.value),
    });
    if (perms === null) return false;
    const { error } = await sb.rpc('grant_admin', { p_user: userId, p_perms: perms });
    if (error) { toast(errMsg(error), 'bad'); return false; }
    toast('İcazələr yadda saxlanıldı', 'ok'); return true;
  }

  async function adminUsers(ctx, head) {
    const q = (ctx.q.get('q') || '').trim();
    let qb = sb.from('profiles').select('*').order('created_at', { ascending: false }).limit(40);
    const s = q.replace(/[^\p{L}\p{N}_ .-]/gu, '').trim();
    if (s) qb = qb.or(`username.ilike."*${s}*",nick.ilike."*${s}*",pubg_id.ilike."*${s}*"`);
    const [{ data, error }, { data: staff }] = await Promise.all([qb, sb.from('staff').select('user_id, role, permissions')]);
    if (error) throw error;
    const staffBy = Object.fromEntries((staff || []).map((r) => [r.user_id, r]));
    const row = (p) => {
      const st = staffBy[p.id];
      const self = p.id === uid();
      const btns = [];
      if (!self && st && st.role === 'super_admin') { /* heç nə */ } else if (!self) {
        const protectedAdmin = st && !isSuper();
        if (hasPerm('users') && !protectedAdmin) {
          btns.push(p.is_banned ? `<button class="btn btn-sm" data-act="unban" data-id="${p.id}">Blokdan çıxar</button>` : `<button class="btn btn-sm btn-bad" data-act="ban" data-id="${p.id}">Blokla</button>`);
          btns.push(`<button class="btn btn-sm" data-act="pw" data-id="${p.id}">Şifrə təyin et</button>`);
        }
        if (hasPerm('organizers')) btns.push(`<button class="btn btn-sm" data-act="org" data-id="${p.id}" data-v="${p.is_organizer ? '0' : '1'}">${p.is_organizer ? 'Təşkilatçılığı götür' : 'Təşkilatçı et'}</button>`);
        if (isSuper()) btns.push(`<button class="btn btn-sm btn-primary" data-act="admin" data-id="${p.id}">${st ? 'İcazələr' : 'Admin et'}</button>`);
      }
      return `<div class="list-item">${avatar(p)}<div class="grow"><div class="title">${userLink(p)}</div>
        <div class="small muted">${p.pubg_id ? 'PUBG ID ' + esc(p.pubg_id) + '. ' : ''}Qeydiyyat: ${fmtDate(p.created_at)}${p.ban_reason ? '. Blok səbəbi: ' + esc(p.ban_reason) : ''}</div></div>
        <div class="row" style="gap:6px">${roleChips(p, st)}</div>${btns.length ? `<div class="row">${btns.join('')}</div>` : ''}</div>`;
    };
    paint(ctx, `<div class="stack-lg">${head}
      <form data-form="search" class="row"><input type="search" name="q" value="${esc(q)}" placeholder="İstifadəçi adı, nik və ya PUBG ID" style="flex:1;min-width:200px" aria-label="Axtar"><button class="btn">Axtar</button></form>
      ${data.length ? `<div class="list">${data.map(row).join('')}</div>` : '<div class="empty">Heç kim tapılmadı.</div>'}
      ${!q ? '<p class="small dim">Son qeydiyyatdan keçən 40 nəfər göstərilir.</p>' : ''}
    </div>`, {
      ban: async (el) => {
        const reason = await ask({ title: 'Bloklamaq', text: 'Səbəb istifadəçiyə görünəcək.', input: true, required: true, placeholder: 'Məs: saxta çek', ok: 'Blokla', okClass: 'btn-bad' });
        if (!reason) return;
        const { error: e } = await sb.rpc('set_ban', { p_user: el.dataset.id, p_value: true, p_reason: reason });
        e ? toast(errMsg(e), 'bad') : (toast('Bloklandı', 'ok'), refresh());
      },
      unban: async (el) => {
        const { error: e } = await sb.rpc('set_ban', { p_user: el.dataset.id, p_value: false, p_reason: null });
        e ? toast(errMsg(e), 'bad') : (toast('Blokdan çıxarıldı', 'ok'), refresh());
      },
      pw: async (el) => {
        const pw = await ask({ title: 'Yeni şifrə təyin et', text: 'Ən azı 6 simvol. Şifrəni istifadəçiyə özün çatdır.', input: 'line', required: true, ok: 'Təyin et' });
        if (!pw) return;
        const { error: e } = await sb.rpc('admin_reset_password', { p_user: el.dataset.id, p_password: pw });
        e ? toast(errMsg(e), 'bad') : toast('Şifrə dəyişdirildi', 'ok');
      },
      org: async (el) => {
        const { error: e } = await sb.rpc('set_organizer', { p_user: el.dataset.id, p_value: el.dataset.v === '1' });
        e ? toast(errMsg(e), 'bad') : (toast('Yeniləndi', 'ok'), refresh());
      },
      admin: async (el) => {
        const p = data.find((x) => x.id === el.dataset.id);
        const st = staffBy[el.dataset.id];
        if (await editAdmin(p.id, p.nick, st ? st.permissions : [])) refresh();
      },
    }, {
      search: async (f) => { location.hash = '#/admin/users' + (f.q.value.trim() ? '?q=' + encodeURIComponent(f.q.value.trim()) : ''); },
    });
  }

  async function adminAdmins(ctx, head) {
    const { data, error } = await sb.from('staff').select('*, profile:profiles(nick, username)').eq('role', 'admin').order('created_at');
    if (error) throw error;
    paint(ctx, `<div class="stack-lg">${head}
      <div class="panel-flat"><p class="small muted">Sən baş adminsən. Sənin adın heç bir siyahıda, jurnalda və təsdiqlərdə başqalarına görünmür: əməliyyatların "Sistem" kimi yazılır. Adminlər başqasına adminlik verə bilmir.</p></div>
      <section><h2 style="margin-bottom:10px">Adminlər (${data.length})</h2>
        ${data.length ? `<div class="stack">${data.map((a) => `<div class="admin-card">
          <div class="row-between"><div class="title">${userLink(a.profile)}</div>
            <div class="row"><button class="btn btn-sm" data-act="edit" data-id="${a.user_id}">İcazələri dəyiş</button><button class="btn btn-sm btn-bad" data-act="revoke" data-id="${a.user_id}">Adminliyi götür</button></div></div>
          <div class="row" style="margin-top:10px;gap:6px">${a.permissions.length ? a.permissions.map((k) => `<span class="chip">${esc(PERMS[k] || k)}</span>`).join('') : '<span class="dim small">Heç bir icazə yoxdur</span>'}</div>
        </div>`).join('')}</div>` : '<div class="empty">Hələ admin yoxdur.</div>'}
      </section>
      <section class="panel"><h2>Yeni admin</h2>
        <form data-form="add" class="form" style="margin-top:12px">
          <div class="field"><label for="a-u">İstifadəçi adı</label><input id="a-u" name="username" type="text" autocapitalize="none" required placeholder="məs: rovsen_az"></div>
          <div class="field"><span class="label">İcazələr</span>${permChecks(['payments'])}</div>
          <div class="form-actions"><button class="btn btn-primary">Admin et</button></div>
        </form></section>
    </div>`, {
      edit: async (el) => { const a = data.find((x) => x.user_id === el.dataset.id); if (await editAdmin(a.user_id, a.profile ? a.profile.nick : '', a.permissions)) refresh(); },
      revoke: async (el) => {
        if (!(await confirmAsk('Adminliyi götürmək?', 'Bu istifadəçi adi istifadəçi olacaq.', 'Götür', 'btn-bad'))) return;
        const { error: e } = await sb.rpc('revoke_admin', { p_user: el.dataset.id });
        e ? toast(errMsg(e), 'bad') : (toast('Adminlik götürüldü', 'ok'), refresh());
      },
    }, {
      add: async (f) => {
        const u = f.username.value.trim().toLowerCase().replace(/^@/, '');
        const { data: p } = await sb.from('profiles').select('id, nick').eq('username', u).maybeSingle();
        if (!p) throw new Error('Bu istifadəçi adı ilə hesab tapılmadı');
        const perms = $$('input[name=perm]:checked', f).map((i) => i.value);
        const { error: e } = await sb.rpc('grant_admin', { p_user: p.id, p_perms: perms });
        if (e) throw e;
        toast(p.nick + ' admin edildi', 'ok'); refresh();
      },
    });
  }

  async function adminReports(ctx, head) {
    const { data, error } = await sb.from('reports').select('*, reporter:profiles(nick, username)').eq('status', 'open').order('created_at').limit(100);
    if (error) throw error;
    const ids = (t) => data.filter((r) => r.target_type === t).map((r) => r.target_id);
    const none = Promise.resolve({ data: [] });
    const [ls, us, sq, ev] = await Promise.all([
      ids('listing').length ? sb.from('listings').select('id, title, author:profiles(nick, username)').in('id', ids('listing')) : none,
      ids('user').length ? sb.from('profiles').select('id, nick, username').in('id', ids('user')) : none,
      ids('squad').length ? sb.from('squads').select('id, name').in('id', ids('squad')) : none,
      ids('event').length ? sb.from('events').select('id, title').in('id', ids('event')) : none,
    ]);
    const by = (arr) => Object.fromEntries((arr.data || []).map((x) => [x.id, x]));
    const L = by(ls), U = by(us), Q = by(sq), E = by(ev);
    const target = (r) => {
      if (r.target_type === 'listing') return L[r.target_id] ? `Elan: <b>${esc(L[r.target_id].title)}</b> (${userLink(L[r.target_id].author)})` : 'Elan (silinib)';
      if (r.target_type === 'user') return U[r.target_id] ? `İstifadəçi: ${userLink(U[r.target_id])}` : 'İstifadəçi (silinib)';
      if (r.target_type === 'squad') return Q[r.target_id] ? `Qrup: <a href="#/squad/${r.target_id}">${esc(Q[r.target_id].name)}</a>` : 'Qrup (silinib)';
      return E[r.target_id] ? `Tədbir: <a href="#/event/${r.target_id}">${esc(E[r.target_id].title)}</a>` : 'Tədbir (silinib)';
    };
    paint(ctx, `<div class="stack-lg">${head}
      ${data.length ? `<div class="list">${data.map((r) => `<div class="list-item"><div class="grow">
          <div>${target(r)}</div><p style="margin-top:6px">${esc(r.reason)}</p>
          <div class="small dim" style="margin-top:4px">Şikayətçi: ${userLink(r.reporter)}, ${fmtAgo(r.created_at)}</div></div>
          <div class="row">${r.target_type === 'listing' && L[r.target_id] ? `<button class="btn btn-sm btn-bad" data-act="dellisting" data-id="${r.target_id}" data-r="${r.id}">Elanı sil</button>` : ''}
          <button class="btn btn-sm" data-act="resolve" data-id="${r.id}">Həll edildi</button></div></div>`).join('')}</div>` : '<div class="empty">Açıq şikayət yoxdur.</div>'}
    </div>`, {
      resolve: async (el) => { const { error: e } = await sb.from('reports').update({ status: 'resolved' }).eq('id', el.dataset.id); e ? toast(errMsg(e), 'bad') : refresh(); },
      dellisting: async (el) => {
        if (!(await confirmAsk('Elanı silmək?', '', 'Sil', 'btn-bad'))) return;
        const { error: e } = await sb.from('listings').delete().eq('id', el.dataset.id);
        if (e) return toast(errMsg(e), 'bad');
        await sb.from('reports').update({ status: 'resolved' }).eq('target_id', el.dataset.id).eq('status', 'open');
        toast('Elan silindi', 'ok'); refresh();
      },
    });
  }

  const AUDIT = {
    admin_grant: 'adminlik verdi və ya icazələri dəyişdi', admin_revoke: 'adminliyi götürdü',
    organizer_on: 'təşkilatçı etdi', organizer_off: 'təşkilatçılığı götürdü', ban: 'blokladı', unban: 'blokdan çıxardı',
    password_reset: 'şifrəni dəyişdi', entry_approve: 'ödənişi təsdiqlədi', entry_reject: 'ödənişi ləğv etdi',
    event_delete: 'tədbiri sildi', listing_delete: 'elanı sildi', squad_delete: 'qrupu sildi',
    squad_approve: 'qrupa üzv qəbul etdi', squad_reject: 'qrup sorğusunu rədd etdi', squad_kick: 'qrupdan üzv çıxardı',
    squad_promote: 'zabit etdi', squad_demote: 'zabitlikdən aldı', squad_make_leader: 'qrupa lider təyin etdi',
  };
  async function adminAudit(ctx, head) {
    const page = Math.max(0, parseInt(ctx.q.get('p') || '0', 10));
    const { data, error } = await sb.rpc('get_audit', { p_limit: 50, p_offset: page * 50 });
    if (error) throw error;
    const detail = (r) => {
      const d = r.details || {};
      const bits = [];
      if (d.nick) bits.push('oyunçu: ' + esc(d.nick));
      if (d.fee) bits.push('məbləğ: ' + money(d.fee));
      if (d.reason) bits.push('səbəb: ' + esc(d.reason));
      if (d.title) bits.push(esc(d.title));
      if (d.name) bits.push(esc(d.name));
      if (Array.isArray(d.permissions)) bits.push('icazələr: ' + (d.permissions.length ? d.permissions.map(esc).join(', ') : 'yox'));
      return bits.length ? `<div class="small muted">${bits.join('; ')}</div>` : '';
    };
    paint(ctx, `<div class="stack-lg">${head}
      ${data.length ? `<div class="list">${data.map((r) => `<div class="audit-row"><span class="small muted">${fmtFull(r.created_at)}</span>
        <div><b>${esc(r.actor)}</b> ${esc(AUDIT[r.action] || r.action)}${r.target_name ? ': ' + esc(r.target_name) : ''}${detail(r)}</div></div>`).join('')}</div>` : '<div class="empty">Jurnal boşdur.</div>'}
      <div class="row">${page > 0 ? `<a class="btn btn-sm" href="#/admin/audit?p=${page - 1}">Yenilər</a>` : ''}${data.length === 50 ? `<a class="btn btn-sm" href="#/admin/audit?p=${page + 1}">Köhnələr</a>` : ''}</div>
    </div>`);
  }

  async function adminSettings(ctx, head) {
    await loadSettings();
    const s = S.settings;
    const photos = Array.isArray(s.hero_images) ? s.hero_images : null;
    paint(ctx, `<div class="stack-lg">${head}
      <section class="panel">
        <h2>Qarşılama şəkilləri</h2>
        <p class="muted small">Ana səhifənin böyük ekranında növbə ilə göstərilir (5 şəklə qədər). Ən yaxşısı geniş (üfüqi) oyun ekran şəkilləridir. Şəkil olmasa, illüstrasiya göstərilir.</p>
        ${photos === null ? '<div class="warn-box" style="margin-top:12px">Bu funksiya üçün Supabase-də <b>supabase/02-dizayn.sql</b> faylını bir dəfə işlət.</div>' : `
        <div class="media-grid" style="margin-top:14px">
          ${photos.map((u, i) => `<div class="media-item"><img src="${esc(u)}" alt="Qarşılama şəkli ${i + 1}"><button class="btn btn-sm btn-bad" data-act="rmphoto" data-i="${i}">Sil</button></div>`).join('')}
          ${photos.length < 5 ? `<label class="media-add">${I.image}<span>Şəkil əlavə et</span><input type="file" accept="image/*" data-act-change="addphoto"></label>` : ''}
        </div>`}
      </section>
      <form data-form="settings" class="form panel">
        <h2>Ümumi</h2>
        <div class="field" style="margin-top:12px"><label for="st-n">Saytın yuxarısındakı elan</label><textarea id="st-n" name="site_notice" maxlength="300" placeholder="Məs: Bu cümə saat 21:00-da AZ Kubok başlayır!">${esc(s.site_notice || '')}</textarea><span class="hint">Boş qalsa, zolaq görünmür.</span></div>
        <div class="field"><label for="st-tg">Telegram qrupunun linki</label><input id="st-tg" name="telegram_group" type="text" value="${esc(s.telegram_group || '')}" placeholder="https://t.me/qrup_adi"></div>
        <h3 style="margin-top:22px">Scream məhdudiyyətləri (adi istifadəçilər üçün)</h3>
        <div class="grid-2" style="margin-top:10px">
          <div class="field"><label for="st-fee">Ən çox giriş haqqı (₼)</label><input id="st-fee" name="max_scream_fee" type="number" min="0" step="0.1" value="${esc(s.max_scream_fee)}"></div>
          <div class="field"><label for="st-sl">Ən çox yer sayı</label><input id="st-sl" name="max_scream_slots" type="number" min="1" max="1000" value="${esc(s.max_scream_slots)}"></div>
        </div>
        <div class="field"><label for="st-op">Bir adamın eyni anda açıq scream sayı</label><input id="st-op" name="max_open_screams" type="number" min="1" max="50" value="${esc(s.max_open_screams)}"></div>
        <div class="form-actions"><button class="btn btn-primary">Yadda saxla</button></div>
      </form></div>`, {
      rmphoto: async (el) => {
        if (!(await confirmAsk('Şəkli silmək?', '', 'Sil', 'btn-bad'))) return;
        const list = photos.filter((_, i) => i !== Number(el.dataset.i));
        const { error } = await sb.from('settings').update({ hero_images: list }).eq('id', 1);
        if (error) return toast(errMsg(error), 'bad');
        toast('Şəkil silindi'); refresh();
      },
    }, {
      settings: async (f) => {
        const tg = f.telegram_group.value.trim();
        if (tg && !/^https:\/\/t\.me\/[\w+\/-]+$/.test(tg)) throw new Error('Telegram linki https://t.me/ ilə başlamalıdır');
        const { error } = await sb.from('settings').update({
          site_notice: f.site_notice.value.trim() || null, telegram_group: tg || null,
          max_scream_fee: Number(f.max_scream_fee.value), max_scream_slots: parseInt(f.max_scream_slots.value, 10), max_open_screams: parseInt(f.max_open_screams.value, 10),
        }).eq('id', 1);
        if (error) throw error;
        await loadSettings(); toast('Ayarlar yadda saxlanıldı', 'ok'); refresh();
      },
    });
    const add = $('[data-act-change="addphoto"]');
    if (add) add.addEventListener('change', async () => {
      const file = add.files[0]; if (!file) return;
      const lbl = add.closest('.media-add'); lbl.querySelector('span').textContent = 'Yüklənir…';
      try {
        const url = await uploadMedia(file, 'hero', 1920);
        const { error } = await sb.from('settings').update({ hero_images: [...photos, url] }).eq('id', 1);
        if (error) throw error;
        await loadSettings(); toast('Şəkil əlavə edildi', 'ok'); refresh();
      } catch (e) { toast(errMsg(e), 'bad'); lbl.querySelector('span').textContent = 'Şəkil əlavə et'; }
    });
  }

  // ------------------------------------------------------------------
  // Başlanğıc
  // ------------------------------------------------------------------
  (async function init() {
    document.title = SITE + ' — PUBG Mobile turnirləri və screamlər';
    $('#brand-name').textContent = SITE.toUpperCase();
    renderChrome('');
    app.innerHTML = '<div class="loading">Yüklənir…</div>';
    try {
      const { data } = await sb.auth.getSession();
      S.session = data.session;
      await Promise.all([loadSettings(), loadMe()]);
    } catch (e) { console.error(e); }
    sb.auth.onAuthStateChange((event, session) => {
      const changed = ((session && session.user && session.user.id) || null) !== uid();
      S.session = session;
      if (changed) setTimeout(() => loadMe().then(() => render({ keep: true })).catch(console.error), 0);
    });
    render();
  })();
})();
