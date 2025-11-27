import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export default function Navbar() {
  const [visible, setVisible] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [dark]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      aria-hidden={!visible}
    >
      <nav className="mx-auto mt-2 max-w-7xl rounded-2xl bg-white/70 px-4 py-2 shadow-lg backdrop-blur dark:bg-gray-900/70">
        <div className="flex items-center justify-between">
          <Logo size="md" showText className="text-gray-900 dark:text-white" />

          <div className="flex items-center gap-3">
            <a href="#features" className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Features</a>
            <a href="#how" className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">How it works</a>
            <button
              onClick={() => setDark((d) => !d)}
              aria-label="Toggle dark mode"
              className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {dark ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}


