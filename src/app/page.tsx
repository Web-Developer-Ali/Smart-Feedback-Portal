"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Lock,
  Zap,
  BarChart3,
  Shield,
  Bell,
  Mail,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                CF
              </span>
            </div>
            <span className="font-semibold text-foreground">ClientFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Pricing
            </a>
          </div>
          <Button variant="default" size="sm">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                ✅ Free for early users · No credit card required
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight text-balance">
                Simplify client updates — no login, no hassle.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed text-balance">
                Clients can approve or update projects instantly through a
                secure link or ID. You get real-time updates — all from one
                simple dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                Join Early Access
              </Button>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Join the waitlist
              </p>
              <form onSubmit={handleWaitlist} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" variant="default">
                  {submitted ? "✓ Joined" : "Join"}
                </Button>
              </form>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 border border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold">
                    Project Dashboard
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                  <div className="h-3 bg-slate-700 rounded w-2/3" />
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <div className="text-sm text-slate-400">Recent Updates</div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      Client approved design mockups
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Revision request submitted
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Clients skip logins, forget passwords, and updates get lost in email
            threads.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            ClientFlow makes project updates instant, secure, and organized —
            without a single login.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Mail,
              title: "Email Overload",
              desc: "Feedback scattered across inboxes",
            },
            {
              icon: Zap,
              title: "Slow Responses",
              desc: "Clients need accounts to participate",
            },
            {
              icon: BarChart3,
              title: "No Visibility",
              desc: "Hard to track project progress",
            },
          ].map((item, i) => (
            <Card key={i} className="p-6 border-red-200/50 bg-red-50/30">
              <item.icon className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Three easy steps to streamline your client communication
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Add Your Client",
              desc: "Create a project and assign a client.",
              icon: Lock,
            },
            {
              step: "2",
              title: "Client Gets Secure ID",
              desc: "They use it to update status or feedback.",
              icon: CheckCircle2,
            },
            {
              step: "3",
              title: "You Get Real-Time Updates",
              desc: "View progress in your dashboard.",
              icon: Bell,
            },
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                {item.step}
              </div>
              <Card className="p-8 pt-12 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <item.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          <p>
            Our strict rate-limiting and secure IDs ensure only your client can
            update their project.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Everything you need to manage client feedback efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Lock,
              title: "No Logins Needed",
              desc: "Clients can update instantly using their secure project ID.",
            },
            {
              icon: Bell,
              title: "Email Notifications",
              desc: "Get notified when a client responds.",
            },
            {
              icon: BarChart3,
              title: "Client Management Dashboard",
              desc: "See all your projects in one clean view.",
            },
            {
              icon: Shield,
              title: "Secure Verification",
              desc: "Every update verified before reaching your database.",
            },
            {
              icon: Zap,
              title: "Spam Protection",
              desc: "Built-in rate limiting and IP monitoring.",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="p-6 hover:shadow-lg transition-shadow border-border/50"
            >
              <feature.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Starter",
              price: "Free",
              description: "Perfect for getting started",
              features: [
                "Up to 5 projects",
                "Basic client management",
                "Email notifications",
                "Community support",
              ],
              cta: "Get Started",
              highlighted: false,
            },
            {
              name: "Professional",
              price: "$29",
              period: "/month",
              description: "For growing teams",
              features: [
                "Unlimited projects",
                "Advanced analytics",
                "Priority email support",
                "Custom branding",
                "API access",
              ],
              cta: "Start Free Trial",
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              description: "For large organizations",
              features: [
                "Everything in Professional",
                "Dedicated support",
                "Custom integrations",
                "SLA guarantee",
                "Advanced security",
              ],
              cta: "Contact Sales",
              highlighted: false,
            },
          ].map((plan, i) => (
            <Card
              key={i}
              className={`p-8 flex flex-col ${
                plan.highlighted
                  ? "border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5 ring-2 ring-primary/20"
                  : "border-border/50"
              }`}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <Card className="p-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
              Ready to simplify client feedback?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Join hundreds of freelancers and agencies already using ClientFlow
              to streamline their workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-xs">
                    CF
                  </span>
                </div>
                <span className="font-semibold text-foreground">
                  ClientFlow
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Simplifying client feedback management.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition">
                    Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>&copy; 2025 ClientFlow. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground transition">
                Twitter
              </a>
              <a href="#" className="hover:text-foreground transition">
                LinkedIn
              </a>
              <a href="#" className="hover:text-foreground transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
