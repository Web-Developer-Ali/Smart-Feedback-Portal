import React from "react";

function footer() {
  return (
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
                  href="#features"
                  className="hover:text-blue-600 transition-colors duration-300"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-blue-600 transition-colors duration-300"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-600 transition-colors duration-300"
                >
                  Security
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
              </li>
              <li>
                <a
                  href="/contact"
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
                  href="/privacy"
                  className="hover:text-blue-600 transition-colors duration-300"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:text-blue-600 transition-colors duration-300"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/30 pt-8 flex flex-col items-center justify-center text-sm text-foreground/70 text-center">
          <p>&copy; 2025 ClientFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default footer;
