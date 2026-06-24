import { useState } from "react";
import type { Route } from "./+types/guides";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hyperrr Ecosystem Guides & Core Manuals" },
    { name: "description", content: "Getting Started, Rust Modular Workspaces, Indian GST and WASM custom discounts." },
  ];
}

// Syntax highlighting and markdown renderer blueprint
interface Token {
  type: string;
  value: string;
}

const tokenize = (line: string, lang: string): Token[] => {
  const regex = /(\/\/.*|#.*)|("[^"\\]*(?:\\.[^"\\]*)*"|'[^'\\]*(?:\\.[^'\\]*)*')|(\b\d+\b)|(\b[a-zA-Z_][a-zA-Z0-9_]*\b)|(\S)/g;
  let match;
  const tokens: Token[] = [];
  let lastIndex = 0;
  const keywords = lang === "rust" ? ["fn", "let", "mut", "pub", "impl", "trait"] : [];

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: line.substring(lastIndex, match.index) });
    }
    const [_, comment, string, number, word, punct] = match;
    if (comment) tokens.push({ type: "comment", value: comment });
    else if (string) tokens.push({ type: "string", value: string });
    else if (number) tokens.push({ type: "number", value: number });
    else if (word) {
      if (keywords.includes(word)) tokens.push({ type: "keyword", value: word });
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
  return tokenize(line, lang).map((token, j) => {
    let cls = "text-zinc-300";
    if (token.type === "comment") cls = "text-zinc-500 italic";
    else if (token.type === "string") cls = "text-emerald-300";
    else if (token.type === "number") cls = "text-cyan-300";
    else if (token.type === "keyword") cls = "text-pink-400 font-bold";
    return <span key={j} className={cls}>{token.value}</span>;
  });
};

const RenderCode = ({ code, lang }: { code: string; lang: string }) => {
  return (
    <div className="font-mono text-[11px] overflow-x-auto whitespace-pre leading-relaxed select-text mt-4">
      {code.split("\n").map((line, i) => (
        <div key={i} className="flex">
          <span className="w-8 shrink-0 text-zinc-600 text-right select-none pr-3 border-r border-white/5 mr-3">{i + 1}</span>
          <span className="flex-grow">{line === "" ? " " : highlightLine(line, lang)}</span>
        </div>
      ))}
    </div>
  );
};

