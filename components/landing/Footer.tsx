"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Demo", href: "/#demo" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "/terms#privacy-policy" },
    { label: "Terms", href: "/terms" },
    { label: "Refund", href: "/refund" },
    { label: "Contact", href: "/contact" },
  ],
};

const socials = [
  {
    name: "X",
    href: "https://twitter.com",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    ),
  },
];

const staggerParent = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-8 lg:gap-12">
            <motion.div variants={fadeUp} className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: "rgba(255,99,99,0.08)",
                    border: "1px solid rgba(255,99,99,0.15)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 480 480" fill="none">
                    <path
                      d="M240 0v120A120 120 0 0 1 120 0H0a240 240 0 0 0 240 240A240 240 0 0 0 0 480h120a120 120 0 0 1 120-120v120a240 240 0 1 0 0-480Z"
                      fill="#FF6363"
                    />
                  </svg>
                </div>
                <span
                  className="text-[15px] font-semibold text-[#f9f9f9]"
                  style={{ letterSpacing: "0px" }}
                >
                  TaskyAI
                </span>
              </div>
              <p
                className="text-[14px] leading-relaxed text-[#9c9c9d] max-w-[280px] mb-6"
                style={{ letterSpacing: "0.2px", lineHeight: "1.60" }}
              >
                AI task planner — brief to structured tasks in seconds.
              </p>
              <div className="flex items-center gap-3">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-9 w-9 rounded-lg text-[#6a6b6c] transition-all duration-200 hover:text-[#f9f9f9] hover:opacity-100"
                    style={{
                      background: "#101111",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </motion.div>

            {Object.entries(footerLinks).map(([category, links]) => (
              <motion.div key={category} variants={fadeUp}>
                <h4
                  className="text-[12px] font-semibold text-[#9c9c9d] uppercase tracking-[0.08em] mb-5"
                  style={{ letterSpacing: "0.08em" }}
                >
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] text-[#6a6b6c] transition-all duration-200 hover:text-[#f9f9f9]"
                        style={{ letterSpacing: "0.2px" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            className="mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p
              className="text-[12px] text-[#434345]"
              style={{ letterSpacing: "0.4px" }}
            >
              &copy; {new Date().getFullYear()} TaskyAI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms#privacy-policy"
                className="text-[12px] text-[#434345] transition-all duration-200 hover:text-[#9c9c9d]"
                style={{ letterSpacing: "0.4px" }}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[12px] text-[#434345] transition-all duration-200 hover:text-[#9c9c9d]"
                style={{ letterSpacing: "0.4px" }}
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="text-[12px] text-[#434345] transition-all duration-200 hover:text-[#9c9c9d]"
                style={{ letterSpacing: "0.4px" }}
              >
                Contact
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}