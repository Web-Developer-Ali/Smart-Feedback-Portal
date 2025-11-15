import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/marketing_page/footer/page";
import Navbar from "@/components/marketing_page/navbar/page";
import { Shield, Lock, Database, UserCheck, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy - WorkSpan | Data Protection & Security",
  description: "WorkSpan's Privacy Policy explains how we collect, use, and protect your data. Learn about our commitment to your privacy and data security.",
  keywords: "privacy policy, data protection, GDPR, data security, privacy terms, WorkSpan privacy",
  robots: "index, follow",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 15, 2024";
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200 mb-6">
            <Shield className="w-4 h-4" />
            Your Privacy Matters
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg prose-blue max-w-none">
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
              <p className="text-foreground/80 mb-4">
                At WorkSpan, we take your privacy seriously. This Privacy Policy explains how WorkSpan (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) collects, uses, discloses, and safeguards your information when you use our client management platform and related services.
              </p>
              <p className="text-foreground/80">
                By using WorkSpan, you consent to the data practices described in this policy. If you do not agree with the data practices described in this Privacy Policy, you should not use our services.
              </p>
            </div>

            {/* Quick Overview Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-border/50 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Data Collection</h3>
                <p className="text-foreground/70 text-sm">
                  We only collect data necessary to provide and improve our services
                </p>
              </Card>

              <Card className="p-6 border-border/50 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Data Protection</h3>
                <p className="text-foreground/70 text-sm">
                  Enterprise-grade security measures to protect your information
                </p>
              </Card>

              <Card className="p-6 border-border/50 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Your Control</h3>
                <p className="text-foreground/70 text-sm">
                  You have full control over your data and privacy settings
                </p>
              </Card>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">Personal Information</h3>
              <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-6">
                <li>Account information (name, email address, password)</li>
                <li>Profile information (company name, profile picture)</li>
                <li>Billing information (payment details, billing address)</li>
                <li>Communication data (emails, support tickets)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Usage Information</h3>
              <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-6">
                <li>Log data (IP address, browser type, access times)</li>
                <li>Device information (operating system, device type)</li>
                <li>Usage patterns (features used, time spent on platform)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">Client Project Data</h3>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li>Project details and descriptions</li>
                <li>Client information (name, email, company)</li>
                <li>Feedback and review data</li>
                <li>Communication history with clients</li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li>To provide and maintain our services</li>
                <li>To process your transactions and send related information</li>
                <li>To send administrative information (updates, security alerts)</li>
                <li>To personalize your experience and provide content recommendations</li>
                <li>To analyze usage patterns and improve our services</li>
                <li>To prevent fraud and enhance security</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            {/* Data Sharing and Disclosure */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Sharing and Disclosure</h2>
              <p className="text-foreground/80 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share information with:
              </p>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
              <p className="text-foreground/80 mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Security Measures Include:</strong> Encryption in transit and at rest, regular security assessments, access controls, and secure data centers.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Data Protection Rights</h2>
              <p className="text-foreground/80 mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li><strong>Access:</strong> Request copies of your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Restriction:</strong> Request limitation of processing</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Objection:</strong> Object to our processing of your data</li>
              </ul>
            </div>

            {/* Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Cookies and Tracking</h2>
              <p className="text-foreground/80 mb-4">
                We use cookies and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </div>

            {/* International Transfers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">International Data Transfers</h2>
              <p className="text-foreground/80 mb-4">
                Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Children&apos;s Privacy</h2>
              <p className="text-foreground/80">
                Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18.
              </p>
            </div>

            {/* Changes to Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Changes to This Privacy Policy</h2>
              <p className="text-foreground/80 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-50 p-8 rounded-lg border border-slate-200 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Questions About Our Privacy Policy?</h2>
              <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">
                We&apos;re here to help! If you have any questions about how we handle your data or our privacy practices, please don&apos;t hesitate to reach out through our contact form.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link href="/contact">
                  <MessageSquare className="w-5 h-5" />
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}