const parseInline = (text: string) => {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-[#1C1C1E] font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="bg-black/5 px-1 py-0.5 rounded font-mono text-[11px] text-[#1C1C1E]">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const renderMarkdown = (md: string) => {
  const blocks: any[] = [];
  const lines = md.split("\n");
  let currentParagraph: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLang = "rust";

  const flushParagraph = (key: number) => {
    if (currentParagraph.length > 0) {
      blocks.push(
        <p key={`p-${key}`} className="text-xs sm:text-sm text-[#57575A] leading-relaxed font-medium font-serif my-3.5">
          {parseInline(currentParagraph.join(" "))}
        </p>
      );
      currentParagraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (inCodeBlock) {
      if (trimmed.startsWith("```")) {
        inCodeBlock = false;
        blocks.push(
          <div key={`code-${i}`} className="paper-card rounded-xl overflow-hidden bg-[#1C1C1E] border-[#1C1C1E] text-white flex flex-col my-6 shadow-[2px_2px_0px_#1C1C1E]">
            <div className="p-4 bg-[#1C1C1E] overflow-auto">
              <RenderCode code={codeBlockContent.join("\n")} lang={codeBlockLang} />
            </div>
          </div>
        );
        codeBlockContent = [];
      } else {
        codeBlockContent.push(line);
      }
      continue;
    }

    if (trimmed.startsWith("```")) {
      flushParagraph(i);
      inCodeBlock = true;
      codeBlockLang = trimmed.replace("```", "").trim() || "rust";
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph(i);
      blocks.push(<h1 key={`h1-${i}`} className="text-2xl sm:text-3xl font-black mt-8 mb-4 font-serif-header text-[#1C1C1E] border-b border-[#1C1C1E]/10 pb-2">{trimmed.replace("# ", "")}</h1>);
    } else if (trimmed.startsWith("## ")) {
      flushParagraph(i);
      blocks.push(<h2 key={`h2-${i}`} className="text-lg sm:text-xl font-bold mt-8 mb-3 font-serif-header text-[#1C1C1E]">{trimmed.replace("## ", "")}</h2>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph(i);
      blocks.push(
        <div key={`li-${i}`} className="flex items-start space-x-2 text-xs sm:text-sm text-[#57575A] font-medium font-serif my-1.5 ml-4">
          <span className="text-[#d7ff00] font-black select-none">•</span>
          <span className="flex-grow">{parseInline(trimmed.substring(2))}</span>
        </div>
      );
    } else if (trimmed === "") {
      flushParagraph(i);
    } else {
      currentParagraph.push(line);
    }
  }
  flushParagraph(lines.length);
  return <div className="space-y-1">{blocks}</div>;
};

// CLEAN SLATE DATABASE STORE: Loaded guides
const guides: Record<string, { title: string; category: string; content: string }> = {
  "store-configuration": {
    title: "Store Settings & Lifecycle",
    category: "Core Modules",
    content: `# Store Configuration & Lifecycle Manual

This guide describes how to manage store configurations, setup onboarding, configure sales channels, register custom domains with TXT record validation, and handle store operational states in the Hyperrr core monolith.

## 1. Merchant Onboarding CLI

To initialize a store directly from the command line, run the setup command:

\`\`\`bash
cargo run -- setup --name "My Store" --email "merchant@example.com" --currency "INR" --timezone "Asia/Kolkata"
\`\`\`

This command:
* Checks if a store configuration already exists (it is idempotent and exits early if a store is already setup).
* Seeds the initial store settings in the stores table.
* Provisions a default sales channel labeled online-store.
* Activates the store operational status directly, allowing immediate checkout functionality.

## 2. Database Schema Map

The stores module uses five unified PostgreSQL tables to handle configurations, settings, shipping/legal origins, policies, domains, and sales channel routing:

* stores: Holds single-instance shop settings (currency, support details, timezone, logo, metadata, and state flags).
* store_addresses: Handles legal corporate details and shipping origins (including state codes and Indian GSTIN fields).
* store_policies: Manages rich-text legal blobs (e.g., return policies, privacy policies, terms, shipping info).
* store_domains: Registers custom customer domains, verification status, and DNS tokens.
* channels: Declares active sales channels (e.g., Online Store, Mobile App, POS) for order routing.

## 3. Store Operational States & Gating

A store operates under one of four lifecycle states:

* setup_pending: The default state on new installations. All public storefront and cart routes are blocked, returning 503 Service Unavailable (Store Setup Required). Admin authentication and onboarding endpoints remain open.
* active: Fully operational. Customers can check out and place orders.
* paused: Store is temporarily offline. Catalog remains readable, but checkouts/cart conversions are blocked with a 503 Service Unavailable (Store Paused) error.
* suspended: Admin actions are locked out, and storefront paths return 503 Service Unavailable.

This gating is enforced at the network edge by the StoreStatusMiddleware intercepting all storefront requests.

## 4. Custom Domain Verification Flow

Hyperrr supports custom storefront domains. To ensure proof of ownership before routing traffic, custom domains go through an asynchronous verification flow:

* Register: The administrator registers a domain via POST /api/store/domains which returns a unique DNS challenge token.
* DNS Record: The merchant creates a TXT record at their domain registrar containing this challenge token.
* Verify: The admin triggers POST /api/store/domains/:id/verify. This pushes a VerifyDomainJob onto the background task worker queue.
* DNS Lookup: The background job queries the domain's TXT records using trust-dns-resolver. On match, the domain state transitions to verified, enabling primary routing. Local-only domains (e.g., .test, .example, localhost) automatically bypass TXT lookups.

## 5. Composition Auditing and Metadata Mixins

Database tables in the store module adhere to standard auditing and metadata models by composition:
* AuditMixin: Flattens created_at and updated_at timestamps using SQLx composition, avoiding manual field duplication.
* MetadataMixin: Provides metadata (public-facing settings JSONB) and private_metadata (sensitive system flags JSONB). This same model is also applied to the users table, replacing the old, separate relational metafields table.`
  }
};

export default function Guides() {
  const guideKeys = Object.keys(guides);
  const [selected, setSelected] = useState<string>(guideKeys[0] || "");

  // If there are no guides, render a beautiful empty state
  if (guideKeys.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-2xl mx-auto shadow-sm">
          📁
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black font-serif-header text-[#1C1C1E]">No guides available</h2>
          <p className="text-xs sm:text-sm text-[#57575A] font-serif font-medium max-w-sm mx-auto leading-relaxed">
            "Workspace compile parameters and setup guides will occupy this portal once developer audit validations are tagged."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow flex flex-col">
      <div className="flex flex-col lg:flex-row gap-8 items-start flex-grow">
        
        {/* Sidebar Nav */}
        <div className="w-full lg:w-72 shrink-0 paper-card p-4 rounded-xl space-y-4 text-left">
          <div className="px-2">
            <span className="text-[9px] font-mono font-black text-zinc-400 tracking-widest uppercase block">manual topics</span>
          </div>
          <div className="space-y-1">
            {guideKeys.map((key) => {
              const guide = guides[key];
              const isAct = selected === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`w-full text-left px-3.5 py-2.5 rounded font-mono text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                    isAct 
                      ? "bg-[#FAF8F5] border-[#1C1C1E]/30 text-[#1C1C1E] shadow-[1px_1px_0px_#1C1C1E]"
                      : "bg-transparent border-transparent text-[#1C1C1E]/75 hover:bg-[#F4F1EA]"
                  }`}
                >
                  <span>{guide.title}</span>
                  <span className="text-[8px] bg-black/5 px-1.5 py-0.5 rounded font-bold uppercase">{guide.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow paper-card p-6 sm:p-10 rounded-xl w-full min-h-[500px]">
          <article className="prose max-w-none">
            {renderMarkdown(guides[selected].content)}
          </article>
        </div>

      </div>
    </div>
  );
}
