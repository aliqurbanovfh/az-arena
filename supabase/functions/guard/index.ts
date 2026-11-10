// AZ Arena — guard (Supabase Edge Function). Artıq Supabase-də yerləşdirilib.
// Ziyarətçinin IP-sini oxuyur, Tor çıxış nöqtəsidirsə bildirir, daxil olmuş istifadəçinin IP-sini qeydə alır.
import { createClient } from 'npm:@supabase/supabase-js@2';

const TOR_LIST = 'https://check.torproject.org/torbulkexitlist';
let torSet: Set<string> | null = null;
let torAt = 0;

async function torList(): Promise<Set<string>> {
  if (torSet && Date.now() - torAt < 60 * 60 * 1000) return torSet;
  try {
    const r = await fetch(TOR_LIST, { signal: AbortSignal.timeout(4000) });
    if (r.ok) {
      const t = await r.text();
      torSet = new Set(t.split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#')));
      torAt = Date.now();
    }
  } catch (_) { /* siyahı alınmasa, köhnəsi və ya boş */ }
  return torSet ?? new Set();
}

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for') || '';
  const first = xff.split(',')[0].trim();
  return first || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || '';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const ip = clientIp(req);
  const tor = ip ? (await torList()).has(ip) : false;

  let userId: string | null = null;
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (token && token.split('.').length === 3) {
      const { data } = await admin.auth.getUser(token);
      userId = data?.user?.id ?? null;
    }
    if (userId && ip) {
      await admin.rpc('record_ip', {
        p_user: userId, p_ip: ip, p_tor: tor, p_ua: (req.headers.get('user-agent') || '').slice(0, 300),
      });
    }
  } catch (e) {
    console.error('guard', e);
  }

  return new Response(JSON.stringify({ ip, tor, logged: !!userId }), {
    headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
});
