"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import logo from "@/../../public/favicon.ico"
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Pricing", href: "/#pricing" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
            <Image 
              src={logo} 
              alt="WorkSpan Logo" 
              width={40}
              height={40}
              className="text-white"
            />
          </div>
          <span className="font-bold text-lg text-foreground">WorkSpan</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ name, href }) => (
            <Link
              key={name}
              href={href}
              className="text-sm text-foreground/70 hover:text-blue-600 transition-colors duration-300 font-medium"
            >
              {name}
            </Link>
          ))}
        </div>

        {/* Desktop Button */}
        <div className="hidden md:block">
          <Link href="/signup">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Start Free Trial
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/30 bg-background/95 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          {navLinks.map(({ name, href }) => (
            <Link
              key={name}
              href={href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-foreground/70 hover:text-blue-600 transition-colors duration-300 font-medium"
            >
              {name}
            </Link>
          ))}

          <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Free Trial
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}