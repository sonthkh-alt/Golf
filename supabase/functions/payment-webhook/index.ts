// Golf Academy — webhook thanh toán Lemon Squeezy → cấp/gia hạn/thu hồi Pro trong golf_entitlements.
// Triển khai:  supabase functions deploy payment-webhook --no-verify-jwt
// Biến môi trường: supabase secrets set LEMON_SIGNING_SECRET=...   (SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY có sẵn)
// Lemon Squeezy → Settings → Webhooks: URL = https://<project>.supabase.co/functions/v1/payment-webhook
//   Sự kiện: order_created, subscription_created, subscription_updated, subscription_cancelled,
//            subscription_resumed, subscription_expired, subscription_payment_success
// Link thanh toán do app tạo đã kèm checkout[custom][user_id] = id tài khoản người mua.

const SECRET = Deno.env.get("LEMON_SIGNING_SECRET") ?? "";
const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function upsert(row: Record<string, unknown>) {
  const res = await fetch(`${SB_URL}/rest/v1/golf_entitlements?on_conflict=user_id`, {
    method: "POST",
    headers: {
      apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ ...row, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`upsert ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
  const raw = await req.text();
  const sig = req.headers.get("x-signature") ?? "";
  if (!SECRET || !safeEqual(await hmacHex(SECRET, raw), sig)) return new Response("bad signature", { status: 401 });

  let ev: any;
  try { ev = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }
  const name: string = ev?.meta?.event_name ?? "";
  const uid: string | undefined = ev?.meta?.custom_data?.user_id;
  const a = ev?.data?.attributes ?? {};
  if (!uid || !/^[0-9a-f-]{36}$/i.test(uid)) return new Response("no user_id — ignored", { status: 200 });

  const DAY = 86400000;
  let until: string | null = null;
  if (name === "order_created") {
    // Mua đứt / gói năm trả một lần: variant có chữ "year" → 366 ngày, còn lại 31 ngày
    if (a.status !== "paid") return new Response("order not paid", { status: 200 });
    const yearly = /year|năm|annual/i.test(`${a.first_order_item?.variant_name ?? ""} ${a.first_order_item?.product_name ?? ""}`);
    until = new Date(Date.now() + (yearly ? 366 : 31) * DAY).toISOString();
  } else if (name.startsWith("subscription_")) {
    const st: string = a.status ?? "";
    if (["active", "on_trial", "past_due"].includes(st)) until = a.renews_at ?? a.ends_at ?? new Date(Date.now() + 31 * DAY).toISOString();
    else if (st === "cancelled") until = a.ends_at ?? a.renews_at ?? new Date().toISOString();   // còn dùng tới hết kỳ đã trả
    else if (["expired", "unpaid", "paused"].includes(st)) until = new Date().toISOString();
    else return new Response("status ignored", { status: 200 });
    // ân hạn 2 ngày cho gia hạn tự động bị trễ
    if (until && ["active", "past_due"].includes(st)) until = new Date(Date.parse(until) + 2 * DAY).toISOString();
  } else {
    return new Response("event ignored", { status: 200 });
  }

  try {
    await upsert({ user_id: uid, plan: "pro", pro_until: until, source: "lemonsqueezy", ref: `${name}:${ev?.data?.id ?? ""}` });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
  return new Response("ok", { status: 200 });
});
