import { useState } from "react";
import type { Route } from "./+types/api-docs";
import openapi from "../openapi.json";

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

interface Header {
  key: string;
  val: string;
  desc: string;
}

interface ApiEndpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  headers: Header[];
  requestBody?: string;
  curl: string;
  response: string;
}

const resolveRef = (ref: string, spec: any): any => {
  const parts = ref.replace("#/", "").split("/");
  let current = spec;
  for (const part of parts) {
    current = current[part];
    if (!current) return null;
  }
  return current;
};

const getSampleValue = (propName: string, prop: any, spec: any, depth = 0): any => {
  if (depth > 3) return {};
  if (prop.$ref) {
    const resolved = resolveRef(prop.$ref, spec);
    if (!resolved) return null;
    return generateSampleObject(resolved, spec, depth + 1);
  }
  if (prop.allOf && prop.allOf[0] && prop.allOf[0].$ref) {
    const resolved = resolveRef(prop.allOf[0].$ref, spec);
    if (!resolved) return null;
    return generateSampleObject(resolved, spec, depth + 1);
  }

  const lowerName = propName.toLowerCase();
  if (lowerName === "name") return "Acme Superstore";
  if (lowerName === "slug") return "acme-superstore";
  if (lowerName === "email" || lowerName === "support_email") return "support@acme.com";
  if (lowerName === "currency" || lowerName === "default_currency") return "INR";
  if (lowerName === "timezone") return "Asia/Kolkata";
  if (lowerName === "company") return "Acme Corp Ltd";
  if (lowerName === "address_line1") return "456 Volt Tower";
  if (lowerName === "address_line2") return "Sector 5";
  if (lowerName === "city") return "Mumbai";
  if (lowerName === "state") return "Maharashtra";
  if (lowerName === "postal_code") return "400001";
  if (lowerName === "country_code") return "IN";
  if (lowerName === "phone") return "+919876543210";
  if (lowerName === "gstin") return "27AAAAA1111A1Z1";
  if (lowerName === "status") return "active";
  if (lowerName === "title") return "Refund Policy";
  if (lowerName === "body") return "<h1>Refund Policy</h1><p>We offer a 30-day return policy on all unworn items.</p>";
  if (lowerName === "domain") return "shop.mybrand.com";
  if (lowerName === "channel_type") return "mobile_app";
  if (lowerName === "is_active" || lowerName === "is_primary") return true;

  if (prop.type === "string") {
    if (prop.format === "uuid") return "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    if (prop.format === "date-time") return new Date().toISOString();
    return "string";
  }
  if (prop.type === "boolean") return true;
  if (prop.type === "integer" || prop.type === "number") return 123;
  if (prop.type === "array") {
    if (prop.items) {
      return [getSampleValue(propName, prop.items, spec, depth + 1)];
    }
    return [];
  }
  if (prop.type === "object") return {};
  return null;
};

const generateSampleObject = (schema: any, spec: any, depth = 0): any => {
  if (!schema.properties) return {};
  const obj: any = {};
  for (const [key, prop] of Object.entries<any>(schema.properties)) {
    obj[key] = getSampleValue(key, prop, spec, depth);
  }
  return obj;
};

const getRequestJson = (requestBody: any, spec: any): string | undefined => {
  if (requestBody && requestBody.content && requestBody.content["application/json"]) {
    const schema = requestBody.content["application/json"].schema;
    if (schema) {
      let resolvedObj: any = null;
      if (schema.$ref) {
        const resolved = resolveRef(schema.$ref, spec);
        if (resolved) resolvedObj = generateSampleObject(resolved, spec);
      }
      if (resolvedObj) {
        return JSON.stringify(resolvedObj, null, 2);
      }
    }
  }
  return undefined;
};

const getResponseJson = (responses: any, spec: any): string => {
  const okResponse = responses["200"] || responses["201"];
  if (okResponse && okResponse.content && okResponse.content["application/json"]) {
    const schema = okResponse.content["application/json"].schema;
    if (schema) {
      let resolvedObj: any = null;
      if (schema.$ref) {
        const resolved = resolveRef(schema.$ref, spec);
        if (resolved) resolvedObj = generateSampleObject(resolved, spec);
      }
      if (resolvedObj) {
        return JSON.stringify({ success: true, data: resolvedObj }, null, 2);
      }
    }
  }
  return JSON.stringify({ success: true, message: okResponse?.description || "Success" }, null, 2);
};

const generateCurl = (method: string, path: string, headers: Header[], requestBodyStr?: string): string => {
  const formattedHeaders = headers.map(h => `-H "${h.key}: ${h.key === 'Authorization' ? 'YOUR_ADMIN_TOKEN' : h.val}"`).join(" \\\n  ");
  const readablePath = path.replace(/\{([^}]+)\}/g, ":$1");
  if (requestBodyStr) {
    const singleLineBody = JSON.stringify(JSON.parse(requestBodyStr));
    return `curl -X ${method} http://localhost:8080${readablePath} \\\n  ${formattedHeaders} \\\n  -d '${singleLineBody}'`;
  }
  return `curl -X ${method} http://localhost:8080${readablePath} \\\n  ${formattedHeaders}`;
};

