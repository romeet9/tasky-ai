"use client";

import { motion } from "framer-motion";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";

export default function LiveDemo() {
  return (
    <section className="py-24 sm:py-32 relative" id="demo">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(85,179,255,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-16"
        >
          <span
            className="text-[13px] font-medium text-[#55b3ff] uppercase tracking-[0.1em]"
          >
            See it in action
          </span>
          <h2
            className="mt-4 text-[32px] sm:text-[40px] font-semibold leading-tight text-[#f9f9f9]"
            style={{ letterSpacing: "0.2px" }}
          >
            Watch AI task planning in action
          </h2>
          <p
            className="mt-4 text-[17px] text-[#9c9c9d] max-w-xl mx-auto"
            style={{ letterSpacing: "0.2px", lineHeight: "1.60" }}
          >
            See how Tasky turns an unstructured brief into organized tasks — in under two minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <HeroVideoDialog
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
            thumbnailSrc="/demo-preview.png"
            thumbnailAlt="Tasky AI demo — morning brief to structured tasks"
          />
        </motion.div>
      </div>
    </section>
  );
}
