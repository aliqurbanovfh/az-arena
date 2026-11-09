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
    app.innerHTML = html;
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

  function eventRow(e) {
    const pct = Math.min(100, Math.round((e.taken / e.slots) * 100));
    const meta = [e.mode, e.map].filter(Boolean).join(', ');
    const host = hostName(e);
    return `<a class="board-row" href="#/event/${e.id}">
      <div class="br-time"><span class="br-hm">${fmtHM(e.starts_at)}</span><span class="br-day">${fmtDay(e.starts_at)}</span></div>
      <div class="br-main"><div class="row" style="gap:6px">${kindChip(e.kind)}${statusChip(e.status)}</div>
        <h3>${esc(e.title)}</h3><p>${esc(meta)}${meta && host ? '. ' : ''}${host ? 'Təşkilatçı: ' + esc(host) : ''}</p></div>
      <div class="br-side"><span class="fee ${Number(e.entry_fee) === 0 ? 'free' : ''}">${money(e.entry_fee)}</span>
        <span class="slots"><b>${e.taken}</b>/${e.slots} yer</span>
        <div class="bar ${e.taken >= e.slots ? 'full' : ''}"><i style="width:${pct}%"></i></div></div>
    </a>`;
  }

  // ==================================================================
  // ANA SƏHİFƏ
  // ==================================================================
  async function pageHome(ctx) {
    const since = new Date(Date.now() - 3 * 3600e3).toISOString();
    const { data, error } = await sb.from('events').select(EV_SEL).in('status', ['open', 'closed'])
      .gte('starts_at', since).order('starts_at').limit(15);
    if (error) throw error;
    const now = Date.now();
    const upcoming = data.filter((e) => Date.parse(e.starts_at) > now);
    const next = upcoming.find((e) => e.status === 'open' && e.taken < e.slots) || upcoming[0];
    const rest = data.filter((e) => e !== next);
    const createBtn = uid() && !banned() ? '<a class="btn" href="#/event/new">Scream yarat</a>' : '';

    const hero = next ? `<section class="hero">
        <div>
          <p class="hero-kicker">Növbəti tədbir: ${fmtFull(next.starts_at)}</p>
          <h1><a href="#/event/${next.id}">${esc(next.title)}</a></h1>
          <div class="row">${kindChip(next.kind)}<span class="muted">${esc([next.mode, next.map].filter(Boolean).join(', '))}</span></div>
          <dl class="hero-meta">
            <div><dt>Giriş haqqı</dt><dd style="color:${Number(next.entry_fee) ? 'var(--flare)' : 'var(--ok)'}">${money(next.entry_fee)}</dd></div>
            <div><dt>Yerlər</dt><dd class="num">${next.taken}/${next.slots}</dd></div>
            ${next.prize ? `<div><dt>Mükafat</dt><dd>${esc(next.prize)}</dd></div>` : ''}
          </dl>
          <div class="row"><a class="btn btn-primary" href="#/event/${next.id}">Qoşul</a>${createBtn}</div>
        </div>
        ${zoneHTML(next)}
      </section>`
      : `<section class="hero hero-empty"><div class="stack">
          <p class="hero-kicker">${esc(SITE)}</p>
          <h1>Hələ açıq tədbir yoxdur</h1>
          <p class="muted">Dostlarını topla və ilk scream-i sən aç: otaq kodu təsdiqlənən oyunçulara özü açılacaq.</p>
          <div class="row">${uid() ? '<a class="btn btn-primary" href="#/event/new">Scream yarat</a>' : '<a class="btn btn-primary" href="#/register">Qeydiyyatdan keç</a>'}</div>
        </div></section>`;

    const steps = uid() ? '' : `<section><h2 style="margin-bottom:12px">Necə işləyir</h2><div class="steps">
        <div class="step"><h3>Qeydiyyatdan keç</h3><p>İstifadəçi adı və şifrə kifayətdir, e-poçt lazım deyil.</p></div>
        <div class="step"><h3>Ödənişi et, çeki yüklə</h3><p>Giriş haqqını tədbirin kartına köçür və çekin şəklini sayta yüklə.</p></div>
        <div class="step"><h3>Otaq kodunu al</h3><p>Təsdiqdən sonra otaq ID və şifrəsi başlamazdan bir az əvvəl burada açılır.</p></div>
      </div></section>`;

    paint(ctx, `<div class="stack-lg">${hero}${steps}
      <section><div class="section-head"><h2>Yaxın tədbirlər</h2><a href="#/events">Hamısına bax</a></div>
        ${rest.length ? `<div class="board">${rest.map(eventRow).join('')}</div>` : '<div class="empty">Başqa yaxın tədbir yoxdur.</div>'}
      </section></div>`);
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
      <div class="row-between"><h1>Tədbirlər</h1>${cta}</div>
      <nav class="tabs" aria-label="Filtr">${tabs.map(([k, t]) => `<a href="#/events${k === 'all' ? '' : '?t=' + k}" class="${tab === k ? 'on' : ''}">${t}</a>`).join('')}</nav>
      ${data.length ? `<div class="board">${data.map(eventRow).join('')}</div>`
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
          <div class="grow"><div class="title">${userLink(e.profile)}</div>
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
      <div class="ev-head"><div>
        <a class="back" href="#/events">Bütün tədbirlər</a>
        <div class="row" style="gap:6px">${kindChip(ev.kind)}${statusChip(ev.status)}</div>
        <h1>${esc(ev.title)}</h1>
        ${ev.creator ? `<p class="muted small">Yaradan: ${userLink(ev.creator)}</p>` : ''}
      </div>${ev.status === 'cancelled' ? '' : zoneHTML(ev, 'zone-sm')}</div>
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
      <div class="row-between"><h1>Klanlar və komandalar</h1>${cta}</div>
      <nav class="tabs"><a href="#/squads" class="${kind === 'clan' ? 'on' : ''}">Klanlar</a><a href="#/squads?t=team" class="${kind === 'team' ? 'on' : ''}">Komandalar</a></nav>
      <p class="muted small">${kind === 'clan' ? 'Klan: böyük birlik, 100 nəfərə qədər.' : 'Komanda (ekip): turnirlərə birlikdə çıxanlar, 4 əsas + 2 ehtiyat.'} Hər oyunçu yalnız bir ${kind === 'clan' ? 'klanda' : 'komandada'} ola bilər.</p>
      ${data.length > 6 ? `<input type="search" placeholder="Ada görə axtar" data-filter=".squad-card" aria-label="Axtar">` : ''}
      ${data.length ? `<div class="squad-grid">${data.map((s) => `<a class="squad-card" href="#/squad/${s.id}" data-name="${esc((s.name + ' ' + (s.tag || '')).toLowerCase())}">
          <h3>${esc(s.name)}${s.tag ? ` <span class="tag">[${esc(s.tag)}]</span>` : ''}</h3>
          ${s.description ? `<p class="muted small" style="margin-top:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${esc(s.description)}</p>` : ''}
          <div class="row" style="margin-top:10px">
            <span class="chip num">${s.members_count}/${SQUAD_MAX[s.kind]}</span>
            ${s.recruiting ? '<span class="chip st-approved">Üzv qəbul edir</span>' : '<span class="chip">Qəbul bağlıdır</span>'}
            ${mineIds.has(s.id) ? '<span class="chip role-admin">Sənin</span>' : ''}
          </div>
          <p class="small dim" style="margin-top:8px">Lider: ${esc(s.leader ? s.leader.nick : '—')}</p></a>`).join('')}</div>`
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
      return `<div class="list-item"><div class="grow"><div class="title">${userLink(m.profile)}</div>
        <div class="small muted">${m.profile && m.profile.pubg_id ? 'PUBG ID ' + esc(m.profile.pubg_id) : ''}</div></div>
        <span class="chip ${m.role === 'leader' ? 'role-super' : m.role === 'officer' ? 'role-admin' : ''}">${ROLE[m.role]}</span>
        ${btns.length ? `<div class="row">${btns.join('')}</div>` : ''}</div>`;
    };

    paint(ctx, `<div class="stack-lg">
      <div><a class="back" href="#/squads${s.kind === 'team' ? '?t=team' : ''}">${s.kind === 'clan' ? 'Bütün klanlar' : 'Bütün komandalar'}</a>
        <div class="row-between"><div><span class="chip">${SQUAD[s.kind]}</span>
          <h1 style="margin-top:8px">${esc(s.name)}${s.tag ? ` <span class="tag" style="font-size:1.4rem">[${esc(s.tag)}]</span>` : ''}</h1>
          <p class="muted small" style="margin-top:4px">${s.members_count}/${SQUAD_MAX[s.kind]} üzv. Yaradılıb: ${fmtDate(s.created_at)}</p></div>
          <div>${joinBox}</div></div></div>
      ${s.description ? `<p class="desc">${esc(s.description)}</p>` : ''}
      ${canManage && pend.length ? `<section><h2 style="margin-bottom:10px">Qoşulma sorğuları (${pend.length})</h2><div class="list">${pend.map((m) => `<div class="list-item">
          <div class="grow"><div class="title">${userLink(m.profile)}</div><div class="small muted">${fmtAgo(m.created_at)}</div></div>
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
      <div class="row-between"><h1>Elanlar</h1>${cta}</div>
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
    paint(ctx, `<div class="auth-box panel">
      <h1>Daxil ol</h1>
      <form data-form="login" style="margin-top:16px">
        <div class="field"><label for="l-u">İstifadəçi adı</label><input id="l-u" name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required></div>
        <div class="field"><label for="l-p">Şifrə</label><input id="l-p" name="password" type="password" autocomplete="current-password" required></div>
        <button class="btn btn-primary btn-block" style="margin-top:18px">Daxil ol</button>
      </form>
      <p class="small muted" style="margin-top:16px">Hesabın yoxdur? <a href="#/register${ctx.q.get('next') ? '?next=' + encodeURIComponent(ctx.q.get('next')) : ''}">Qeydiyyatdan keç</a></p>
      <p class="small dim" style="margin-top:6px">Şifrəni unutmusan? Adminə yaz, sənə yeni şifrə təyin edəcək.</p>
    </div>`, {}, {
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
    paint(ctx, `<div class="auth-box panel">
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
    </div>`, {}, {
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
      <div class="row-between"><div>
        <h1>${esc(p.nick)}</h1>
        <div class="row" style="margin-top:6px"><span class="muted">@${esc(p.username)}</span>${roleChips(p, staffRow)}</div></div>
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
      <div class="row-between"><div><h1>${esc(p.nick)}</h1>
        <div class="row" style="margin-top:6px"><span class="muted">@${esc(p.username)}</span>${roleChips(p, st.data)}</div></div>
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
    { id: 'payments', name: 'Ödənişlər', can: () => hasPerm('payments'), fn: adminPayments },
    { id: 'users', name: 'İstifadəçilər', can: () => hasPerm('users') || hasPerm('organizers'), fn: adminUsers },
    { id: 'admins', name: 'Adminlər', can: () => isSuper(), fn: adminAdmins },
    { id: 'reports', name: 'Şikayətlər', can: () => hasPerm('moderation'), fn: adminReports },
    { id: 'audit', name: 'Jurnal', can: () => hasPerm('audit'), fn: adminAudit },
    { id: 'settings', name: 'Ayarlar', can: () => isSuper(), fn: adminSettings },
  ];

  async function pageAdmin(ctx) {
    if (!requireLogin(ctx)) return;
    const tabs = adminTabs();
    if (!tabs.length) return paint(ctx, emptyPage('Bu bölməyə giriş icazən yoxdur.'));
    const cur = tabs.find((t) => t.id === ctx.params[0]) || tabs[0];
    const head = `<div class="stack"><h1>Admin panel</h1>
      <nav class="tabs">${tabs.map((t) => `<a href="#/admin/${t.id}" class="${t.id === cur.id ? 'on' : ''}">${t.name}${t.id === 'payments' && S.pending ? ` <span class="badge-count">${S.pending}</span>` : ''}</a>`).join('')}</nav></div>`;
    await cur.fn(ctx, head);
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
          <div class="grow"><div class="title">${userLink(e.profile)}</div>
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
      return `<div class="list-item"><div class="grow"><div class="title">${userLink(p)}</div>
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
    paint(ctx, `<div class="stack-lg">${head}
      <form data-form="settings" class="form panel">
        <div class="field"><label for="st-n">Saytın yuxarısındakı elan</label><textarea id="st-n" name="site_notice" maxlength="300" placeholder="Məs: Bu cümə saat 21:00-da AZ Kubok başlayır!">${esc(s.site_notice || '')}</textarea><span class="hint">Boş qalsa, zolaq görünmür.</span></div>
        <div class="field"><label for="st-tg">Telegram qrupunun linki</label><input id="st-tg" name="telegram_group" type="text" value="${esc(s.telegram_group || '')}" placeholder="https://t.me/qrup_adi"></div>
        <h3 style="margin-top:22px">Scream məhdudiyyətləri (adi istifadəçilər üçün)</h3>
        <div class="grid-2" style="margin-top:10px">
          <div class="field"><label for="st-fee">Ən çox giriş haqqı (₼)</label><input id="st-fee" name="max_scream_fee" type="number" min="0" step="0.1" value="${esc(s.max_scream_fee)}"></div>
          <div class="field"><label for="st-sl">Ən çox yer sayı</label><input id="st-sl" name="max_scream_slots" type="number" min="1" max="1000" value="${esc(s.max_scream_slots)}"></div>
        </div>
        <div class="field"><label for="st-op">Bir adamın eyni anda açıq scream sayı</label><input id="st-op" name="max_open_screams" type="number" min="1" max="50" value="${esc(s.max_open_screams)}"></div>
        <div class="form-actions"><button class="btn btn-primary">Yadda saxla</button></div>
      </form></div>`, {}, {
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
