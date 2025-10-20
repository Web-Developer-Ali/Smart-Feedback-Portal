"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Bell,
  BarChart3,
  Lock,
  Mail,
  Sparkles,
  Users,
  Clock,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/marketing_page/footer/page";
import Navbar from "@/components/marketing_page/navbar/page";
import Head from "next/head";
export default function Home() {
  return (
    <>
      <Head>
        <title>
          WorkSpan Simplify Client Approvals, Feedback, and Communication
        </title>
        <meta
          name="description"
          content="WorkSpan helps freelancers and agencies manage clients efficiently — handle milestones, approvals, and feedback in one place without needing client accounts."
        />
        <meta
          name="keywords"
          content="freelancer tools, client portal, project approvals, client feedback app, milestone management, WorkSpan"
        />
        <meta name="author" content="WorkSpan" />
        <meta name="robots" content="index, follow" />

        {/* ✅ Open Graph / Facebook */}
        <meta
          property="og:title"
          content="WorkSpan – Manage Clients Like a Pro"
        />
        <meta
          property="og:description"
          content="Simplify project approvals, collect feedback, and manage client communication easily."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://workspan.io/" />
        <meta property="og:image" content="https://workspan.io/og-image.png" />

        {/* ✅ Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="WorkSpan – Client Management Simplified"
        />
        <meta
          name="twitter:description"
          content="Manage projects, milestones, and client approvals — all in one platform."
        />
        <meta name="twitter:image" content="https://workspan.io/og-image.png" />

        {/* ✅ Canonical URL */}
        <link rel="canonical" href="https://workspan.io/" />
      </Head>

      <main className="min-h-screen bg-background">
        {/* Navigation */}
        <Navbar />
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200 hover:border-blue-300 transition-colors duration-300">
                  <Sparkles className="w-3 h-3" />
                  30 days free. No credit card.
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
                  Manage clients like a pro without Upwork.
                </h1>

                <p className="text-lg md:text-xl text-foreground/70 leading-relaxed text-balance max-w-lg">
                  Simplify project approvals, collect feedback, and keep
                  communication clear. All in one tool no client signup
                  required.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-600/30 transform hover:scale-105 transition-all duration-300 font-semibold"
                  >
                    Start Free. Get Your First Month on Us{" "}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="pt-8 border-t border-border/30">
                <p className="text-xs text-foreground/60 mb-3 uppercase tracking-wide font-semibold">
                  Join 70+ freelancers
                </p>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200/20 to-blue-100/10 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 border border-border/50 shadow-2xl overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">
                      Project Dashboard
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-border rounded-full w-3/4" />
                    <div className="h-2 bg-border rounded-full w-1/2" />
                    <div className="h-2 bg-border rounded-full w-2/3" />
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <div className="text-xs text-foreground/60 font-semibold mb-3">
                      Recent Updates
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-foreground hover:text-blue-600 transition-colors duration-300">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        Client approved design
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground hover:text-blue-600 transition-colors duration-300">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        Revision submitted
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Freelancers and agencies struggle when managing clients outside
              Upwork/Fiverr.
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
              Lost emails, unclear approvals, endless WhatsApp messages.
              WorkSpan solves this with an easy client portal for milestones,
              approvals, and feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Mail,
                title: "Lost Emails",
                desc: "Feedback scattered across inboxes and platforms",
              },
              {
                icon: Clock,
                title: "Unclear Approvals",
                desc: "No clear workflow for project sign-offs",
              },
              {
                icon: Users,
                title: "Communication Chaos",
                desc: "Endless messages across multiple channels",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="p-6 border-border/50 bg-background hover:bg-blue-50 hover:border-blue-300 transform hover:scale-105 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md"
              >
                <item.icon className="w-8 h-8 text-blue-600 mb-4 group-hover:text-blue-700 group-hover:scale-110 transition-all duration-300" />
                <h3 className="font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-foreground/70">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              How It Works
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
              Three simple steps to streamline your client communication
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Add Your Client",
                desc: "Create a project and assign a client.",
                icon: FileText,
              },
              {
                step: "2",
                title: "Client Gets Secure ID",
                desc: "They use it to update status or feedback.",
                icon: Lock,
              },
              {
                step: "3",
                title: "You Get Real-Time Updates",
                desc: "View progress in your dashboard.",
                icon: Bell,
              },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg group-hover:shadow-lg group-hover:shadow-blue-600/50 transition-shadow duration-300">
                  {item.step}
                </div>
                <Card className="p-8 pt-12 border-border/50 bg-background hover:bg-blue-50 hover:border-blue-300 transform hover:scale-105 transition-all duration-300 group-hover:shadow-lg shadow-sm">
                  <item.icon className="w-8 h-8 text-blue-600 mb-4 group-hover:text-blue-700 group-hover:scale-110 transition-all duration-300" />
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-foreground/70 text-sm">{item.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Core Features
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
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
              {
                icon: Mail,
                title: "Custom Branding",
                desc: "Add your professional email to send emails to clients.",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="p-6 border-border/50 bg-background hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg transform hover:scale-105 transition-all duration-300 group cursor-pointer shadow-sm"
              >
                <feature.icon className="w-8 h-8 text-blue-600 mb-4 group-hover:text-blue-700 group-hover:scale-110 transition-all duration-300" />
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/70">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section
          id="pricing"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: "Free Trial",
                price: "$0",
                period: "30 days",
                description: "Try all premium features",
                features: [
                  "Unlimited features",
                  "No credit card required",
                  "Full access for 30 days",
                ],
                cta: "Start Free Trial",
                highlighted: false,
              },
              {
                name: "Starter",
                price: "$9",
                period: "/month",
                description: "For freelancers just starting",
                features: [
                  "Up to 5 projects",
                  "Email support",
                  "Basic client management",
                ],
                cta: "Get Started",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$19",
                period: "/month",
                description: "For growing freelancers",
                features: [
                  "20 projects",
                  "10 GB storage",
                  "Priority support",
                  "Custom branding",
                ],
                cta: "Start Free Trial",
                highlighted: true,
              },
              {
                name: "Agency",
                price: "$39",
                period: "/month",
                description: "For agencies managing many clients",
                features: [
                  "Unlimited projects",
                  "50 GB storage",
                  "Custom branding",
                  "Dedicated support",
                ],
                cta: "Get Started",
                highlighted: false,
              },
            ].map((plan, i) => (
              <Card
                key={i}
                className={`p-8 flex flex-col border-border/50 transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg ${
                  plan.highlighted
                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-300/50 shadow-md hover:shadow-xl hover:shadow-blue-600/20"
                    : "bg-background hover:bg-blue-50 hover:border-blue-300"
                }`}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-foreground/70 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-foreground/70 text-sm">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/70">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className={`w-full transition-all duration-300 font-semibold ${
                      plan.highlighted
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-600/30"
                        : "border-border/50 hover:bg-blue-50 hover:border-blue-300 text-foreground"
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-8 bg-blue-50 border border-blue-200 rounded-2xl text-center">
            <p className="text-lg text-foreground mb-2">
              <span className="font-semibold">🎁 Special Offer:</span> Get your
              first month free on the Pro Plan
            </p>
            <p className="text-foreground/70">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 border-t border-border/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Join the first 100 freelancers making client management painless.
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Stop chasing emails. Start managing clients the smart way.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: "70+", label: "Freelancers & Agencies" },
              { stat: "100+", label: "Projects Managed" },
              { stat: "99.9%", label: "Uptime Guarantee" },
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
                Ready to simplify client feedback?
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
                Milestones. Approvals. Reviews. Done.
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
              </div>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
