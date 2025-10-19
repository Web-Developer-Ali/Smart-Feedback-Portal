"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Users,
  Target,
  Zap,
  Heart,
  Shield,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Developer_Image from "../../../../public/1760425447385.png";
import Head from "next/head";

export default function About() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background">
      <Head>
        <title>
          About ClientFlow | Simple Client Management for Freelancers
        </title>
        <meta
          name="description"
          content="Learn about ClientFlow — the simplest tool for freelancers and agencies to manage client feedback, approvals, and communication efficiently."
        />
        <meta
          name="keywords"
          content="ClientFlow, freelancer management, client feedback, project approval, agency tools, project communication"
        />
        <meta name="author" content="ClientFlow" />
        <link rel="canonical" href="https://yourdomain.com/about" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="About ClientFlow" />
        <meta
          property="og:description"
          content="Discover how ClientFlow helps freelancers and agencies simplify client management."
        />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://yourdomain.com/about" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="About ClientFlow | Built for Freelancers"
        />
        <meta
          name="twitter:description"
          content="ClientFlow helps freelancers and agencies simplify client communication, feedback, and approvals."
        />
      </Head>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className="font-bold text-lg text-foreground">
              ClientFlow
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "Home", href: "/" },
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-foreground/70 hover:text-blue-600 transition-colors duration-300 font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

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

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 bg-background/95 p-4 space-y-4 animate-in fade-in slide-in-from-top-2">
            {[
              { label: "Home", href: "/" },
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/#pricing" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-sm text-foreground/70 hover:text-blue-600 transition-colors duration-300 font-medium"
              >
                {item.label}
              </a>
            ))}
            <Link href="/signup">
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
              About ClientFlow
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the simplest way for freelancers and agencies to
              manage client feedback, approvals, and communication without the
              complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Our Story
            </h2>
            <div className="space-y-4 text-lg text-foreground/70 leading-relaxed">
              <p>
                ClientFlow was born from frustration. As a solo developer and
                freelancer, I spent countless hours chasing clients across
                email, WhatsApp, and Slack just to get project approvals.
                Feedback was scattered, deadlines were missed, and communication
                was chaotic.
              </p>
              <p>
                I realized that freelancers and agencies needed a better way a
                tool that made client communication simple, secure, and
                stress-free. No complex logins. No endless integrations. Just a
                clean, intuitive platform where clients could provide feedback
                and approvals instantly.
              </p>
              <p>
                Today, as a solo founder, I'm proud to help hundreds of
                freelancers and agencies streamline their client workflows and
                focus on what they do best: creating amazing work.
              </p>
            </div>
          </div>

          <div className="relative animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-blue-100/10 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 border border-border/50 shadow-2xl">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-foreground">
                  ClientFlow Timeline
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">2025</div>
                      <div className="text-sm text-foreground/70">
                        ClientFlow launched
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">
                        Q2 2025
                      </div>
                      <div className="text-sm text-foreground/70">
                        70+ users joined
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">
                        Q3 2025
                      </div>
                      <div className="text-sm text-foreground/70">
                        Custom branding launched
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-foreground">Today</div>
                      <div className="text-sm text-foreground/70">
                        Helping 100+ projects
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative animate-in fade-in slide-in-from-left-4 duration-700 order-2 md:order-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-blue-100/10 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
              <Image
                src={Developer_Image}
                alt="Founder of ClientFlow"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-200 order-1 md:order-2">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Built by a Solo Developer
            </h2>
            <div className="space-y-4 text-lg text-foreground/70 leading-relaxed">
              <p>
                ClientFlow is built and maintained by a solo developer who
                understands the real challenges freelancers face. Every feature,
                every design decision, and every update comes from direct
                experience managing clients and solving problems firsthand.
              </p>
              <p>
                This isn't a corporate product built by a committee. It's a tool
                crafted with passion by someone who lives the freelancer
                lifestyle and genuinely cares about making your life easier.
              </p>
              <p>
                I'm constantly listening to user feedback, shipping
                improvements, and building features that matter. Your success is
                my success, and I'm committed to making ClientFlow the best
                client management tool for freelancers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Our Mission & Values
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
            We're committed to making client management simple, secure, and
            delightful for every freelancer and agency.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: "Simplicity First",
              desc: "We believe great tools should be intuitive. No learning curve, no complexity—just results.",
            },
            {
              icon: Shield,
              title: "Security & Trust",
              desc: "Your client data is sacred. We use industry-leading security to keep everything safe.",
            },
            {
              icon: Heart,
              title: "Customer Obsessed",
              desc: "We listen to our users and build features that solve real problems, not imaginary ones.",
            },
            {
              icon: Zap,
              title: "Speed Matters",
              desc: "Fast, responsive, and reliable. We optimize for performance so you can focus on work.",
            },
            {
              icon: Users,
              title: "Community Driven",
              desc: "We're building with our users, not for them. Your feedback shapes our roadmap.",
            },
            {
              icon: ArrowRight,
              title: "Always Improving",
              desc: "We iterate constantly, learning from data and user feedback to make ClientFlow better.",
            },
          ].map((value, i) => (
            <Card
              key={i}
              className="p-6 border-border/50 bg-background hover:bg-blue-50 hover:border-blue-300 transform hover:scale-105 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md"
            >
              <value.icon className="w-8 h-8 text-blue-600 mb-4 group-hover:text-blue-700 group-hover:scale-110 transition-all duration-300" />
              <h3 className="font-semibold text-foreground mb-2">
                {value.title}
              </h3>
              <p className="text-sm text-foreground/70">{value.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Meet the Founder
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
            A solo developer passionate about solving real problems for
            freelancers and agencies.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="p-8 border-border/50 bg-background hover:bg-blue-50 hover:border-blue-300 transform hover:scale-105 transition-all duration-300 group shadow-sm hover:shadow-md text-center">
            <div className="text-6xl mb-4">👨‍💻</div>
            <h3 className="text-xl font-semibold text-foreground mb-1">
              Ali Hamza
            </h3>
            <p className="text-sm text-blue-600 font-medium mb-4">
              Founder & Solo Developer
            </p>
            <p className="text-sm text-foreground/70">
              Building ClientFlow to solve the client management problem.
              Passionate about creating tools that make freelancers' lives
              easier.
            </p>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { stat: "70+", label: "Active Users" },
            { stat: "100+", label: "Projects Managed" },
            { stat: "99.9%", label: "Uptime" },
            { stat: "24/7", label: "Support" },
          ].map((item, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-xl bg-blue-50 border border-blue-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="text-4xl font-bold text-foreground mb-2">
                {item.stat}
              </div>
              <p className="text-foreground/70">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30">
        <Card className="p-12 border-border/50 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-600/20">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Join the ClientFlow Community
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
              Experience the simplest way to manage client feedback and
              approvals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-600/30 transform hover:scale-105 transition-all duration-300 font-semibold"
                >
                  Start Free Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="hover:bg-blue-100 hover:border-blue-400 transition-all duration-300 bg-transparent text-foreground border-foreground/20 font-semibold"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-background/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">CF</span>
                </div>
                <span className="font-bold text-foreground">ClientFlow</span>
              </div>
              <p className="text-sm text-foreground/70">
                Simplifying client feedback management for freelancers and
                agencies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a
                    href="/"
                    className="hover:text-blue-600 transition-colors duration-300"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/#features"
                    className="hover:text-blue-600 transition-colors duration-300"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="/#pricing"
                    className="hover:text-blue-600 transition-colors duration-300"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a
                    href="/about"
                    className="hover:text-blue-600 transition-colors duration-300"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-600 transition-colors duration-300"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-600 transition-colors duration-300"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-foreground/70">
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-600 transition-colors duration-300"
                  >
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-600 transition-colors duration-300"
                  >
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-blue-600 transition-colors duration-300"
                  >
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-foreground/70">
            <p>&copy; 2025 ClientFlow. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a
                href="#"
                className="hover:text-blue-600 transition-colors duration-300"
              >
                Twitter
              </a>
              <a
                href="#"
                className="hover:text-blue-600 transition-colors duration-300"
              >
                LinkedIn
              </a>
              <a
                href="#"
                className="hover:text-blue-600 transition-colors duration-300"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
