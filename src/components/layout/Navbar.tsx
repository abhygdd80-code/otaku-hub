'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import { useLenis } from '@/hooks/useLenis';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const lenis = useLenis();

  // Update scroll state
  useEffect(() => {
    if (!lenis) return;
    const onScroll = ({ scroll }: { scroll: number }) => {
      setIsScrolled(scroll > 10);
    };
    lenis.on('scroll', onScroll);
    return () => {
      lenis.off('scroll', onScroll);
    };
  }, [lenis]);

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav
        className={`
        sticky top-0 z-50
        ${isScrolled ? 'bg-background/80 backdrop-blur-sm' : 'bg-transparent'}
        transition-colors duration-500 ease-liner
        border-b
        ${isScrolled ? 'border-border' : 'border-transparent'}
      `}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Logo className="block lg:hidden" />
              {/* Desktop logo: show on lg and up */}
              <div className="hidden lg:block flex items-center gap-2">
                <span className="text-accent font-display text-xl">OTAKU</span>
                <span className="text-primary font-display text-xl">HUB</span>
              </div>
            </div>
            <div className="hidden md:block md:ml-10 md:flex md:items-center md:space-x-6">
              {/* Navigation links */}
              <Link
                href="/"
                className="text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/collections"
                className="text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                Collections
              </Link>
              <Link
                href="/new-arrivals"
                className="text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                New Arrivals
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-muted hover:text-primary transition-colors"
              >
                About
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button
                variant="outline"
                size="sm"
                className="p-2 rounded hover:bg-muted/20"
                aria-label="Search"
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
                    d="M21 21l-4.35-4.35M9.75 9.75l0 0"
                  />
                </svg>
              </Button>
              {/* Wishlist */}
              <Button
                variant="outline"
                size="sm"
                className="p-2 rounded hover:bg-muted/20"
                aria-label="Wishlist"
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
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.732-.715-1.606-2.377-2.732-4.312-2.732-2.59 0-4.688 2.015-4.688 4.5 0 1.333.526 2.613 1.41 3.565C35 .65 1.025 1.3 1.41 2.2l2.25 2.25c.832.832 2.068 1.065 3 .665 1.406-.575 2.93-1.457 3.964-2.718A11.95 11.95 0 0012 15.75c2.938 0 5.662-1.136 7.81-3.045 1.034 1.261 2.559 2.143 3.964 2.718.932.4 2.168.167 3-.665l2.25-2.25c1.094-1.15 1.41-2.232 1.41-3.565Z"
                  />
                </svg>
              </Button>
              {/* Cart */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2 rounded hover:bg-muted/20"
                  aria-label="Cart"
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
                      d="M2.25 3h1.386c.51 0 .955.302 1.091.712l1.48 1.8a1.125 1.125 0 001.712 0l2.16-1.62a1.125 1.125 0 011.712 0l1.48 1.8a1.125 1.125 0 001.091.712H18.75m-7.5 0H1.125c-.621 0-1.125.504-1.125 1.125v9.818c0 .621.504 1.125 1.125 1.125h9.225c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H9.75zm5.625 0a3.375 3.375 0 110 6.75 3.375 3.375 0 010-6.75z"
                    />
                    {/* Cart item count badge */}
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-accent text-xs font-bold text-background rounded-full">
                      0
                    </div>
                  </svg>
                </Button>
              </div>
              {/* Login */}
              <Button variant="primary" size="sm">
                Login
              </Button>
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded hover:bg-muted/20 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Open menu"
            >
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6 18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <nav
        className={`
        md:hidden
        ${isOpen ? 'block' : 'hidden'}
        border-t border-border/20
        bg-background/95 backdrop-blur-sm
      `}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {/* Mobile navigation links */}
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-muted hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/shop"
            className="block px-3 py-2 rounded-md text-base font-medium text-muted hover:text-primary"
          >
            Shop
          </Link>
          <Link
            href="/collections"
            className="block px-3 py-2 rounded-md text-base font-medium text-muted hover:text-primary"
          >
            Collections
          </Link>
          <Link
            href="/new-arrivals"
            className="block px-3 py-2 rounded-md text-base font-medium text-muted hover:text-primary"
          >
            New Arrivals
          </Link>
          <Link
            href="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-muted hover:text-primary"
          >
            About
          </Link>
        </div>
        <div className="border-t border-border/20 pb-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:space-x-4">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Search
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto mt-4 sm:mt-0"
            >
              Wishlist
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto mt-4 sm:mt-0"
            >
              Cart
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto mt-4 sm:mt-0"
            >
              Login
            </Button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