const getHumanName = (operationId: string | undefined, method: string, path: string): string => {
  switch (operationId) {
    case "get_store": return "Get Store Settings";
    case "create_store": return "Store Onboarding / First-Run";
    case "update_store": return "Update Store Settings";
    case "update_store_status": return "Update Store Status";
    case "upsert_address": return "Upsert Store Address";
    case "upsert_policy": return "Upsert Legal Policy";
    case "add_domain": return "Register Custom Domain";
    case "trigger_domain_verification": return "Trigger Domain Verification";
    case "set_primary_domain": return "Set Primary Domain";
    case "create_channel": return "Create Sales Channel";
    case "get_storefront_info": return "Get Public Storefront Info";
    case "health_live": return "Liveness Probe";
    case "health_ready": return "Readiness Probe";
    default: return operationId ? operationId.replace(/_/g, ' ') : `${method} ${path}`;
  }
};

const buildApis = (): ApiEndpoint[] => {
  const parsedApis: ApiEndpoint[] = [];
  const spec = openapi as any;
  if (!spec.paths) return [];

  for (const [path, pathBlock] of Object.entries<any>(spec.paths)) {
    for (const [method, methodBlock] of Object.entries<any>(pathBlock)) {
      if (["get", "post", "put", "delete"].includes(method)) {
        const reqHeaders = [
          ...(path.startsWith("/api/storefront") || path.startsWith("/health") ? [] : [
            { key: "Authorization", val: "Bearer <token>", desc: "JWT token for merchant admin authentication." }
          ]),
          { key: "Accept", val: "application/json", desc: "Response payload format." }
        ];
        if (method !== "get" && method !== "delete") {
          reqHeaders.push({ key: "Content-Type", val: "application/json", desc: "Request payload format." });
        }

        const requestBody = getRequestJson(methodBlock.requestBody, spec);
        const response = getResponseJson(methodBlock.responses, spec);
        const curl = generateCurl(method.toUpperCase(), path, reqHeaders, requestBody);
        const name = getHumanName(methodBlock.operationId, method.toUpperCase(), path);
        
        let description = methodBlock.description || "";
        if (!description) {
          if (path === "/api/store" && method === "get") description = "Retrieves the single-instance global store settings including name, tagline, currencies, locale, weight/dimension units, feature flags, and metadata. Requires settings.read permission.";
          else if (path === "/api/store" && method === "post") description = "Runs first-time onboarding. Requires an authenticated user with settings.write permissions. If the store is already initialized, returns a 409 Conflict error. On success, sets up the store, creates a default 'online-store' sales channel, and fires onboarding verification background jobs.";
          else if (path === "/api/store" && method === "put") description = "Updates existing store configurations. All parameters are optional. Enforces validation rules on default_currency (exactly 3 chars) and support emails. Requires settings.write permission.";
          else if (path === "/api/store/status" && method === "put") description = "Updates the operational status of the store. Valid options are: 'setup_pending', 'active', 'paused', or 'suspended'. Status transitions update route gating middleware instantly. Requires settings.write permission.";
          else if (path === "/api/store/addresses/{address_type}" && method === "put") description = "Upserts shipping origin or corporate billing addresses. The '{address_type}' parameter represents the address role (e.g. 'legal' or 'shipping_origin'). For Indian legal entities, the optional 'gstin' field records the Goods and Services Tax Identification Number. Requires settings.write permission.";
          else if (path === "/api/store/policies/{policy_type}" && method === "put") description = "Configures store policies by type. The path parameter '{policy_type}' represents policies like 'refund', 'privacy', 'terms', or 'shipping'. Requires settings.write permission.";
          else if (path === "/api/store/domains" && method === "post") description = "Registers a custom storefront domain and allocates a unique verification challenge TXT token. The domain stays inactive until verified. Requires settings.write permission.";
          else if (path === "/api/store/domains/{id}/verify" && method === "post") description = "Triggers an asynchronous verification job for the custom domain ID. The core engine schedules a background task which queries external DNS TXT records using trust-dns-resolver to find the correct verification token. Requires settings.write permission.";
          else if (path === "/api/store/domains/{id}/primary" && method === "put") description = "Sets the target verified domain as the primary domain of the storefront. This action executes within a database transaction, atomically clearing is_primary on other domains and activating it on the target domain. Requires settings.write permission.";
          else if (path === "/api/channels" && method === "post") description = "Registers a new merchant sales channel (e.g. online-store, mobile-app, POS) for custom inventory isolation and order routing. Requires settings.write permission.";
          else if (path === "/api/storefront/info" && method === "get") description = "Returns sanitized public brand details. Unlike /api/store, this endpoint requires zero authentication, excludes private metadata, and returns standard HTTP Cache-Control headers set to max-age=600 (10 minutes) for CDN caching.";
          else if (path === "/health/live" && method === "get") description = "Quick systems checking endpoint confirming monolithic server liveness probe status verification.";
          else if (path === "/health/ready" && method === "get") description = "Deep systems diagnostics health check confirming readiness of connected database, caches, and storage providers.";
        }

        parsedApis.push({
          name,
          method: method.toUpperCase(),
          path: path.replace(/\{([^}]+)\}/g, ":$1"),
          description,
          headers: reqHeaders,
          requestBody,
          curl,
          response
        });
      }
    }
  }
  return parsedApis;
};

const apis = buildApis();

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
