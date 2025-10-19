"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-foreground hover:text-accent transition-colors"
          >
            ClientFlow
          </Link>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link href="/contact" className="text-accent font-medium">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-foreground/70">
            Have questions about ClientFlow? We'd love to hear from you. Send us
            a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Centered Contact Form */}
        <div
          className="max-w-2xl mx-auto animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-foreground/5">
            <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
              Send us a Message
            </h2>

            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-slide-up">
                <p className="text-green-800 font-medium text-center">
                  ✓ Message sent successfully! We'll get back to you soon.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-foreground/10 bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-foreground/10 bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-foreground/10 bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-foreground/10 bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-accent/5 border-t border-foreground/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-foreground/70 mb-8">
            Join hundreds of freelancers managing their clients with ClientFlow.
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-600 bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-foreground/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">ClientFlow</h3>
              <p className="text-foreground/60 text-sm">
                Manage clients like a pro—without Upwork.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link
                    href="/"
                    className="hover:text-accent transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="hover:text-accent transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="hover:text-accent transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-accent transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-accent transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="hover:text-accent transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>
                  <Link
                    href="/"
                    className="hover:text-accent transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="hover:text-accent transition-colors"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-foreground/10 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-foreground/60">
            <p>&copy; 2025 ClientFlow. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="#" className="hover:text-accent transition-colors">
                Twitter
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                LinkedIn
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
