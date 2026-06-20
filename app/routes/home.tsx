import { Link } from "react-router";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hyperrr Developer Documentation - Ecosystem Hub" },
    { name: "description", content: "Developer manuals, REST API specifications, and engineering logs for Hyperrr." },
  ];
}

export default function Home() {
  return (
    <div className="relative py-20 min-h-[80vh] flex flex-col justify-center">
      {/* Background decoration */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#d7ff00]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10">
        
        {/* Banner Badge */}
        <div className="inline-flex items-center space-x-2 bg-white border border-[#1C1C1E]/12 px-4 py-1.5 rounded-full text-xs font-semibold text-[#1C1C1E]/80 shadow-sm">
          <span>📚 Developer Portal & Ecosystem Blueprint</span>
        </div>

        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-serif-header text-[#1C1C1E] leading-tight">
            Developer <span className="highlight-sweep">Documentation</span>
          </h1>
          <p className="text-base sm:text-lg text-[#57575A] font-semibold max-w-xl mx-auto font-serif italic">
            "Everything required to run, compile, extend, and deploy high-performance storefronts and compliant tax modules."
          </p>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
          
          {/* Card 1: Guides */}
          <Link to="/guides" className="paper-card p-6 rounded-xl flex flex-col justify-between hover:translate-y-[-2px] transition-all">
            <div>
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-base mb-4 font-mono font-bold border border-zinc-200">
                📖
              </div>
              <h3 className="text-base font-bold text-[#1C1C1E] font-serif-header mb-1">Ecosystem Guides</h3>
              <p className="text-[11px] text-[#57575A] font-medium leading-relaxed">
                Step-by-step setup guides, Cargo workspace layouts, pluggable GST splits, and WASM runtime details.
              </p>
            </div>
            <span className="text-[10px] font-bold font-mono text-[#1C1C1E] mt-4 block">Read Manuals →</span>
          </Link>

          {/* Card 2: API */}
          <Link to="/api" className="paper-card p-6 rounded-xl flex flex-col justify-between hover:translate-y-[-2px] transition-all">
            <div>
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-base mb-4 font-mono font-bold border border-zinc-200">
                ⚡
              </div>
              <h3 className="text-base font-bold text-[#1C1C1E] font-serif-header mb-1">API Reference</h3>
              <p className="text-[11px] text-[#57575A] font-medium leading-relaxed">
                Axum endpoint mapping, catalog schema details, cart intent actions, and Razorpay webhook integrations.
              </p>
            </div>
            <span className="text-[10px] font-bold font-mono text-[#1C1C1E] mt-4 block">Explore Specs →</span>
          </Link>

          {/* Card 3: Engineering logs */}
          <Link to="/blog" className="paper-card p-6 rounded-xl flex flex-col justify-between hover:translate-y-[-2px] transition-all">
            <div>
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center text-base mb-4 font-mono font-bold border border-zinc-200">
                ✍️
              </div>
              <h3 className="text-base font-bold text-[#1C1C1E] font-serif-header mb-1">Engineering Logs</h3>
              <p className="text-[11px] text-[#57575A] font-medium leading-relaxed">
                Build-in-public logs explaining Wasmtime sandboxing parameters, and zero-redirection UPI deep link logic.
              </p>
            </div>
            <span className="text-[10px] font-bold font-mono text-[#1C1C1E] mt-4 block">View Logs →</span>
          </Link>

        </div>

        {/* Footer info */}
        <div className="pt-8 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-zinc-500">
          <span>Target Architecture: WASM + PostgreSQL</span>
          <span>Open Source Core (MIT)</span>
        </div>

      </div>
    </div>
  );
}
