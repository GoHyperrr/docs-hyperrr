import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
  NavLink,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Mono:wght@400;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-[#FAF8F5] text-[#1C1C1E] min-h-screen flex flex-col notebook-grid pb-24 lg:pb-0">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-[#FAF8F5]/90 border-b border-[#1C1C1E]/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight font-serif-header text-[#1C1C1E]">
                  Hyperrr Docs
                </span>
                <span className="text-[10px] bg-[#d7ff00] text-[#1C1C1E] px-2 py-0.5 rounded font-mono font-bold border border-[#1C1C1E]">
                  v1.0.0 🚀
                </span>
              </Link>
            </div>
            
            <nav className="hidden lg:flex space-x-8 text-sm font-semibold">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `transition-colors text-link-hover ${isActive ? "text-[#1C1C1E] underline decoration-[#d7ff00] decoration-2 underline-offset-4" : "text-[#1C1C1E]/75 hover:text-[#1C1C1E]"}`
                }
              >
                Home 🏠
              </NavLink>
              <NavLink 
                to="/guides" 
                className={({ isActive }) => 
                  `transition-colors text-link-hover ${isActive ? "text-[#1C1C1E] underline decoration-[#d7ff00] decoration-2 underline-offset-4" : "text-[#1C1C1E]/75 hover:text-[#1C1C1E]"}`
                }
              >
                Guides 📖
              </NavLink>
              <NavLink 
                to="/api" 
                className={({ isActive }) => 
                  `transition-colors text-link-hover ${isActive ? "text-[#1C1C1E] underline decoration-[#d7ff00] decoration-2 underline-offset-4" : "text-[#1C1C1E]/75 hover:text-[#1C1C1E]"}`
                }
              >
                API Reference ⚡
              </NavLink>
              <NavLink 
                to="/blog" 
                className={({ isActive }) => 
                  `transition-colors text-link-hover ${isActive ? "text-[#1C1C1E] underline decoration-[#d7ff00] decoration-2 underline-offset-4" : "text-[#1C1C1E]/75 hover:text-[#1C1C1E]"}`
                }
              >
                Engineering Logs ✍️
              </NavLink>
            </nav>

            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com/GoHyperrr/hyperrr" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold rounded btn-volt"
              >
                Star on GitHub ⭐
              </a>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#F4F1EA] border-t border-[#1C1C1E]/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div>
              <p className="text-xs text-[#57575A] font-semibold">
                © {new Date().getFullYear()} GoHyperrr organization. Open Source Core under MIT License. 📦
              </p>
            </div>
            <div className="flex space-x-6 text-xs font-bold text-[#57575A]">
              <Link to="/" className="hover:text-[#1C1C1E] transition-colors">Home</Link>
              <Link to="/guides" className="hover:text-[#1C1C1E] transition-colors">Guides</Link>
              <Link to="/api" className="hover:text-[#1C1C1E] transition-colors">API Docs</Link>
              <Link to="/blog" className="hover:text-[#1C1C1E] transition-colors">Engineering Logs</Link>
              <a href="https://github.com/GoHyperrr/hyperrr" target="_blank" rel="noreferrer" className="hover:text-[#1C1C1E] transition-colors">GitHub</a>
            </div>
          </div>
        </footer>

        {/* Mobile Floating Bottom Navigation Bar */}
        <div className="lg:hidden fixed bottom-5 left-4 right-4 bg-[#1C1C1E]/95 border border-[#1C1C1E]/20 backdrop-blur-md z-50 h-14 rounded-full flex items-center justify-around px-4 shadow-[0_8px_30px_rgba(28,28,30,0.15)] max-w-sm mx-auto">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center transition-all ${
                isActive ? "text-[#d7ff00] scale-105" : "text-white/60 hover:text-white"
              }`
            }
          >
            <span className="text-base">🏠</span>
            <span className="text-[9px] font-bold mt-0.5">Home</span>
          </NavLink>
          <NavLink 
            to="/guides" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center transition-all ${
                isActive ? "text-[#d7ff00] scale-105" : "text-white/60 hover:text-white"
              }`
            }
          >
            <span className="text-base">📖</span>
            <span className="text-[9px] font-bold mt-0.5">Guides</span>
          </NavLink>
          <NavLink 
            to="/api" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center transition-all ${
                isActive ? "text-[#d7ff00] scale-105" : "text-white/60 hover:text-white"
              }`
            }
          >
            <span className="text-base">⚡</span>
            <span className="text-[9px] font-bold mt-0.5">API Docs</span>
          </NavLink>
          <NavLink 
            to="/blog" 
            className={({ isActive }) => 
              `flex flex-col items-center justify-center transition-all ${
                isActive ? "text-[#d7ff00] scale-105" : "text-white/60 hover:text-white"
              }`
            }
          >
            <span className="text-base">✍️</span>
            <span className="text-[9px] font-bold mt-0.5">Logs</span>
          </NavLink>
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex-grow flex items-center justify-center min-h-[50vh] p-4 text-center">
      <div className="max-w-md w-full bg-[#F4F1EA] border border-[#1C1C1E]/15 p-8 rounded-xl shadow-md">
        <h1 className="text-5xl font-black font-serif-header text-red-600 mb-4">{message} ⚠️</h1>
        <p className="text-[#1C1C1E]/80 font-medium mb-6">{details}</p>
        <Link to="/" className="px-4 py-2 rounded btn-volt text-xs">
          Return Home
        </Link>
        {stack && (
          <pre className="mt-8 text-left bg-white border border-[#1C1C1E]/10 p-4 rounded text-xs overflow-x-auto text-[#57575A] font-mono">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}
