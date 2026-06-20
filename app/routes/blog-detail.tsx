import { Link, useParams } from "react-router";
import type { Route } from "./+types/blog-detail";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Hyperrr Engineering Log details" },
  ];
}

// Reuse tokenizer and highlighting functions
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

// CLEAN SLATE DATABASE STORE: Empty log content mapping
const postContents: Record<string, string> = {};

export default function BlogDetail() {
  const { id } = useParams();
  const content = id ? postContents[id] : null;

  if (!content) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4 flex-grow flex flex-col justify-center">
        <h2 className="text-2xl font-black font-serif-header text-red-600">Article Not Found ⚠️</h2>
        <p className="text-xs sm:text-sm text-[#57575A] font-serif max-w-sm mx-auto leading-relaxed">
          "The requested engineering log has not been published or lacks an active commit reference."
        </p>
        <div>
          <Link to="/blog" className="px-4 py-2 rounded btn-volt text-xs cursor-pointer inline-block">
            ← Return to Logs Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left flex-grow">
      <div className="mb-8">
        <Link to="/blog" className="font-mono text-[10px] font-bold text-[#1C1C1E] hover:underline">
          ← Back to Daily Logs List
        </Link>
      </div>
      <div className="paper-card p-6 sm:p-10 rounded-xl">
        <article className="prose max-w-none">
          {renderMarkdown(content)}
        </article>
      </div>
    </div>
  );
}
