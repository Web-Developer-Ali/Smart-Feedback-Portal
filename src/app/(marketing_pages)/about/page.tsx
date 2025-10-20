"use client";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Target, Zap, Heart, Shield } from "lucide-react";
import Image from "next/image";
import Developer_Image from "../../../../public/1760425447385.png";
import Head from "next/head";
import Footer from "@/components/marketing_page/footer/page";
import Navbar from "@/components/marketing_page/navbar/page";

export default function About() {
  return (
    <main className="min-h-screen bg-background">
      <Head>
        <title>About WorkSpan | Simple Client Management for Freelancers</title>
        <meta
          name="description"
          content="Learn about WorkSpan — the simplest tool for freelancers and agencies to manage client feedback, approvals, and communication efficiently."
        />
        <meta
          name="keywords"
          content="WorkSpan, freelancer management, client feedback, project approval, agency tools, project communication"
        />
        <meta name="author" content="WorkSpan" />
        <link rel="canonical" href="https://workspan.io/about" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="About WorkSpan" />
        <meta
          property="og:description"
          content="Discover how WorkSpan helps freelancers and agencies simplify client management."
        />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://workspan.io/about" />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="About WorkSpan | Built for Freelancers"
        />
        <meta
          name="twitter:description"
          content="WorkSpan helps freelancers and agencies simplify client communication, feedback, and approvals."
        />
      </Head>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight text-balance">
              About WorkSpan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re building the simplest way for freelancers and agencies
              to manage client feedback, approvals, and communication without
              the complexity.
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
                WorkSpan was born from frustration. As a solo developer and
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
                Today, as a solo founder, I&apos;m proud to help hundreds of
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
                  WorkSpan Timeline
                </div>
                <div className="space-y-4">
                  {[
                    { year: "2025", text: "WorkSpan launched" },
                    { year: "Q2 2025", text: "70+ users joined" },
                    { year: "Q3 2025", text: "Custom branding launched" },
                    { year: "Today", text: "Helping 100+ projects" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-foreground">
                          {item.year}
                        </div>
                        <div className="text-sm text-foreground/70">
                          {item.text}
                        </div>
                      </div>
                    </div>
                  ))}
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
                alt="Founder of WorkSpan"
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
                WorkSpan is built and maintained by a solo developer who
                understands the real challenges freelancers face. Every feature,
                every design decision, and every update comes from direct
                experience managing clients and solving problems firsthand.
              </p>
              <p>
                This isn&apos;t a corporate product built by a committee.
                It&apos;s a tool crafted with passion by someone who lives the
                freelancer lifestyle and genuinely cares about making your life
                easier.
              </p>
              <p>
                I&apos;m constantly listening to user feedback, shipping
                improvements, and building features that matter. Your success is
                my success, and I&apos;m committed to making WorkSpan the best
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
            Our Mission &amp; Values
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
            We&apos;re committed to making client management simple, secure, and
            delightful for every freelancer and agency.
          </p>
        </div>

        {/* Value Cards */}
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
              desc: "We&apos;re building with our users, not for them. Your feedback shapes our roadmap.",
            },
            {
              icon: ArrowRight,
              title: "Always Improving",
              desc: "We iterate constantly, learning from data and user feedback to make WorkSpan better.",
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

      {/* Footer */}
      <Footer />
    </main>
  );
}
