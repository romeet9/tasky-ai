"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface HighlightCardProps {
  title: string
  description: string[]
  icon: React.ReactNode
  className?: string
}

export default function HighlightCard({
  title,
  description,
  icon,
  className,
}: HighlightCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative rounded-xl p-8 overflow-hidden transition-all duration-500 ease-out",
        "border border-white/[0.06]",
        className
      )}
      style={{
        background: "var(--raycast-surface)",
        boxShadow:
          "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background:
            "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,99,99,0.06), transparent 40%)",
        }}
      />

      <div className="relative z-10">
        <div
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {icon}
        </div>

        <h3
          className="text-[22px] font-semibold text-[#f9f9f9] mb-3"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </h3>

        <div className="space-y-0.5">
          {description.map((line, i) => (
            <p
              key={i}
              className="text-[15px] leading-relaxed text-[#9c9c9d]"
              style={{ letterSpacing: "0.2px" }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
