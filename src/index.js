const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE = "csr_session";
const PBKDF2_ITERS = 100000;

function json(data, status = 200, extraHeaders) {
  const headers = new Headers(securityHeaders());
  headers.set("content-type", "application/json; charset=utf-8");
  if (extraHeaders) {
    for (const [key, value] of Object.entries(extraHeaders)) headers.set(key, value);
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":
      "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com; script-src 'self' 'unsafe-inline' https://code.jquery.com https://cdn.jsdelivr.net https://unpkg.com; connect-src 'self';"
  };
}

function applySecurity(response) {
  const headers = new Headers(response.headers);
  const extra = securityHeaders();
  for (const [key, value] of Object.entries(extra)) {
    headers.set(key, value);
  }
  const contentType = (headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("text/html")) {
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

const rateBuckets = new Map();

function clientIp(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("CF-Connecting-IPv6") || "unknown";
}

function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  let rec = rateBuckets.get(key);
  if (!rec || now - rec.started > windowMs) {
    rec = { started: now, count: 0 };
  }
  rec.count += 1;
  rateBuckets.set(key, rec);
  if (rateBuckets.size > 4000) {
    for (const [k, v] of rateBuckets) {
      if (now - v.started > windowMs) rateBuckets.delete(k);
    }
  }
  return rec.count <= limit;
}

const PHONE_RE = /^[0-9+\s-]{8,20}$/;

function error(message, status = 400) {
  return json({ error: message }, status);
}

function bytesToB64(bytes) {
  let binary = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary);
}

function b64ToBytes(value) {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let hex = "";
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, "0");
  return hex;
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt, iterations: PBKDF2_ITERS, hash: "SHA-256" },
    key,
    256
  );
  return "pbkdf2$" + PBKDF2_ITERS + "$" + bytesToB64(salt) + "$" + bytesToB64(bits);
}

async function verifyPassword(password, stored) {
  try {
    if (!stored || typeof stored !== "string") return false;
    const parts = stored.split("$");
    if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
    const iterations = Number(parts[1]);
    if (!Number.isFinite(iterations) || iterations < 1000) return false;
    const salt = b64ToBytes(parts[2]);
    const expected = b64ToBytes(parts[3]);
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: salt, iterations: iterations, hash: "SHA-256" },
      key,
      expected.length * 8
    );
    return timingSafeEqual(new Uint8Array(bits), expected);
  } catch (err) {
    return false;
  }
}

function parseCookies(request) {
  const header = request.headers.get("Cookie") || "";
  const out = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    out[k] = decodeURIComponent(v);
  }
  return out;
}

function sessionCookie(token, maxAge) {
  const parts = [
    COOKIE + "=" + encodeURIComponent(token),
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax"
  ];
  if (maxAge === 0) parts.push("Max-Age=0");
  else parts.push("Max-Age=604800");
  return parts.join("; ");
}

function publicProfile(row) {
  if (!row) return null;
  const roleLabel = row.role === "collector" ? "Collector" : row.role === "nodal" ? "Nodal" : "Sponsor";
  return {
    id: row.id,
    email: row.email,
    role: roleLabel,
    roleKey: row.role,
    name: row.display_name,
    title: row.title || "",
    company: row.company || "",
    phone: row.phone || "",
    mandal: row.mandal || ""
  };
}

function isStaff(user) {
  return user && (user.role === "collector" || user.role === "nodal");
}

async function readJson(request) {
  const text = await request.text();
  if (!text) return {};
  if (text.length > 20000) throw new Error("Payload too large");
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error("Invalid JSON");
  }
}

async function ensureStaff(env) {
  const existing = await env.DB.prepare("SELECT COUNT(*) AS c FROM profiles WHERE role IN ('collector', 'nodal')").first();
  if (existing && Number(existing.c) > 0) return;
  const collectorPass = String(env.COLLECTOR_PASSWORD || "").replace(/\r?\n/g, "");
  const nodalPass = String(env.NODAL_PASSWORD || "").replace(/\r?\n/g, "");
  if (!collectorPass || !nodalPass) return;
  await createProfile(env, {
    role: "collector",
    display_name: "District Collector",
    title: "District Collector, Sri Sathya Sai District",
    email: "collector-sssai@ap.gov.in",
    password: collectorPass
  });
  await createProfile(env, {
    role: "nodal",
    display_name: "CSR Nodal Officer",
    title: "CSR Nodal Officer, Sri Sathya Sai District",
    email: "csr.sssdistrict@gmail.com",
    password: nodalPass
  });
}

async function createProfile(env, fields) {
  const id = crypto.randomUUID();
  const password_hash = await hashPassword(fields.password);
  await env.DB.prepare(
    `INSERT INTO profiles (id, role, display_name, title, company, email, phone, mandal, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      fields.role,
      fields.display_name,
      fields.title || null,
      fields.company || null,
      String(fields.email).trim().toLowerCase(),
      fields.phone || null,
      fields.mandal || null,
      password_hash
    )
    .run();
  return id;
}

async function getUserFromRequest(request, env) {
  const token = parseCookies(request)[COOKIE];
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT p.id, p.role, p.display_name, p.title, p.company, p.email, p.phone, p.mandal
     FROM sessions s JOIN profiles p ON p.id = s.user_id
     WHERE s.token = ? AND s.expires_at > datetime('now')`
  )
    .bind(token)
    .first();
  return row || null;
}

