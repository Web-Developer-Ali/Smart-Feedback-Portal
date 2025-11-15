"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Heart,
  Target,
  Users,
  Zap,
  Shield,
  Rocket,
  Star,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Code,
  RocketIcon,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/marketing_page/footer/page";
import Navbar from "@/components/marketing_page/navbar/page";
import Head from "next/head";

export default function About() {
  const teamMembers = [
    {
      name: "Ali Hamza",
      role: "Founder & CEO",
      bio: "Former agency owner who struggled with client communication for 2+ years. Built WorkSpan to solve the problems he faced daily.",
      funFact: "🎸 Plays guitar in a weekend rock band",
    },
    {
      name: "Hammad",
      role: "Head of Product",
      bio: "Product designer turned product manager. Passionate about creating tools that make freelancers&apos; lives easier.",
      funFact: "🌱 Urban gardener with 50+ houseplants",
    },
    {
      name: "Hassan",
      role: "Lead Developer",
      bio: "Full-stack developer with 2.5 years experience. Believes in building fast, reliable software that just works.",
      funFact: "🏃‍♂️ Marathon runner and fitness enthusiast",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Freelancer First",
      description: "Every feature is built with freelancers and agencies in mind. We solve real problems you face daily.",
    },
    {
      icon: Zap,
      title: "Simplicity Rules",
      description: "We believe powerful tools should be easy to use. No complex setups, no steep learning curves.",
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Your data is yours. We use enterprise-grade security to protect your projects and client information.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "We listen to our users and build features that matter. Your feedback shapes our product roadmap.",
    },
  ];

  const milestones = [
    { 
      year: "2025", 
      event: "The Idea Was Born", 
      description: "Frustrated with client communication chaos, we decided to build a better solution",
      icon: Lightbulb,
      color: "from-yellow-500 to-orange-500"
    },
    { 
      year: "2025", 
      event: "Development Begins", 
      description: "Started building WorkSpan with our core features and user-friendly design",
      icon: Code,
      color: "from-blue-500 to-purple-500"
    },
    { 
      year: "2025", 
      event: "MVP Launch", 
      description: "Launched our minimum viable product to early users and gathered feedback",
      icon: RocketIcon,
      color: "from-green-500 to-teal-500"
    },
    { 
      year: "Now", 
      event: "Growing Together", 
      description: "Working with our first users to improve and expand WorkSpan&apos;s capabilities",
      icon: Users,
      color: "from-purple-500 to-pink-500"
    },
  ];

  return (
    <>
      <Head>
        <title>About WorkSpan - Our Mission to Simplify Client Management</title>
        <meta
          name="description"
          content="Learn about WorkSpan&apos;s mission to help freelancers and agencies manage client projects efficiently. Our story, team, and values."
        />
        <meta name="author" content="WorkSpan" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="About WorkSpan - Our Story & Mission" />
        <meta
          property="og:description"
          content="Learn how WorkSpan is helping freelancers and agencies streamline client communication and project approvals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://workspan.io/about" />
        <meta property="og:image" content="https://workspan.io/og-about.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About WorkSpan - Our Story & Mission" />
        <meta
          name="twitter:description"
          content="Learn how WorkSpan is helping freelancers and agencies streamline client communication."
        />
        <meta name="twitter:image" content="https://workspan.io/og-about.png" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://workspan.io/about" />
      </Head>

      <main className="min-h-screen bg-background">
        {/* Navigation */}
        <Navbar />

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200">
                  <Sparkles className="w-4 h-4" />
                  Fresh & Focused
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
                  Built for <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Freelancers</span>, by Freelancers
                </h1>

                <p className="text-xl text-foreground/70 leading-relaxed text-balance max-w-lg">
                  WorkSpan was born from our own frustration with client communication chaos. 
                  We&apos;re building the tool we wish we had when we were in your shoes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl hover:shadow-blue-600/40 transform hover:scale-105 transition-all duration-300 font-bold text-base py-6"
                  >
                    <Rocket className="w-5 h-5" />
                    Join Our Early Community
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              {/* Early Adopter Badge */}
              <div className="pt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-200">
                  <Star className="w-4 h-4" />
                  Early adopter benefits available
                </div>
              </div>
            </div>

            {/* Mission Visual */}
            <div className="relative animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
              <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 border border-border/50 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5"></div>
                
                <div className="relative space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-lg">Our Mission</h3>
                      <p className="text-foreground/70 text-sm">Simplify client work for creative professionals</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-foreground">No more lost feedback emails</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-foreground">Clear project approval process</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-foreground">More time for creative work</span>
                    </div>
                  </div>

                  {/* MVP Launch Badge */}
                  <div className="pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2 text-xs text-foreground/60">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      MVP Launched & Accepting Early Users
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Origin Story */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground text-balance">
                From Frustration to Solution
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed">
                Our founder, Ali, ran a small agency and spent more time chasing client feedback 
                across emails, WhatsApp, and Slack than actually designing. The breaking point came 
                when a critical project was delayed because feedback got lost in endless message threads.
              </p>
              <p className="text-lg text-foreground/70 leading-relaxed">
                That&apos;s when we asked: <strong>What if client communication could be simple, organized, and efficient?</strong> 
                WorkSpan is our answer to that question - built from real pain points we experienced.
              </p>
              
              <div className="flex items-center gap-6 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">2+</div>
                  <div className="text-sm text-foreground/70">Years of agency experience</div>
                </div>
                <ArrowRight className="w-6 h-6 text-foreground/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">New</div>
                  <div className="text-sm text-foreground/70">Fresh perspective</div>
                </div>
                <ArrowRight className="w-6 h-6 text-foreground/30" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">MVP</div>
                  <div className="text-sm text-foreground/70">Launched & growing</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-border/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-foreground">The Problem We Solved</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-foreground/70">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Client feedback scattered across 5+ platforms
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/70">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      No clear approval process for projects
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/70">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Constant context switching between tools
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/70">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      Wasting hours searching for specific feedback
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-foreground">The WorkSpan Solution</span>
                    </div>
                    <div className="space-y-3 mt-3">
                      <div className="flex items-center gap-3 text-sm text-foreground/70">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        All feedback in one organized place
                      </div>
                      <div className="flex items-center gap-3 text-sm text-foreground/70">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Clear milestone approval workflow
                      </div>
                      <div className="flex items-center gap-3 text-sm text-foreground/70">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        No client signups required
                      </div>
                      <div className="flex items-center gap-3 text-sm text-foreground/70">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Instant notifications for updates
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Our Values
              </h2>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
                The principles that guide everything we build at WorkSpan
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="p-6 border-border/50 bg-white hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-3">{value.title}</h3>
                  <p className="text-foreground/70 text-sm">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
              Meet the Team
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
              A small, passionate team dedicated to making client work better for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="p-8 border-border/50 bg-background hover:bg-blue-50 hover:border-blue-300 transform hover:scale-105 transition-all duration-300 text-center group"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-xl mb-2">{member.name}</h3>
                <div className="text-blue-600 font-semibold mb-4">{member.role}</div>
                <p className="text-foreground/70 text-sm mb-4">{member.bio}</p>
                <div className="text-xs text-foreground/60 bg-slate-100 rounded-full px-3 py-1 inline-block">
                  {member.funFact}
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Updated Timeline Section */}
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-20 md:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Our Journey So Far
              </h2>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
                From idea to MVP - and this is just the beginning
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative">
                  <Card className="p-6 border-border/50 bg-white hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center h-full">
                    <div className={`w-16 h-16 bg-gradient-to-r ${milestone.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <milestone.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                    <h3 className="font-bold text-foreground text-lg mb-3">{milestone.event}</h3>
                    <p className="text-foreground/70 text-sm">{milestone.description}</p>
                  </Card>
                </div>
              ))}
            </div>

            {/* Callout for early users */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-blue-200 shadow-lg">
                <Sparkles className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-semibold text-foreground">Be part of our story</p>
                  <p className="text-sm text-foreground/70">Join as an early user and help shape WorkSpan&apos;s future</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <Card className="p-12 border-0 bg-gradient-to-br from-blue-600 to-purple-700 text-white text-center shadow-2xl hover:shadow-3xl transition-all duration-300">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-balance">
                Join Our Early Community
              </h2>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto text-balance">
                Be among the first to experience WorkSpan and help us build the perfect client management tool.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link href="/signup" className="flex-1 max-w-sm">
                  <Button
                    size="lg"
                    className="w-full gap-3 bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold text-base py-6"
                  >
                    <Rocket className="w-5 h-5" />
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="pt-6 border-t border-blue-500/30">
                <p className="text-blue-200 text-sm">
                  <strong>No credit card required</strong> • Early adopter benefits • Direct influence on features
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