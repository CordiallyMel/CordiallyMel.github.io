const API_VERSION = "1.0.0";
const MAX_BODY_BYTES = 12_000;
const ALLOWED_ORIGINS = new Set([
  "https://cordiallymel.github.io",
  "https://www.cordiallymel.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

const PROJECTS = [
  {
    slug: "skyq-range",
    name: "SkyQ RANGE",
    kind: "research-engine",
    status: "public",
    summary:
      "A causal one-minute ETF research engine in Python and PostgreSQL with a TypeScript control center.",
    evidence: {
      spy_trades: 67271,
      qqq_trades: 32356,
      positive_spy_years: "16/24",
      futures_rejected: 10,
      data_window: "2003-2026",
    },
    links: {
      repository: "https://github.com/CordiallyMel/SkyQ_RANGE",
      case_study: "https://cordiallymel.github.io/#work",
    },
  },
  {
    slug: "skyq-sigma-s",
    name: "SkyQ Sigma S",
    kind: "execution-platform",
    status: "private-strategy",
    summary:
      "An execution-aware backtest and paper-trading system built across five broker and market-data APIs.",
    evidence: {
      replay_trades: 43249,
      automated_tests: 160,
      integrations: 5,
      rule_set: "private",
    },
    links: {
      walkthrough: "mailto:MelSearles99@gmail.com?subject=SkyQ%20Sigma%20S%20walkthrough",
    },
  },
  {
    slug: "skyquant-capital",
    name: "SkyQuant Capital",
    kind: "venture",
    status: "pre-fund-pilot",
    summary:
      "A research desk built in the right order: company-funded pilot, public record, then an anchor-led fund.",
    stage: {
      pilot_capital: "$2k-$5k",
      public_record_target_months: 12,
      proposed_fund: "$25M-$50M",
      fund_exists_today: false,
    },
    links: {
      website: "https://skyquantcapital.com/",
      investor_page: "https://skyquantcapital.com/invest.html",
    },
  },
];

let schemaReady = false;

function corsHeaders(origin) {
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      ...headers,
    },
  });
}

function clean(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, maxLength);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function ensureSchema(env) {
  if (schemaReady) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      source TEXT,
      user_agent TEXT
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_contact_messages_created
      ON contact_messages(created_at)`,
  ).run();
  schemaReady = true;
}

async function handleContact(request, env, origin) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405, corsHeaders(origin));
  }
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return json({ ok: false, error: "Origin not allowed" }, 403, corsHeaders(origin));
  }
  if (!env.DB) {
    return json({ ok: false, error: "Contact storage is not configured" }, 503, corsHeaders(origin));
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ ok: false, error: "Message is too large" }, 413, corsHeaders(origin));
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400, corsHeaders(origin));
  }

  // Quietly accept obvious bots without storing their payload.
  if (clean(body.website, 200)) {
    return json({ ok: true, id: null }, 201, corsHeaders(origin));
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 254).toLowerCase();
  const message = clean(body.message, 5000);
  const source = clean(body.source, 500);
  const userAgent = clean(request.headers.get("user-agent") || "", 300);

  if (name.length < 2) {
    return json({ ok: false, error: "Please include your name." }, 422, corsHeaders(origin));
  }
  if (!validEmail(email)) {
    return json({ ok: false, error: "Please include a valid email address." }, 422, corsHeaders(origin));
  }
  if (message.length < 20) {
    return json({ ok: false, error: "Please write at least 20 characters." }, 422, corsHeaders(origin));
  }

  try {
    await ensureSchema(env);
    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO contact_messages
        (id, created_at, name, email, message, source, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(id, new Date().toISOString(), name, email, message, source, userAgent)
      .run();
    return json({ ok: true, id }, 201, {
      ...corsHeaders(origin),
      "Cache-Control": "no-store",
    });
  } catch (error) {
    console.error("contact insert failed", error);
    return json({ ok: false, error: "Could not save the message. Please email directly." }, 500, corsHeaders(origin));
  }
}

async function handleMessages(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (!env.CONTACT_ADMIN_TOKEN || token !== env.CONTACT_ADMIN_TOKEN) {
    return json({ ok: false, error: "Not found" }, 404);
  }
  if (!env.DB) {
    return json({ ok: false, error: "Contact storage is not configured" }, 503);
  }
  if (request.method === "DELETE") {
    const id = clean(url.searchParams.get("id"), 80);
    if (!id) {
      return json({ ok: false, error: "Message id is required" }, 400, { "Cache-Control": "no-store" });
    }
    try {
      await ensureSchema(env);
      await env.DB.prepare("DELETE FROM contact_messages WHERE id = ?").bind(id).run();
      return json({ ok: true, id }, 200, { "Cache-Control": "no-store" });
    } catch (error) {
      console.error("message delete failed", error);
      return json({ ok: false, error: "Could not delete the message" }, 500, { "Cache-Control": "no-store" });
    }
  }
  if (request.method !== "GET") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }
  try {
    await ensureSchema(env);
    const result = await env.DB.prepare(
      `SELECT id, created_at, name, email, message, source
       FROM contact_messages
       ORDER BY created_at DESC
       LIMIT 100`,
    ).all();
    return json({ ok: true, messages: result.results || [] }, 200, { "Cache-Control": "no-store" });
  } catch (error) {
    console.error("message read failed", error);
    return json({ ok: false, error: "Could not read messages" }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === "/health" || url.pathname === "/api/health") {
      return json({ ok: true, service: "mel-portfolio-api", version: API_VERSION });
    }

    if (url.pathname === "/api/projects" || url.pathname === "/api/projects/") {
      return json(
        {
          ok: true,
          version: API_VERSION,
          generated_at: "2026-11-15",
          disclaimer: "Research and pilot information only. Nothing here is an offer to sell a security.",
          projects: PROJECTS,
        },
        200,
        {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=300",
        },
      );
    }

    if (url.pathname === "/api/contact" || url.pathname === "/api/contact/") {
      return handleContact(request, env, origin);
    }

    if (url.pathname === "/api/messages" || url.pathname === "/api/messages/") {
      return handleMessages(request, env);
    }

    return json({ ok: false, error: "Not found" }, 404, corsHeaders(origin));
  },
};
