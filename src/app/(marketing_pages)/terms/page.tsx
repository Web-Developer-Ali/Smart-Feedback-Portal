import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/marketing_page/footer/page";
import Navbar from "@/components/marketing_page/navbar/page";
import { Scale, AlertTriangle, Users, CreditCard, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service - WorkSpan | Legal Agreement",
  description: "WorkSpan's Terms of Service govern your use of our platform. Read our terms covering accounts, payments, intellectual property, and user responsibilities.",
  keywords: "terms of service, legal agreement, terms and conditions, WorkSpan terms, user agreement",
  robots: "index, follow",
};

export default function TermsOfServicePage() {
  const effectiveDate = "December 15, 2024";
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold border border-blue-200 mb-6">
            <Scale className="w-4 h-4" />
            Legal Agreement
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Effective Date: {effectiveDate}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg prose-blue max-w-none">
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
              <p className="text-foreground/80 mb-4">
                By accessing or using WorkSpan (&quot;the Platform&quot;), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
              </p>
            </div>

            {/* Quick Overview */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="p-6 border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-foreground">Account Responsibility</h3>
                </div>
                <p className="text-foreground/70 text-sm">
                  You are responsible for maintaining the security of your account and for all activities that occur under your account.
                </p>
              </Card>

              <Card className="p-6 border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-foreground">Payment Terms</h3>
                </div>
                <p className="text-foreground/70 text-sm">
                  Subscription fees are billed in advance. Cancel anytime - no long-term contracts required.
                </p>
              </Card>
            </div>

            {/* Accounts */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Accounts and Registration</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">2.1 Account Creation</h3>
              <p className="text-foreground/80 mb-4">
                To use WorkSpan, you must register for an account by providing your name, email address, and creating a password. You must provide accurate, complete, and updated registration information.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">2.2 Account Security</h3>
              <p className="text-foreground/80 mb-4">
                You are responsible for safeguarding your account password and for any activities or actions under your account. You must notify us immediately of any unauthorized use of your account.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">2.3 Age Requirement</h3>
              <p className="text-foreground/80">
                You must be at least 18 years old to use WorkSpan. By using the Platform, you represent and warrant that you are at least 18 years of age.
              </p>
            </div>

            {/* Services */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Services and Features</h2>
              <p className="text-foreground/80 mb-4">
                WorkSpan provides a platform for freelancers and agencies to manage client projects, collect feedback, and streamline project approvals. Our services include:
              </p>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li>Project management and organization tools</li>
                <li>Client feedback collection and management</li>
                <li>Project approval workflows</li>
                <li>Communication tools for client collaboration</li>
                <li>Analytics and reporting features</li>
              </ul>
            </div>

            {/* Payments and Billing */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Payments and Billing</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">4.1 Subscription Fees</h3>
              <p className="text-foreground/80 mb-4">
                WorkSpan offers both free and paid subscription plans. Paid subscription fees are billed in advance on a monthly or annual basis and are non-refundable.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">4.2 Free Trial</h3>
              <p className="text-foreground/80 mb-4">
                We may offer a free trial period for our paid services. At the end of the free trial period, you will be automatically charged unless you cancel before the trial ends.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">4.3 Cancellation</h3>
              <p className="text-foreground/80">
                You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing cycle, and you will retain access to paid features until that time.
              </p>
            </div>

            {/* User Content */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">5. User Content and Responsibilities</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">5.1 Your Content</h3>
              <p className="text-foreground/80 mb-4">
                You retain all rights to any content you submit, post, or display on or through WorkSpan. By submitting content, you grant us a worldwide, non-exclusive license to use, host, and display that content solely for providing our services.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">5.2 Content Standards</h3>
              <p className="text-foreground/80 mb-4">
                You agree not to post content that:
              </p>
              <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
                <li>Is illegal, fraudulent, or promotes illegal activities</li>
                <li>Infringes upon any third party&apos;s intellectual property rights</li>
                <li>Contains viruses, malware, or other malicious code</li>
                <li>Is harassing, defamatory, or otherwise objectionable</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">5.3 Client Data</h3>
              <p className="text-foreground/80">
                When you add client information to WorkSpan, you represent that you have the necessary rights and permissions to share that information with us for the purpose of providing our services.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">6.1 Our Intellectual Property</h3>
              <p className="text-foreground/80 mb-4">
                The WorkSpan platform, including its features, functionality, and content (excluding user content), is owned by WorkSpan and protected by copyright, trademark, and other laws.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">6.2 License to Use</h3>
              <p className="text-foreground/80">
                We grant you a limited, non-exclusive, non-transferable, and revocable license to use our services for your personal or internal business purposes, subject to these Terms.
              </p>
            </div>

            {/* Prohibited Activities */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Prohibited Activities</h2>
              <p className="text-foreground/80 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-foreground/80 space-y-2">
                <li>Use the Platform for any illegal purpose or in violation of any laws</li>
                <li>Harass, abuse, or harm another person</li>
                <li>Send spam or unauthorized commercial communications</li>
                <li>Interfere with or disrupt the Platform or servers</li>
                <li>Attempt to gain unauthorized access to any part of the Platform</li>
                <li>Reverse engineer, decompile, or disassemble any part of the Platform</li>
                <li>Use the Platform to compete with WorkSpan</li>
              </ul>
            </div>

            {/* Termination */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Termination</h2>
              <p className="text-foreground/80 mb-4">
                We may suspend or terminate your access to WorkSpan at any time for any reason, including if you violate these Terms. Upon termination, your right to use the Platform will immediately cease.
              </p>
            </div>

            {/* Disclaimer of Warranties */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">9. Disclaimer of Warranties</h2>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <p className="text-amber-800 font-semibold">Important Notice</p>
                </div>
                <p className="text-amber-700 text-sm">
                  THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">10. Limitation of Liability</h2>
              <p className="text-foreground/80 mb-4">
                TO THE FULLEST EXTENT PERMITTED BY LAW, WORKSPAN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
              </p>
            </div>

            {/* Indemnification */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">11. Indemnification</h2>
              <p className="text-foreground/80 mb-4">
                You agree to indemnify and hold harmless WorkSpan and its affiliates from any claims, damages, losses, liabilities, and expenses arising out of your use of the Platform or violation of these Terms.
              </p>
            </div>

            {/* Governing Law */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">12. Governing Law</h2>
              <p className="text-foreground/80 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">13. Changes to Terms</h2>
              <p className="text-foreground/80 mb-4">
                We reserve the right to modify these Terms at any time. If we make material changes, we will notify you by email or by posting a notice on our platform prior to the change becoming effective.
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-slate-50 p-8 rounded-lg border border-slate-200 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Questions About Our Terms?</h2>
              <p className="text-foreground/80 mb-6 max-w-2xl mx-auto">
                If you have any questions about these Terms of Service or need clarification on any section, our team is ready to help. Use our contact form to get in touch with us directly.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link href="/contact">
                  <MessageSquare className="w-5 h-5" />
                  Contact Our Team
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