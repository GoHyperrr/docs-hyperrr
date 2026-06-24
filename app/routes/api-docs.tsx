import { useState } from "react";
import type { Route } from "./+types/api-docs";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hyperrr REST API Specifications" },
    { name: "description", content: "Interactive API specification for Hyperrr product catalogs, checkouts, and webhooks." },
  ];
}

// Reuse tokenize & syntax highlighting system
interface Token {
  type: string;
  value: string;
}

const tokenize = (line: string, lang: string): Token[] => {
  const regex = /(\/\/.*|#.*)|("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')|(\b\d+\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*\b)|(\S)/g;
  let match;
  const tokens: Token[] = [];
  let lastIndex = 0;
  const bashKeywords = ["curl", "-X", "-H"];

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: line.substring(lastIndex, match.index) });
    }
    const [_, comment, string, number, word, punct] = match;
    if (comment) tokens.push({ type: "comment", value: comment });
    else if (string) tokens.push({ type: "string", value: string });
    else if (number) tokens.push({ type: "number", value: number });
    else if (word) {
      if (bashKeywords.includes(word)) tokens.push({ type: "keyword", value: word });
      else tokens.push({ type: "identifier", value: word });
    } else if (punct) tokens.push({ type: "punctuation", value: punct });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < line.length) {
    tokens.push({ type: "text", value: line.substring(lastIndex) });
  }
  return tokens;
};

const highlightLine = (line: string, lang: string) => {
  if (lang === "json") {
    const match = line.match(/^(\s*)"([^"]+)":\s*(.*)$/);
    if (match) {
      const [_, indent, key, val] = match;
      let valSpan = <span className="text-zinc-300">{val}</span>;
      if (val.startsWith("\"")) valSpan = <span className="text-emerald-300">"{val.replace(/"/g, "")}"</span>;
      else if (val.includes("true") || val.includes("false")) valSpan = <span className="text-pink-400 font-bold">{val}</span>;
      else if (parseFloat(val) || parseInt(val)) valSpan = <span className="text-cyan-300 font-mono">{val}</span>;
      return (
        <>
          <span className="text-zinc-500">{indent}</span>
          <span className="text-indigo-300">"{key}"</span>
          <span className="text-zinc-500">: </span>
          {valSpan}
        </>
      );
    }
  }
  return tokenize(line, lang).map((token, j) => {
    let cls = "text-zinc-300";
    if (token.type === "comment") cls = "text-zinc-500 italic";
    else if (token.type === "string") cls = "text-emerald-300";
    else if (token.type === "number") cls = "text-cyan-300";
    else if (token.type === "keyword") cls = "text-[#d7ff00] font-bold";
    return <span key={j} className={cls}>{token.value}</span>;
  });
};

