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

// CLEAN SLATE DATABASE STORE: Empty REST API specifications array
const apis: any[] = [];

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
