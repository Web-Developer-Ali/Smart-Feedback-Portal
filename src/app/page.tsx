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
  Clock,
  FileText,
  Star,
  MessageSquare,
  ThumbsUp,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/marketing_page/footer/page";
import Navbar from "@/components/marketing_page/navbar/page";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>WorkSpan - Simplify Client Approvals & Feedback Management</title>
        <meta
          name="description"
          content="WorkSpan helps freelancers and agencies manage clients efficiently handle milestones, approvals, and feedback in one place without needing client accounts."
        />
        <meta
          name="keywords"
          content="freelancer tools, client portal, project approvals, client feedback app, milestone management, WorkSpan"
        />
        <meta name="author" content="WorkSpan" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="WorkSpan – Manage Clients Like a Pro" />
        <meta
          property="og:description"
          content="Simplify project approvals, collect feedback, and manage client communication easily."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://workspan.io/" />
        <meta property="og:image" content="https://workspan.io/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="WorkSpan Client Management Simplified" />
        <meta
          name="twitter:description"
          content="Manage projects, milestones, and client approvals all in one platform."
        />
        <meta name="twitter:image" content="https://workspan.io/og-image.png" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://workspan.io/" />
      </Head>

      <main className="min-h-screen bg-background">
        {/* Navigation */}
        <Navbar />

        {/* Hero Section - Enhanced */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-semibold border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Sparkles className="w-4 h-4" />
                  🎁 30 days free. No credit card required.
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Stop Chasing Clients. Start Managing Projects.
                </h1>

                <p className="text-xl text-foreground/70 leading-relaxed text-balance max-w-lg">
                  Get instant client approvals, collect organized feedback, and deliver projects faster all without your clients needing to create accounts.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup" className="flex-1">
                  <Button
                    size="lg"
                    className="w-full gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl hover:shadow-blue-600/40 transform hover:scale-105 transition-all duration-300 font-bold text-base py-6"
                  >
                    <Sparkles className="w-5 h-5" />
                    Start Free Trial - 30 Days
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                {/* <Link href="#demo" className="flex-1">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full gap-2 border-2 border-foreground/20 hover:border-blue-300 hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 font-semibold py-6"
                  >
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </Button>
                </Link> */}
              </div>

              {/* Social Proof */}
              <div className="pt-8 border-t border-border/30">
                <p className="text-sm text-foreground/60 mb-4 uppercase tracking-wide font-semibold">
                  Trusted by 70+ freelancers & agencies
                </p>
                <div className="flex items-center gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-background -ml-2 first:ml-0">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    </div>
                  ))}
                  <div className="text-sm text-foreground/70">
                    <span className="font-bold text-foreground">4.9/5</span> rating
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Hero Visual */}
            <div className="relative animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
              <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 border border-border/50 shadow-2xl overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 animate-pulse"></div>
                
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-lg font-bold text-foreground">Project Dashboard</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-semibold">Live</span>
                  </div>
                </div>
                
                {/* Project Cards */}
                <div className="space-y-4">
                  {[
                    { name: "Website Redesign", progress: 80, status: "Client Review" },
                    { name: "Mobile App", progress: 45, status: "In Progress" },
                    { name: "Brand Identity", progress: 100, status: "Completed" }
                  ].map((project, i) => (
                    <div key={i} className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 border border-border/30 hover:border-blue-300 transition-all duration-300">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-foreground text-sm">{project.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.status === "Completed" ? "bg-green-100 text-green-700" :
                          project.status === "Client Review" ? "bg-blue-100 text-blue-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notifications */}
                <div className="mt-6 pt-4 border-t border-border/30">
                  <div className="text-sm font-semibold text-foreground mb-3">Recent Activity</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm text-foreground hover:text-blue-600 transition-colors duration-300 group">
                      <div className="w-2 h-2 bg-blue-600 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                      <span>Client approved design mockups</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground hover:text-green-600 transition-colors duration-300 group">
                      <div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                      <span>Revision submitted for review</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                ✅ Approved
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                🔄 In Review
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="bg-blue-50 border-y border-blue-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-sm text-foreground/70">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold">70+ Agencies</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold">99.9% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-600" />
                <span className="font-semibold">100+ Projects</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section - Enhanced */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Tired of Client Communication Chaos?
            </h2>
            <p className="text-xl text-foreground/70 max-w-3xl mx-auto text-balance">
              Lost emails, endless WhatsApp threads, unclear approvals... Sound familiar? WorkSpan eliminates the chaos with organized client collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Mail,
                title: "Scattered Feedback",
                desc: "Client comments lost across 5+ different platforms and email threads",
                pain: "Waste hours searching for feedback"
              },
              {
                icon: Clock,
                title: "Approval Delays",
                desc: "No clear process for sign-offs leads to project delays and scope creep",
                pain: "Projects stuck in approval limbo"
              },
              {
                icon: MessageSquare,
                title: "Communication Overload",
                desc: "Constant WhatsApp, Slack, and email notifications drowning your focus",
                pain: "Zero work-life balance"
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="p-8 border-border/50 bg-background hover:bg-red-50 hover:border-red-300 transform hover:scale-105 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-xl border-l-4 border-l-red-500"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors duration-300">
                    <item.icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{item.title}</h3>
                </div>
                <p className="text-foreground/70 mb-3">{item.desc}</p>
                <p className="text-sm text-red-600 font-semibold">{item.pain}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works Section - Enhanced */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                How WorkSpan Solves This in 3 Steps
              </h2>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
                Get from chaos to clarity in minutes, not days
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              
              {[
                {
                  step: "1",
                  title: "Create Project & Add Client",
                  desc: "Set up your project in 60 seconds. Just add client name and email.",
                  icon: FileText,
                  time: "60 seconds",
                  color: "from-blue-500 to-blue-600"
                },
                {
                  step: "2",
                  title: "Client Gets Secure Link",
                  desc: "They receive a magic link to view project and give feedback no signup needed.",
                  icon: Lock,
                  time: "Instant",
                  color: "from-purple-500 to-purple-600"
                },
                {
                  step: "3",
                  title: "Get Real-Time Updates",
                  desc: "See approvals, feedback, and milestones in your beautiful dashboard.",
                  icon: Bell,
                  time: "Live",
                  color: "from-green-500 to-green-600"
                },
              ].map((item, i) => (
                <div key={i} className="relative group">
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r ${item.color} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg z-10 group-hover:scale-110 transition-transform duration-300`}>
                    {item.step}
                  </div>
                  <Card className="p-8 pt-12 border-border/50 bg-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group-hover:border-blue-300 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">{item.title}</h3>
                    <p className="text-foreground/70 mb-4 text-sm">{item.desc}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Everything You Need, Nothing You Don&apos;t
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
              Built specifically for freelancers and agencies who value their time
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Zero Client Signups",
                desc: "Clients access projects instantly with magic links no passwords to remember",
                benefit: "Faster onboarding"
              },
              {
                icon: Bell,
                title: "Smart Notifications",
                desc: "Get notified only when clients respond. Mute the noise, focus on work",
                benefit: "Better focus"
              },
              {
                icon: BarChart3,
                title: "Project Dashboard",
                desc: "See all projects, status, and pending approvals in one beautiful view",
                benefit: "Total visibility"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Enterprise-grade security with end-to-end encryption for all data",
                benefit: "Peace of mind"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Built for speed. No lag, no loading screens, just instant updates",
                benefit: "Save time"
              },
              {
                icon: Mail,
                title: "White-labeled Emails",
                desc: "Send emails from your domain. Look professional, build trust",
                benefit: "Brand authority"
              },
            ].map((feature, i) => (
              <Card
                key={i}
                className="p-6 border-border/50 bg-background hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 hover:shadow-xl transform hover:scale-105 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-lg mb-3">{feature.title}</h3>
                <p className="text-foreground/70 text-sm mb-3">{feature.desc}</p>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  {feature.benefit}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing Section - Enhanced */}
        <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Simple Pricing, No Surprises
              </h2>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
                Start free. Scale as you grow. Cancel anytime.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Free Trial",
                  price: "$0",
                  period: "30 days free",
                  description: "Perfect for testing the waters",
                  features: [
                    "All premium features",
                    "Unlimited projects",
                    "Email support",
                    "No credit card needed"
                  ],
                  cta: "Start Free Trial",
                  highlighted: false,
                  popular: false
                },
                {
                  name: "Starter",
                  price: "$9",
                  period: "per month",
                  description: "For solo freelancers",
                  features: [
                    "Up to 5 active projects",
                    "Basic analytics",
                    "Email support",
                    "White-labeled emails"
                  ],
                  cta: "Get Started",
                  highlighted: false,
                  popular: false
                },
                {
                  name: "Professional",
                  price: "$19",
                  period: "per month",
                  description: "For growing freelancers",
                  features: [
                    "20 active projects",
                    "Advanced analytics",
                    "Priority support",
                    "Custom branding",
                    "API access"
                  ],
                  cta: "Start Free Trial",
                  highlighted: true,
                  popular: true
                },
                {
                  name: "Agency",
                  price: "$39",
                  period: "per month",
                  description: "For teams & agencies",
                  features: [
                    "Unlimited projects",
                    "Team members",
                    "Dedicated support",
                    "Custom workflows",
                    "SLA guarantee"
                  ],
                  cta: "Get Started",
                  highlighted: false,
                  popular: false
                },
              ].map((plan, i) => (
                <Card
                  key={i}
                  className={`p-8 flex flex-col border-2 transform hover:scale-105 transition-all duration-300 relative overflow-hidden ${
                    plan.highlighted
                      ? "border-blue-500 shadow-2xl bg-white"
                      : "border-border/50 bg-white/80 hover:border-blue-300"
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="mb-6 text-center">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                    <p className="text-foreground/70 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center gap-1 mb-2">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      {plan.period && (
                        <span className="text-foreground/70 text-sm">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/signup" className="mt-auto">
                    <Button
                      size="lg"
                      className={`w-full transition-all duration-300 font-bold py-3 ${
                        plan.highlighted
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>

            {/* Special Offer */}
            <div className="mt-12 p-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-center text-white shadow-2xl">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Sparkles className="w-6 h-6" />
                <h3 className="text-2xl font-bold">Special Launch Offer</h3>
              </div>
              <p className="text-lg mb-2">
                <span className="font-bold">Get 2 Months FREE</span> on annual plans
              </p>
              <p className="text-blue-100">
                Limited time offer for our first 100 customers
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <Card className="p-12 border-0 bg-gradient-to-br from-blue-600 to-purple-700 text-white text-center shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-balance">
                Ready to Transform Your Client Workflow?
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto text-balance">
                Join 70+ freelancers who&apos;ve already eliminated client communication chaos
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link href="/signup" className="flex-1 max-w-sm">
                  <Button
                    size="lg"
                    className="w-full gap-3 bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold text-base py-6"
                  >
                    <Sparkles className="w-5 h-5" />
                    Start Free Trial - 30 Days
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="pt-6 border-t border-blue-500/30">
                <p className="text-blue-200 text-sm">
                  <strong>No credit card required</strong> • Cancel anytime • 30-day money-back guarantee
                </p>
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