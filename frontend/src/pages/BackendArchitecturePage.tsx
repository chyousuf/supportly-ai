import React from 'react';
import { Link } from 'react-router-dom';
import BackendShowcase from '../components/BackendShowcase';

export default function BackendArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Supportly <span className="text-indigo-600">AI</span></span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:inline-block">
              Home
            </Link>
            <Link to="/showcase" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:inline-block">
              30s Setup
            </Link>
            <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:inline-block">
              Dashboard
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition"
            >
              Open Console
            </Link>
          </div>
        </div>
      </header>

      {/* Main Component */}
      <main className="py-12">
        <BackendShowcase />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-white">Full-Stack Modern SaaS Architecture</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Built with Laravel 11, TypeScript React 18, Tailwind CSS, MySQL, and GSAP animations.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Link
              to="/showcase"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition"
            >
              Go to 30s Widget Setup
            </Link>
            <Link
              to="/"
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition"
            >
              Back to Home
            </Link>
          </div>
          <p className="text-xs text-slate-600 pt-6">© 2026 Supportly AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
