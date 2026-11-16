const API_VERSION = "1.1.0";
const MAX_BODY_BYTES = 12_000;
const DEFAULT_NOTIFY_TO = "melsearles99@gmail.com";
const DEFAULT_NOTIFY_FROM = "Mel Searles Portfolio <onboarding@resend.dev>";
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
      core_tests: 54,
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
      execution_tests: "execution, reconciliation, calendar",
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

const ADMIN_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Portfolio inbox — Private</title>
  <style>
    :root { color-scheme: dark; --bg:#080b12; --panel:#111722; --line:rgba(255,255,255,.13); --ink:#f4f7fb; --muted:#9aa8b8; --cyan:#7de3f2; --pink:#ffc9ed; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; background:radial-gradient(circle at 12% 0%,#17273a,transparent 38%),radial-gradient(circle at 90% 8%,#2b1830,transparent 32%),var(--bg); color:var(--ink); font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif; }
    main { width:min(900px,calc(100% - 32px)); margin:0 auto; padding:56px 0 72px; }
    .eyebrow { color:var(--cyan); font:10px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace; letter-spacing:.14em; text-transform:uppercase; }
    h1 { margin:10px 0 8px; font:400 clamp(34px,7vw,56px)/.98 Georgia,serif; letter-spacing:-.04em; }
    .lede { max-width:60ch; margin:0 0 28px; color:var(--muted); }
    .panel { border:1px solid var(--line); border-radius:18px; background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.02)); box-shadow:0 24px 70px rgba(0,0,0,.3); padding:20px; }
    .token-row { display:flex; flex-wrap:wrap; align-items:end; gap:10px; }
    label { display:grid; flex:1 1 260px; gap:7px; color:var(--muted); font:10px/1.4 ui-monospace,SFMono-Regular,Consolas,monospace; letter-spacing:.1em; text-transform:uppercase; }
    input { width:100%; border:1px solid var(--line); border-radius:10px; background:rgba(0,0,0,.35); color:var(--ink); font:14px/1.4 inherit; padding:10px 12px; outline:none; }
    input:focus { border-color:var(--cyan); }
    button { border:1px solid rgba(255,255,255,.18); border-radius:999px; padding:9px 15px; background:rgba(255,255,255,.08); color:var(--ink); font:11px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace; letter-spacing:.04em; cursor:pointer; }
    button:hover { background:rgba(255,255,255,.14); }
    button.primary { border-color:transparent; background:linear-gradient(100deg,#b8f4ff,#ffd7f3); color:#10141c; font-weight:700; }
    button.danger { border-color:rgba(255,150,170,.35); color:#ffc2ce; }
    #status { min-height:22px; margin:16px 0 0; color:var(--muted); font:11px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace; }
    #messages { display:grid; gap:12px; margin-top:16px; }
    article { border:1px solid var(--line); border-radius:14px; padding:16px; background:rgba(0,0,0,.18); }
    .message-head { display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:8px; }
    h2 { margin:0; font:400 20px/1.2 Georgia,serif; }
    time, .meta { color:var(--muted); font:10px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace; }
    .meta { display:flex; flex-wrap:wrap; gap:12px; margin-top:6px; }
    .meta a { color:var(--cyan); }
    .message-body { margin:14px 0 0; white-space:pre-wrap; color:#dbe4ee; }
    .empty { padding:34px 10px; color:var(--muted); text-align:center; }
    .actions { display:flex; justify-content:flex-end; margin-top:14px; }
    footer { margin-top:26px; color:var(--muted); font:10px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace; }
    @media (max-width:560px) { main { padding-top:34px; } .panel { padding:15px; } }
  </style>
</head>
<body>
  <main>
    <div class="eyebrow">Private portfolio utility</div>
    <h1>Message inbox</h1>
    <p class="lede">Read and remove contact-form messages. The token is kept in this tab's session storage and is never added to the page URL.</p>
    <section class="panel" aria-label="Inbox controls">
      <div class="token-row">
        <label>Admin token<input id="token" type="password" autocomplete="off" spellcheck="false"></label>
        <button id="load" class="primary" type="button">Load messages</button>
        <button id="clear" type="button">Clear token</button>
      </div>
      <p id="status" role="status" aria-live="polite"></p>
      <section id="messages" aria-label="Contact messages"></section>
    </section>
    <footer>Messages are stored in D1. Delete removes the row permanently.</footer>
  </main>
  <script>
    (function () {
      "use strict";
      var tokenInput = document.getElementById("token");
      var status = document.getElementById("status");
      var messages = document.getElementById("messages");
      var storageKey = "portfolio-admin-token";
      var stored = sessionStorage.getItem(storageKey) || "";
      tokenInput.value = stored;

      function setStatus(text, error) {
        status.textContent = text;
        status.style.color = error ? "#ffc2ce" : "";
      }

      function endpoint(extra) {
        return "/api/messages?token=" + encodeURIComponent(tokenInput.value.trim()) + (extra || "");
      }

      function make(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
      }

      function render(items) {
        messages.replaceChildren();
        if (!items.length) {
          messages.appendChild(make("p", "empty", "No messages yet."));
          return;
        }
        items.forEach(function (message) {
          var article = make("article");
          var head = make("div", "message-head");
          head.appendChild(make("h2", "", message.name));
          var when = new Date(message.created_at);
          head.appendChild(make("time", "", isNaN(when.getTime()) ? message.created_at : when.toLocaleString()));
          article.appendChild(head);

          var meta = make("div", "meta");
          var email = make("a", "", message.email);
          email.href = "mailto:" + message.email;
          meta.appendChild(email);
          if (message.source) meta.appendChild(make("span", "", message.source));
          article.appendChild(meta);
          article.appendChild(make("p", "message-body", message.message));

          var actions = make("div", "actions");
          var remove = make("button", "danger", "Delete");
          remove.type = "button";
          remove.addEventListener("click", function () {
            if (!window.confirm("Delete this message permanently?")) return;
            remove.disabled = true;
            fetch(endpoint("&id=" + encodeURIComponent(message.id)), { method: "DELETE" })
              .then(function (response) { return response.json().then(function (body) { if (!response.ok) throw new Error(body.error || "Delete failed"); return body; }); })
              .then(function () { return load(); })
              .catch(function (error) { setStatus(error.message, true); remove.disabled = false; });
          });
          actions.appendChild(remove);
          article.appendChild(actions);
          messages.appendChild(article);
        });
      }

      function load() {
        var token = tokenInput.value.trim();
        if (!token) {
          setStatus("Enter the admin token to load messages.", true);
          return;
        }
        setStatus("Loading…");
        fetch(endpoint(), { cache: "no-store" })
          .then(function (response) { return response.json().then(function (body) { if (!response.ok) throw new Error(body.error || "Could not load messages"); return body; }); })
          .then(function (body) {
            sessionStorage.setItem(storageKey, token);
            var items = body.messages || [];
            render(items);
            setStatus(items.length + (items.length === 1 ? " message" : " messages"));
          })
          .catch(function (error) { setStatus(error.message, true); });
      }

      document.getElementById("load").addEventListener("click", load);
      document.getElementById("clear").addEventListener("click", function () {
        sessionStorage.removeItem(storageKey);
        tokenInput.value = "";
        messages.replaceChildren();
        setStatus("Token cleared.");
      });
      tokenInput.addEventListener("keydown", function (event) { if (event.key === "Enter") load(); });
      if (stored) load();
    })();
  </script>
</body>
</html>`;

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

function splitRecipients(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => validEmail(item))
    .slice(0, 5);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return entities[character];
  });
}

async function sendContactNotification(env, payload) {
  if (!env.RESEND_API_KEY) {
    return { sent: false, reason: "email-not-configured" };
  }

  const recipients = splitRecipients(env.CONTACT_NOTIFY_TO || DEFAULT_NOTIFY_TO);
  if (!recipients.length) {
    return { sent: false, reason: "no-recipient" };
  }

  const from = clean(env.CONTACT_FROM, 320) || DEFAULT_NOTIFY_FROM;
  const text = [
    "New portfolio contact message",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Source: ${payload.source || "portfolio"}`,
    "",
    payload.message,
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17202a;max-width:640px">
      <h1 style="font-size:22px;margin:0 0 16px">New portfolio message</h1>
      <p style="margin:0 0 8px"><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
      <p style="margin:0 0 8px"><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p style="margin:0 0 16px"><strong>Source:</strong> ${escapeHtml(payload.source || "portfolio")}</p>
      <div style="white-space:pre-wrap;border-left:3px solid #72d8ea;padding:12px 16px;background:#f5f8fa">${escapeHtml(payload.message)}</div>
    </div>
  `;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        reply_to: payload.email,
        subject: `Portfolio contact: ${payload.name.slice(0, 80)}`,
        text,
        html,
      }),
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      console.error("resend notification failed", response.status, detail);
      return { sent: false, reason: "provider-error" };
    }
    return { sent: true };
  } catch (error) {
    console.error("resend notification request failed", error);
    return { sent: false, reason: "request-failed" };
  } finally {
    clearTimeout(timeout);
  }
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
    const notification = await sendContactNotification(env, { name, email, message, source });
    return json({ ok: true, id, notified: notification.sent }, 201, {
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

    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      return new Response(ADMIN_HTML, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "no-referrer",
          "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'self'",
        },
      });
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
