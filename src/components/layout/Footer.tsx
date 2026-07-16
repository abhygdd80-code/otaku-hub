import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-16 pb-12 sm:grid sm:grid-cols-4 sm:gap-8">
          {/* Brand */}
          <div className="mb-6">
            <h3 className="mb-4 font-medium text-primary-text">Otaku Hub</h3>
            <p className="text-sm text-secondary-text">
              Premium anime-inspired fashion and collectibles.
            </p>
          </div>
          {/* Shop */}
          <div>
            <h4 className="mb-4 font-medium text-primary-text">Shop</h4>
            <nav className="space-y-2">
              <a
                href="#"
                className="text-sm text-secondary-text hover:text-primary-text transition-colors"
              >
                Hoodies
              </a>
              <a
                href="#"
                className="text-sm text-secondary-text hover:text-primary-text transition-colors"
              >
                Oversized T-Shirts
              </a>
              <a
                href="#"
                className="text-sm text-secondary-text hover:text-primary-text transition-colors"
              >
                Umbrellas
              </a>
              <a
                href="#"
                className="text-sm text-secondary-text hover:text-primary-text transition-colors"
              >
                Action Figures
              </a>
              <a
                href="#"
                className="text-sm text-secondary-text hover:text-primary-text transition-colors"
              >
                Accessories
              </a>
            </nav>
          </div>
          {/* Support */}
          <div>
            <h4 className="mb-4 font-medium text-primary-text">Support</h4>
            <nav className="space-y-2">
              <a
                href="#"
                className="text-sm text-secondary-text hover:text-primary-text transition-colors"
              >
                FAQ
              </a>
              <a
                href="#"
                className="text-sm text-secondary-text hover:text-primary-text transition-colors"
              >
                Contact Us
              </a>
              <a
                href="#"
                className="text-sm text-secondary-text hover:text-primary-text transition-colors"
              >
                Shipping & Returns
              </a>
              <a
                href="#"
                className="text-sm text-secondary-text hover:text-primary-text transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-secondary-text hover:text-primary-text transition-colors"
              >
                Terms of Service
              </a>
            </nav>
          </div>
          {/* Social */}
          <div>
            <h4 className="mb-4 font-medium text-primary-text">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="flex items-center justify-center w-10 h-10 rounded border border-border/50 hover:border-accent hover:text-accent"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 10-7.07 0z"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="flex items-center justify-center w-10 h-10 rounded border border-border/50 hover:border-accent hover:text-accent"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M22 4.01c-1.049.171-2.162.277-3.28.31a10.089 10.089 0 01-2.93-.788c-.818 1.275-2.066 2.23-3.4 2.503a10.092 10.092 0 01-6.092-2.26c-1.25-.222-2.351-.44-3.257-.576A10.096 10.096 0 013 4.192c0 1.57.515 3.028 1.433 4.162a15.09 15.09 0 00.613 3.037M7.5 13.878a3 3 0 100-4.242A3 3 0 007.5 13.878z"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="flex items-center justify-center w-10 h-10 rounded border border-border/50 hover:border-accent hover:text-accent"
                aria-label="YouTube"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5.657V18.342a2 2 0 00.586 1.44l8.293-4.828a2 2 0 000-2.88l-8.293-4.828z"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="flex items-center justify-center w-10 h-10 rounded border border-border/50 hover:border-accent hover:text-accent"
                aria-label="TikTok"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 8.253V7.5a2.25 2.25 0 012.25-2.25h1.5a.75.75 0 010 1.5H8.25a2.25 2.25 0 00-2.25 2.25v1.358c0 .59-.236 1.155-.624 1.486a12.094 12.094 0 01-2.218-.173 12.09 12.09 0 00-2.218-.173A11.25 11.25 0 003.75 15.75v2.25a2.25 2.25 0 002.25 2.25h1.5"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-10 border-t border-border/50">
          <p className="text-center text-sm text-secondary-text">
            Copyright © 2026 Otaku Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
