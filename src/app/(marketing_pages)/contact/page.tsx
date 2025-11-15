"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import Footer from "@/components/marketing_page/footer/page";
import Navbar from "@/components/marketing_page/navbar/page";
import Head from "next/head";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  Users,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import axios from "axios";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
       await axios.post('/api/contactUs', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Success
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
  
    } catch (err) {
      if (axios.isAxiosError(err)) {
        // Handle Axios error
        setError(err.response?.data?.message || 'Failed to send message. Please try again.');
      } else {
        // Handle other errors
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Head>
        {/* Primary Meta Tags */}
        <title>Contact WorkSpan | Get in Touch with Our Team</title>
        <meta
          name="description"
          content="Have questions or need support? Contact WorkSpan to learn how we help freelancers and agencies manage client feedback and communication effortlessly."
        />
        <meta
          name="keywords"
          content="WorkSpan contact, freelancer support, project management help, WorkSpan support, client management tool"
        />
        <meta name="author" content="WorkSpan" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1d4ed8" />
        <link rel="canonical" href="https://workspan.io/contact" />

        {/* Open Graph / Facebook */}
        <meta property="og:site_name" content="WorkSpan" />
        <meta property="og:title" content="Contact WorkSpan" />
        <meta
          property="og:description"
          content="Get in touch with WorkSpan — we&apos;re here to help freelancers and agencies manage projects better."
        />
        <meta property="og:image" content="https://workspan.io/logo.png" />
        <meta property="og:url" content="https://workspan.io/contact" />
        <meta property="og:type" content="website" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Contact WorkSpan | Client Management Made Easy"
        />
        <meta
          name="twitter:description"
          content="Have questions about WorkSpan? Contact us today to learn how we simplify client communication and approvals."
        />
        <meta name="twitter:image" content="https://workspan.io/logo.png" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ContactPage",
              name: "Contact WorkSpan",
              description:
                "Reach out to the WorkSpan team for questions, support, or partnership inquiries.",
              url: "https://workspan.io/contact",
              mainEntity: {
                "@type": "Organization",
                name: "WorkSpan",
                url: "https://workspan.io",
                logo: "https://workspan.io/logo.png",
              },
            }),
          }}
        />
      </Head>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-in fade-in duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200 mb-6">
              <MessageSquare className="w-4 h-4" />
              We&apos;re Here to Help
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Get in <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Touch</span>
            </h1>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto text-balance">
            Have questions about WorkSpan? We&apos;d love to hear from you. Send us a message and we&apos;ll respond within 24 hours.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
              <Card className="p-6 border-border/50 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email Us</h3>
                    <p className="text-foreground/70 text-sm">We&apos;ll reply quickly</p>
                  </div>
                </div>
                <p 
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Contact Us
                </p>
              </Card>

              <Card className="p-6 border-border/50 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Community Support</h3>
                    <p className="text-foreground/70 text-sm">Help from other users</p>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm">Join our user community</p>
              </Card>

              <Card className="p-6 border-border/50 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Response Time</h3>
                    <p className="text-foreground/70 text-sm">We&apos;re quick to respond</p>
                  </div>
                </div>
                <p className="text-foreground/70 text-sm">Typically within 24 hours</p>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
              <Card className="p-8 border-border/50 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Send us a Message
                  </h2>
                  <p className="text-foreground/70">
                    Fill out the form below and we&apos;ll get back to you ASAP
                  </p>
                </div>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-slide-up">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-green-800 font-semibold">Message sent successfully!</p>
                        <p className="text-green-700 text-sm">We&apos;ll get back to you within 24 hours.</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-up">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <div>
                        <p className="text-red-800 font-semibold">Error sending message</p>
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-semibold text-foreground mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-foreground mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-border/50 bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-semibold text-foreground mb-2"
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-border/50 bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-semibold text-foreground mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-border/50 bg-white text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us more about your inquiry, project, or how we can help..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-full gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold py-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-foreground/70 mb-12">
            Quick answers to common questions
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <Card className="p-6 border-border/50 bg-white/80 backdrop-blur-sm">
              <h3 className="font-semibold text-foreground mb-2">How quickly do you respond?</h3>
              <p className="text-foreground/70 text-sm">We typically respond to all inquiries within 24 hours during business days.</p>
            </Card>
            
            <Card className="p-6 border-border/50 bg-white/80 backdrop-blur-sm">
              <h3 className="font-semibold text-foreground mb-2">Do you offer support for free trial users?</h3>
              <p className="text-foreground/70 text-sm">Yes! We provide full support to all users, including those on free trials.</p>
            </Card>
            
            <Card className="p-6 border-border/50 bg-white/80 backdrop-blur-sm">
              <h3 className="font-semibold text-foreground mb-2">Can I import my existing projects?</h3>
              <p className="text-foreground/70 text-sm">Currently, we support manual project creation. Bulk import features are coming soon!</p>
            </Card>
            
            <Card className="p-6 border-border/50 bg-white/80 backdrop-blur-sm">
              <h3 className="font-semibold text-foreground mb-2">Is there a mobile app?</h3>
              <p className="text-foreground/70 text-sm">Our web app works great on mobile browsers. Native mobile apps are planned for future releases.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 border-0 bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300">
            <h2 className="text-4xl font-bold mb-4 text-balance">
              Ready to Simplify Your Client Work?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto text-balance">
              Join freelancers and agencies who are already managing client projects more efficiently.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="gap-3 bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold px-8 py-3"
              >
                <Zap className="w-5 h-5" />
                Start Free Trial - 30 Days
              </Button>
            </Link>
            <div className="mt-4 pt-4 border-t border-blue-500/30">
              <p className="text-blue-200 text-sm">
                <strong>No credit card required</strong> • Cancel anytime • Setup in 2 minutes
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}