async function createSession(env, userId) {
  const token = randomToken();
  await env.DB.prepare(
    "INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, datetime('now', '+7 days'))"
  )
    .bind(token, userId)
    .run();
  return token;
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();

    if (path === "/api/health" && method === "GET") {
      return json({ ok: true, platform: "cloudflare" });
    }

    try {
    await ensureStaff(env);

    if (path === "/api/auth/login" && method === "POST") {
      if (!rateLimit("login:" + clientIp(request), 8, 15 * 60 * 1000)) {
        return error("Too many sign-in attempts. Please wait and try again.", 429);
      }
      const body = await readJson(request);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!EMAIL_RE.test(email) || password.length < 8) return error("Invalid email or password.", 401);
      const row = await env.DB.prepare("SELECT * FROM profiles WHERE email = ?").bind(email).first();
      if (!row || !(await verifyPassword(password, row.password_hash))) {
        return error("Invalid email or password.", 401);
      }
      const token = await createSession(env, row.id);
      return json({ user: publicProfile(row) }, 200, { "Set-Cookie": sessionCookie(token) });
    }

    if (path === "/api/auth/logout" && method === "POST") {
      const token = parseCookies(request)[COOKIE];
      if (token) await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
      return json({ ok: true }, 200, { "Set-Cookie": sessionCookie("deleted", 0) });
    }

    if (path === "/api/auth/signup" && method === "POST") {
      if (!rateLimit("signup:" + clientIp(request), 5, 60 * 60 * 1000)) {
        return error("Too many account requests. Please wait and try again.", 429);
      }
      const body = await readJson(request);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const company = String(body.company || "").trim();
      const display_name = String(body.display_name || company || email.split("@")[0]).trim();
      if (!EMAIL_RE.test(email) || password.length < 8) return error("Use a valid email and a password of at least 8 characters.");
      if (company.length < 2) return error("Company name is required.");
      const exists = await env.DB.prepare("SELECT id FROM profiles WHERE email = ?").bind(email).first();
      if (exists) return error("An account already exists for this email. Sign in instead.");
      const id = await createProfile(env, {
        role: "sponsor",
        display_name: display_name.slice(0, 120),
        company: company.slice(0, 200),
        email: email,
        password: password
      });
      await env.DB.prepare(
        "INSERT INTO sponsors (user_id, company, email, status) VALUES (?, ?, ?, 'Active')"
      )
        .bind(id, company.slice(0, 200), email)
        .run();
      const token = await createSession(env, id);
      const row = await env.DB.prepare("SELECT * FROM profiles WHERE id = ?").bind(id).first();
      return json({ user: publicProfile(row) }, 201, { "Set-Cookie": sessionCookie(token) });
    }

    if (path === "/api/me" && method === "GET") {
      const user = await getUserFromRequest(request, env);
      if (!user) return json({ user: null });
      return json({ user: publicProfile(user) });
    }

    if (path === "/api/proposals" && method === "POST") {
      if (!rateLimit("eoi:" + clientIp(request), 6, 60 * 60 * 1000)) {
        return error("Too many proposals from this network. Please try again later.", 429);
      }
      const body = await readJson(request);
      const company_name = String(body.company_name || "").trim();
      const contact_person = String(body.contact_person || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const phone = String(body.phone || "").trim();
      const sector = String(body.sector || "").trim();
      const outlay_amount = String(body.outlay_amount || "").trim();
      const location = String(body.location || "Sri Sathya Sai District").trim();
      const details = String(body.details || "").trim() || null;
      const consent_given = body.consent_given === true || body.consent_given === 1 || body.consent_given === "1";
      if (!consent_given) {
        return error("Affirmative consent under the Digital Personal Data Protection Act, 2023 is required.");
      }
      if (company_name.length < 2 || contact_person.length < 2 || !EMAIL_RE.test(email) || !phone || !sector || !outlay_amount) {
        return error("Please complete all required proposal fields.");
      }
      if (!PHONE_RE.test(phone) || phone.replace(/\D/g, "").length < 10) {
        return error("Enter a valid phone number with at least 10 digits.");
      }
      const insert = await env.DB.prepare(
        `INSERT INTO proposals (company_name, contact_person, email, phone, sector, outlay_amount, location, details, consent_given, nodal_status, sponsor_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'Submitted', 'Viewed')
         RETURNING id`
      )
        .bind(company_name.slice(0, 200), contact_person.slice(0, 120), email, phone.slice(0, 40), sector.slice(0, 80), outlay_amount.slice(0, 80), location.slice(0, 120), details)
        .first();
      return json({ ok: true, id: insert && insert.id ? insert.id : null }, 201);
    }

    if (path === "/api/proposals" && method === "GET") {
      const user = await getUserFromRequest(request, env);
      if (!user) return error("Sign in required.", 401);
      let rows;
      if (isStaff(user)) {
        rows = await env.DB.prepare(
          `SELECT id, company_name, contact_person, email, phone, sector, outlay_amount, location, details, nodal_status, sponsor_status, nodal_notes, created_at, sponsor_user_id
           FROM proposals ORDER BY created_at DESC`
        ).all();
      } else {
        rows = await env.DB.prepare(
          `SELECT id, company_name, contact_person, email, phone, sector, outlay_amount, location, details, nodal_status, sponsor_status, nodal_notes, created_at, sponsor_user_id
           FROM proposals WHERE sponsor_user_id = ? OR lower(email) = ? ORDER BY created_at DESC`
        )
          .bind(user.id, user.email)
          .all();
      }
      return json({ data: rows.results || [] });
    }

    const proposalPatch = path.match(/^\/api\/proposals\/(\d+)$/);
    if (proposalPatch && method === "PATCH") {
      const user = await getUserFromRequest(request, env);
      if (!user || user.role !== "nodal") return error("Only nodal officers can update proposal stages.", 403);
      const body = await readJson(request);
      await env.DB.prepare(
        "UPDATE proposals SET nodal_status = ?, sponsor_status = ?, nodal_notes = ? WHERE id = ?"
      )
        .bind(String(body.nodal_status || "Submitted"), String(body.sponsor_status || "Viewed"), body.nodal_notes == null ? null : String(body.nodal_notes), Number(proposalPatch[1]))
        .run();
      return json({ ok: true });
    }

    if (path === "/api/sponsors" && method === "GET") {
      const user = await getUserFromRequest(request, env);
      if (!user) return error("Sign in required.", 401);
      let rows;
      if (isStaff(user)) {
        rows = await env.DB.prepare(
          "SELECT id, company, email, phone, sector, mandal, status, user_id, created_at FROM sponsors ORDER BY created_at DESC"
        ).all();
      } else {
        rows = await env.DB.prepare(
          "SELECT id, company, email, phone, sector, mandal, status, user_id, created_at FROM sponsors WHERE user_id = ? OR lower(email) = ?"
        )
          .bind(user.id, user.email)
          .all();
      }
      return json({ data: rows.results || [] });
    }

    if (path === "/api/sponsors" && method === "POST") {
      const user = await getUserFromRequest(request, env);
      if (!isStaff(user)) return error("Staff access required.", 403);
      const body = await readJson(request);
      const company = String(body.company || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const phone = String(body.phone || "").trim() || null;
      const sector = String(body.sector || "").trim() || null;
      const mandal = String(body.mandal || "").trim() || null;
      if (company.length < 2 || !EMAIL_RE.test(email)) return error("Company and a valid email are required.");
      let profile = await env.DB.prepare("SELECT id FROM profiles WHERE email = ?").bind(email).first();
      let temporary_password = null;
      if (!profile) {
        temporary_password = bytesToB64(crypto.getRandomValues(new Uint8Array(9))).replace(/[^a-zA-Z0-9]/g, "A").slice(0, 12) + "a1";
        const id = await createProfile(env, {
          role: "sponsor",
          display_name: company.slice(0, 120),
          company: company.slice(0, 200),
          email: email,
          phone: phone,
          mandal: mandal,
          password: temporary_password
        });
        profile = { id: id };
      }
      await env.DB.prepare(
        `INSERT INTO sponsors (user_id, company, email, phone, sector, mandal, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Active')
         ON CONFLICT(email) DO UPDATE SET
           user_id = COALESCE(sponsors.user_id, excluded.user_id),
           company = excluded.company,
           phone = excluded.phone,
           sector = excluded.sector,
           mandal = excluded.mandal,
           status = 'Active'`
      )
        .bind(profile.id, company.slice(0, 200), email, phone, sector, mandal)
        .run();
      const row = await env.DB.prepare("SELECT id FROM sponsors WHERE email = ?").bind(email).first();
      return json({ id: row && row.id, temporary_password: temporary_password });
    }

    if (path === "/api/projects" && method === "GET") {
      const rows = await env.DB.prepare(
        "SELECT id, title, mandal, sector, budget, sponsor, status, progress_pct, milestones FROM projects ORDER BY id ASC"
      ).all();
      return json({ data: rows.results || [] });
    }

    return error("Not found.", 404);
  } catch (err) {
    const message = err && err.message ? err.message : "Server error";
    if (message === "Payload too large") return error(message, 413);
    if (message === "Invalid JSON") return error("Invalid request body.", 400);
    console.log(JSON.stringify({ level: "error", msg: String(err && err.message), stack: String(err && err.stack || "") }));
    return error("Request failed.", 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: Object.assign(securityHeaders(), { Allow: "GET,POST,PATCH,OPTIONS" })
        });
      }
      return handleApi(request, env);
    }
    if (url.pathname === "/" || url.pathname === "") {
      const indexRes = await env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
      return applySecurity(indexRes);
    }
    return applySecurity(await env.ASSETS.fetch(request));
  }
};