const CodeBlock = ({ code, lang }: { code: string; lang: string }) => {
  const lines = code.trim().split("\n");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1C1C1E] border border-black rounded-lg overflow-hidden flex flex-col font-mono text-[10px] sm:text-xs text-white my-3 relative shadow-[2px_2px_0px_#1C1C1E]">
      <div className="bg-[#111112] px-4 py-2 border-b border-white/5 flex justify-between items-center select-none">
        <span className="text-zinc-500 uppercase tracking-widest font-black text-[9px]">{lang} snippet</span>
        <button onClick={copy} className="text-zinc-400 hover:text-white text-[9px] font-bold cursor-pointer">
          {copied ? "Copied! ✓" : "Copy 📋"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto leading-relaxed select-text">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-8 shrink-0 text-zinc-600 select-none pr-3 text-right border-r border-white/5 mr-3">{i+1}</span>
            <span className="flex-grow">{line === "" ? " " : highlightLine(line, lang)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// CLEAN SLATE DATABASE STORE: Loaded REST API specifications array
const apis: any[] = [
  {
    name: "Get Store Settings",
    method: "GET",
    path: "/api/store",
    description: "Retrieves the single-instance global store settings including name, tagline, currencies, locale, weight/dimension units, feature flags, and metadata. Requires settings.read permission.",
    headers: [
      { key: "Authorization", val: "Bearer <token>", desc: "JWT token for merchant admin authentication." },
      { key: "Accept", val: "application/json", desc: "Response payload format." }
    ],
    curl: `curl -X GET http://localhost:8080/api/store \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Accept: application/json"`,
    response: `{
  "success": true,
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Acme Superstore",
    "slug": "acme-superstore",
    "tagline": "Everything you need",
    "description": "High performance ecommerce setup",
    "email": "contact@acme.com",
    "phone": "+919876543210",
    "support_email": "support@acme.com",
    "logo_url": "https://cdn.acme.com/logo.png",
    "favicon_url": "https://cdn.acme.com/favicon.ico",
    "cover_image_url": "https://cdn.acme.com/cover.jpg",
    "default_currency": "INR",
    "timezone": "Asia/Kolkata",
    "default_locale": "en-IN",
    "weight_unit": "kg",
    "dimension_unit": "cm",
    "socials": {
      "twitter": "https://twitter.com/acme",
      "instagram": "https://instagram.com/acme"
    },
    "multi_currency_enabled": true,
    "status": "active",
    "metadata": {},
    "created_at": "2026-06-24T14:53:30Z",
    "updated_at": "2026-06-24T14:53:30Z"
  }
}`
  },
  {
    name: "Store Onboarding / First-Run",
    method: "POST",
    path: "/api/store",
    description: "Runs first-time onboarding. Requires an authenticated user with settings.write permissions. If the store is already initialized, returns a 409 Conflict error. On success, sets up the store, creates a default 'online-store' sales channel, and fires onboarding verification background jobs.",
    headers: [
      { key: "Authorization", val: "Bearer <token>", desc: "JWT token for auth (requires settings.write permission)." },
      { key: "Content-Type", val: "application/json", desc: "Request payload format." }
    ],
    requestBody: `{
  "name": "Acme Superstore",
  "slug": "acme-superstore",
  "email": "contact@acme.com",
  "currency": "INR",
  "timezone": "Asia/Kolkata"
}`,
    curl: `curl -X POST http://localhost:8080/api/store \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Acme Superstore",
    "slug": "acme-superstore",
    "email": "contact@acme.com",
    "currency": "INR",
    "timezone": "Asia/Kolkata"
  }'`,
    response: `{
  "success": true,
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Acme Superstore",
    "slug": "acme-superstore",
    "tagline": null,
    "description": null,
    "email": "contact@acme.com",
    "phone": null,
    "support_email": null,
    "logo_url": null,
    "favicon_url": null,
    "cover_image_url": null,
    "default_currency": "INR",
    "timezone": "Asia/Kolkata",
    "default_locale": "en",
    "weight_unit": "kg",
    "dimension_unit": "cm",
    "socials": null,
    "multi_currency_enabled": false,
    "status": "active",
    "metadata": {},
    "created_at": "2026-06-24T14:53:30Z",
    "updated_at": "2026-06-24T14:53:30Z"
  }
}`
  },
  {
    name: "Update Store Settings",
    method: "PUT",
    path: "/api/store",
    description: "Updates existing store configurations. All parameters are optional. Enforces validation rules on default_currency (exactly 3 chars) and support emails. Requires settings.write permission.",
    headers: [
      { key: "Authorization", val: "Bearer <token>", desc: "JWT token for auth (requires settings.write permission)." },
      { key: "Content-Type", val: "application/json", desc: "Request payload format." }
    ],
    requestBody: `{
  "tagline": "The Ultimate Shop",
  "description": "Premium storefront custom layout",
  "phone": "+919876543210",
  "support_email": "support@acme.com",
  "logo_url": "https://cdn.acme.com/logo.png",
  "multi_currency_enabled": true
}`,
    curl: `curl -X PUT http://localhost:8080/api/store \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "tagline": "The Ultimate Shop",
    "description": "Premium storefront custom layout",
    "phone": "+919876543210",
    "support_email": "support@acme.com",
    "logo_url": "https://cdn.acme.com/logo.png",
    "multi_currency_enabled": true
  }'`,
    response: `{
  "success": true,
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Acme Superstore",
    "slug": "acme-superstore",
    "tagline": "The Ultimate Shop",
    "description": "Premium storefront custom layout",
    "email": "contact@acme.com",
    "phone": "+919876543210",
    "support_email": "support@acme.com",
    "logo_url": "https://cdn.acme.com/logo.png",
    "favicon_url": null,
    "cover_image_url": null,
    "default_currency": "INR",
    "timezone": "Asia/Kolkata",
    "default_locale": "en",
    "weight_unit": "kg",
    "dimension_unit": "cm",
    "socials": null,
    "multi_currency_enabled": true,
    "status": "active",
    "metadata": {},
    "created_at": "2026-06-24T14:53:30Z",
    "updated_at": "2026-06-24T14:53:31Z"
  }
}`
  },
  {
    name: "Update Store Status",
    method: "PUT",
    path: "/api/store/status",
    description: "Updates the operational status of the store. Valid options are: 'setup_pending', 'active', 'paused', or 'suspended'. Status transitions update route gating middleware instantly. Requires settings.write permission.",
    headers: [
      { key: "Authorization", val: "Bearer <token>", desc: "JWT token for auth (requires settings.write permission)." },
      { key: "Content-Type", val: "application/json", desc: "Request payload format." }
    ],
    requestBody: `{
  "status": "paused"
}`,
    curl: `curl -X PUT http://localhost:8080/api/store/status \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"status": "paused"}'`,
    response: `{
  "success": true,
  "data": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Acme Superstore",
    "slug": "acme-superstore",
    "status": "paused",
    "created_at": "2026-06-24T14:53:30Z",
    "updated_at": "2026-06-24T14:53:35Z"
  }
}`
  },
  {
    name: "Upsert Store Address",
    method: "PUT",
    path: "/api/store/addresses/:type",
    description: "Upserts shipping origin or corporate billing addresses. The ':type' parameter represents the address role (e.g. 'legal' or 'shipping_origin'). For Indian legal entities, the optional 'gstin' field records the Goods and Services Tax Identification Number. Requires settings.write permission.",
    headers: [
      { key: "Authorization", val: "Bearer <token>", desc: "JWT token for auth (requires settings.write permission)." },
      { key: "Content-Type", val: "application/json", desc: "Request payload format." }
    ],
    requestBody: `{
  "company": "Acme Corp Ltd",
  "address_line1": "456 Volt Tower",
  "address_line2": "Sector 5",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postal_code": "400001",
  "country_code": "IN",
  "phone": "+919876543210",
  "gstin": "27AAAAA1111A1Z1"
}`,
    curl: `curl -X PUT http://localhost:8080/api/store/addresses/legal \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "company": "Acme Corp Ltd",
    "address_line1": "456 Volt Tower",
    "address_line2": "Sector 5",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country_code": "IN",
    "phone": "+919876543210",
    "gstin": "27AAAAA1111A1Z1"
  }'`,
    response: `{
  "success": true,
  "data": {
    "id": "e305f699-234b-4c55-ba83-5ab7ef701ef5",
    "address_type": "legal",
    "company": "Acme Corp Ltd",
    "address_line1": "456 Volt Tower",
    "address_line2": "Sector 5",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country_code": "IN",
    "phone": "+919876543210",
    "gstin": "27AAAAA1111A1Z1",
    "created_at": "2026-06-24T14:53:30Z",
    "updated_at": "2026-06-24T14:53:35Z"
  }
}`
  },
  {
    name: "Upsert Legal Policy",
    method: "PUT",
    path: "/api/store/policies/:type",
    description: "Configures store policies by type. The path parameter ':type' represents policies like 'refund', 'privacy', 'terms', or 'shipping'. Requires settings.write permission.",
    headers: [
      { key: "Authorization", val: "Bearer <token>", desc: "JWT token for auth (requires settings.write permission)." },
      { key: "Content-Type", val: "application/json", desc: "Request payload format." }
    ],
    requestBody: `{
  "title": "Refund Policy",
  "body": "<h1>Refund Policy</h1><p>We offer a 30-day return policy on all unworn items.</p>"
}`,
    curl: `curl -X PUT http://localhost:8080/api/store/policies/refund \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Refund Policy",
    "body": "<h1>Refund Policy</h1><p>We offer a 30-day return policy on all unworn items.</p>"
  }'`,
    response: `{
  "success": true,
  "data": {
    "id": "b328a1c9-556b-4e12-bda2-ef8902cd41a1",
    "policy_type": "refund",
    "title": "Refund Policy",
    "body": "<h1>Refund Policy</h1><p>We offer a 30-day return policy on all unworn items.</p>",
    "created_at": "2026-06-24T14:53:30Z",
    "updated_at": "2026-06-24T14:53:35Z"
  }
}`
  },
  {
    name: "Register Custom Domain",
    method: "POST",
    path: "/api/store/domains",
    description: "Registers a custom storefront domain and allocates a unique verification challenge TXT token. The domain stays inactive until verified. Requires settings.write permission.",
    headers: [
      { key: "Authorization", val: "Bearer <token>", desc: "JWT token for auth (requires settings.write permission)." },
      { key: "Content-Type", val: "application/json", desc: "Request payload format." }
    ],
    requestBody: `{
  "domain": "shop.mybrand.com",
  "is_primary": false
}`,
    curl: `curl -X POST http://localhost:8080/api/store/domains \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "domain": "shop.mybrand.com",
    "is_primary": false
  }'`,
    response: `{
  "success": true,
  "data": {
    "id": "d1c08f99-445b-4322-ba33-df5e9aa82a20",
    "domain": "shop.mybrand.com",
    "is_verified": false,
    "is_primary": false,
    "verification_token": "hyperrr-verification-token=abc123xyz456",
    "ssl_status": "pending",
    "created_at": "2026-06-24T14:53:30Z",
    "updated_at": "2026-06-24T14:53:30Z"
  }
}`
  },
  {
    name: "Trigger Domain Verification",
    method: "POST",
    path: "/api/store/domains/:id/verify",
    description: "Triggers an asynchronous verification job for the custom domain ID. The core engine schedules a background task which queries external DNS TXT records using trust-dns-resolver to find the correct verification token. Requires settings.write permission.",
    headers: [
      { key: "Authorization", val: "Bearer <token>", desc: "JWT token for auth (requires settings.write permission)." }
    ],
    curl: `curl -X POST http://localhost:8080/api/store/domains/d1c08f99-445b-4322-ba33-df5e9aa82a20/verify \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"`,
    response: `{
  "success": true,
  "message": "Domain verification queued successfully"
}`
  },
  {
    name: "Set Primary Domain",
    method: "PUT",
    path: "/api/store/domains/:id/primary",
    description: "Sets the target verified domain as the primary domain of the storefront. This action executes within a database transaction, atomically clearing is_primary on other domains and activating it on the target domain. Requires settings.write permission.",
    headers: [
      { key: "Authorization", val: "Bearer <token>", desc: "JWT token for auth (requires settings.write permission)." }
    ],
    curl: `curl -X PUT http://localhost:8080/api/store/domains/d1c08f99-445b-4322-ba33-df5e9aa82a20/primary \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"`,
    response: `{
  "success": true,
  "data": {
    "id": "d1c08f99-445b-4322-ba33-df5e9aa82a20",
    "domain": "shop.mybrand.com",
    "is_verified": true,
    "is_primary": true,
    "ssl_status": "active",
    "created_at": "2026-06-24T14:53:30Z",
    "updated_at": "2026-06-24T14:53:50Z"
  }
}`
  },
  {
    name: "Create Sales Channel",
    method: "POST",
    path: "/api/channels",
    description: "Registers a new merchant sales channel (e.g. online-store, mobile-app, POS) for custom inventory isolation and order routing. Requires settings.write permission.",
    headers: [
      { key: "Authorization", val: "Bearer <token>", desc: "JWT token for auth (requires settings.write permission)." },
      { key: "Content-Type", val: "application/json", desc: "Request payload format." }
    ],
    requestBody: `{
  "name": "Mobile Application",
  "slug": "mobile-app",
  "description": "Hyperrr Headless iOS & Android app sales flow",
  "channel_type": "mobile_app",
  "is_active": true
}`,
    curl: `curl -X POST http://localhost:8080/api/channels \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Mobile Application",
    "slug": "mobile-app",
    "description": "Hyperrr Headless iOS & Android app sales flow",
    "channel_type": "mobile_app",
    "is_active": true
  }'`,
    response: `{
  "success": true,
  "data": {
    "id": "f5b2c7aa-bb33-4f99-a832-75d3ea2d46b0",
    "name": "Mobile Application",
    "slug": "mobile-app",
    "description": "Hyperrr Headless iOS & Android app sales flow",
    "channel_type": "mobile_app",
    "is_active": true,
    "created_at": "2026-06-24T14:53:30Z",
    "updated_at": "2026-06-24T14:53:30Z"
  }
}`
  },
  {
    name: "Get Public Storefront Info",
    method: "GET",
    path: "/api/storefront/info",
    description: "Returns sanitized public brand details. Unlike /api/store, this endpoint requires zero authentication, excludes private metadata, and returns standard HTTP Cache-Control headers set to max-age=600 (10 minutes) for CDN caching.",
    headers: [
      { key: "Accept", val: "application/json", desc: "Response payload format." }
    ],
    curl: `curl -X GET http://localhost:8080/api/storefront/info \\
  -H "Accept: application/json"`,
    response: `{
  "success": true,
  "data": {
    "name": "Acme Superstore",
    "tagline": "The Ultimate Shop",
    "description": "Premium storefront custom layout",
    "logo_url": "https://cdn.acme.com/logo.png",
    "favicon_url": "https://cdn.acme.com/favicon.ico",
    "cover_image_url": "https://cdn.acme.com/cover.jpg",
    "default_currency": "INR",
    "timezone": "Asia/Kolkata",
    "default_locale": "en",
    "socials": {
      "twitter": "https://twitter.com/acme",
      "instagram": "https://instagram.com/acme"
    }
  }
}`
  }
];

export default function ApiDocs() {
  const [activeTab, setActiveTab] = useState(0);

  // If there are no APIs configured, render a clean neobrutalist empty state
  if (apis.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-2xl mx-auto shadow-sm">
          ⚡
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black font-serif-header text-[#1C1C1E]">No API reference loaded</h2>
          <p className="text-xs sm:text-sm text-[#57575A] font-serif font-medium max-w-sm mx-auto leading-relaxed">
            "REST endpoint documents will automatically build here from the system openapi.yaml specs upon core server compilation."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow flex flex-col">
      <div className="flex flex-col lg:flex-row gap-8 items-start flex-grow">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 shrink-0 paper-card p-4 rounded-xl space-y-4">
          <div className="px-2">
            <span className="text-[9px] font-mono font-black text-zinc-400 tracking-widest uppercase block">API endpoints</span>
          </div>
          <div className="space-y-1">
            {apis.map((api, idx) => {
              const isActive = activeTab === idx;
              const methodColor = api.method === "GET" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800";
              return (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded font-mono text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                    isActive 
                      ? "bg-[#FAF8F5] border-[#1C1C1E]/30 text-[#1C1C1E] shadow-[1px_1px_0px_#1C1C1E]"
                      : "bg-transparent border-transparent text-[#1C1C1E]/75 hover:bg-[#F4F1EA]"
                  }`}
                >
                  <span>{api.name}</span>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${methodColor}`}>{api.method}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Console Details Panel */}
        <div className="flex-grow paper-card p-6 sm:p-10 rounded-xl w-full min-h-[500px] text-left space-y-6">
          <div className="border-b border-[#1C1C1E]/10 pb-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className={`font-mono text-xs font-black px-2 py-0.5 rounded border border-[#1C1C1E]/15 ${
                apis[activeTab].method === "GET" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
              }`}>
                {apis[activeTab].method}
              </span>
              <span className="font-mono text-sm font-bold text-[#1C1C1E]">
                {apis[activeTab].path}
              </span>
            </div>
            <h2 className="text-2xl font-black font-serif-header text-[#1C1C1E]">
              {apis[activeTab].name}
            </h2>
            <p className="text-xs sm:text-sm text-[#57575A] font-serif leading-relaxed mt-2">
              {apis[activeTab].description}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-black text-[#1C1C1E] uppercase tracking-wider">Request Headers</h3>
            <div className="border border-[#1C1C1E]/10 rounded-md overflow-hidden bg-[#FAF8F5]">
              {apis[activeTab].headers.map((h: any, i: number) => (
                <div key={i} className="flex justify-between items-center px-4 py-2 text-[10px] font-mono border-b border-[#1C1C1E]/5 last:border-0">
                  <span className="text-indigo-600 font-bold">{h.key}: <span className="text-zinc-600">{h.val}</span></span>
                  <span className="text-[#57575A]">{h.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {apis[activeTab].requestBody && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-black text-[#1C1C1E] uppercase tracking-wider">Request Payload (JSON)</h3>
              <CodeBlock code={apis[activeTab].requestBody || ""} lang="json" />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-black text-[#1C1C1E] uppercase tracking-wider">Example Request</h3>
            <CodeBlock code={apis[activeTab].curl} lang="bash" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-black text-[#1C1C1E] uppercase tracking-wider">Response Payload (JSON)</h3>
            <CodeBlock code={apis[activeTab].response} lang="json" />
          </div>

        </div>

      </div>
    </div>
  );
}
