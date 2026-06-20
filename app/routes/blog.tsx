import { Link } from "react-router";
import type { Route } from "./+types/blog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hyperrr Engineering Logs & Dev Journal" },
    { name: "description", content: "Technical deep-dives on Cargo workspaces, compile-time GST, and redirectionless UPI intents." },
  ];
}

// CLEAN SLATE DATABASE STORE: Empty engineering logs list
export const logsList: any[] = [];

export default function BlogList() {
  // If there are no logs, render a beautiful empty state
  if (logsList.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-6 flex-grow flex flex-col justify-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-2xl mx-auto shadow-sm">
          ✍️
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black font-serif-header text-[#1C1C1E]">No engineering logs</h2>
          <p className="text-xs sm:text-sm text-[#57575A] font-serif font-medium max-w-sm mx-auto leading-relaxed">
            "Day-0 rewrite logs, speed benchmarks, and security audits will populate this journal once system commits are tagged."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left flex-grow">
      
      {/* Title */}
      <div className="mb-12 border-b border-[#1C1C1E]/10 pb-6 text-center sm:text-left">
        <span className="text-xs bg-[#d7ff00]/25 text-[#1C1C1E] border border-[#1C1C1E]/15 px-3.5 py-1.5 rounded-full font-mono uppercase font-bold">
          Developer Journals ✍️
        </span>
        <h1 className="text-3xl sm:text-4xl font-black mt-4 font-serif-header text-[#1C1C1E]">
          Daily <span className="highlight-sweep">Engineering Logs</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#57575A] font-medium leading-relaxed font-serif italic mt-2">
          "Internal system logs and implementation reports outlining performance, safety limits, and payment conversions."
        </p>
      </div>

      {/* Logs Feed */}
      <div className="space-y-8">
        {logsList.map((log: any) => (
          <article 
            key={log.id} 
            className="paper-card p-6 sm:p-8 rounded-xl flex flex-col justify-between hover:translate-y-[-1px] transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-zinc-500">
                <span>{log.date}</span>
                <span>•</span>
                <span>{log.readingTime}</span>
              </div>
              <div>
                <Link to={`/blog/${log.id}`}>
                  <h2 className="text-xl sm:text-2xl font-black font-serif-header text-[#1C1C1E] hover:text-[#1C1C1E]/80 transition-colors">
                    {log.title}
                  </h2>
                </Link>
                <p className="text-xs sm:text-sm text-[#57575A] font-serif font-medium leading-relaxed mt-3">
                  {log.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {log.tags.map((tag: string) => (
                  <span 
                    key={tag} 
                    className="bg-[#FAF8F5] text-zinc-600 border border-[#1C1C1E]/10 px-2 py-0.5 rounded font-mono text-[9px] font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-100/50 flex justify-end">
              <Link 
                to={`/blog/${log.id}`} 
                className="text-[10px] sm:text-xs font-mono font-black text-[#1C1C1E] hover:underline"
              >
                Read Technical Article →
              </Link>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}
