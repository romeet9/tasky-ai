"use client";

import { motion } from "framer-motion";

export default function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full bg-[#07080a]">
      {/* Header skeleton */}
      <div
        className="flex items-center justify-end gap-1.5 px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* New Chat button skeleton */}
        <div
          className="h-8 w-24 rounded-full"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <motion.div
            className="h-full w-full rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        {/* Clear button skeleton */}
        <div
          className="h-8 w-16 rounded-full"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <motion.div
            className="h-full w-full rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          />
        </div>
        {/* History button skeleton */}
        <div
          className="h-7 w-7 rounded"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-4 py-6 sm:px-6 sm:py-8">
          {/* AI message skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-3.5 w-3.5 rounded"
                style={{ background: "rgba(255,99,99,0.15)" }}
              />
              <div
                className="h-3 w-16 rounded"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </div>
            <div className="space-y-2">
              <div
                className="h-4 rounded"
                style={{
                  width: "85%",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <motion.div
                  className="h-full rounded"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div
                className="h-4 rounded"
                style={{
                  width: "60%",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <motion.div
                  className="h-full rounded"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
                />
              </div>
            </div>
          </div>

          {/* User message skeleton */}
          <div className="mb-8 flex justify-end">
            <div className="space-y-2 max-w-[75%]">
              <div
                className="h-4 rounded"
                style={{
                  width: "100%",
                  background: "rgba(255,99,99,0.06)",
                }}
              >
                <motion.div
                  className="h-full rounded"
                  style={{ background: "rgba(255,99,99,0.08)" }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                />
              </div>
              <div
                className="h-4 rounded"
                style={{
                  width: "70%",
                  background: "rgba(255,99,99,0.06)",
                }}
              >
                <motion.div
                  className="h-full rounded"
                  style={{ background: "rgba(255,99,99,0.08)" }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.45 }}
                />
              </div>
            </div>
          </div>

          {/* Second AI message skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="h-3.5 w-3.5 rounded"
                style={{ background: "rgba(255,99,99,0.15)" }}
              />
              <div
                className="h-3 w-16 rounded"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </div>
            <div className="space-y-2">
              <div
                className="h-4 rounded"
                style={{
                  width: "75%",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                <motion.div
                  className="h-full rounded"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input area skeleton */}
      <div className="fixed bottom-12 left-0 right-0 sm:relative sm:bottom-0">
        <div className="mx-auto max-w-[720px] px-3 py-2 pb-4 sm:pb-2.5">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "#101111",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="h-12 px-4 py-3"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <motion.div
                className="h-full w-32 rounded"
                style={{ background: "rgba(255,255,255,0.04)" }}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-2.5">
              <div
                className="h-3 w-20 rounded"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
              <div
                className="h-7 w-14 rounded-md"
                style={{ background: "rgba(255,99,99,0.15)" }}
              />
            </div>
          </div>

          {/* Toolbar skeleton */}
          <div className="mt-2 flex items-center justify-between">
            <div
              className="h-8 w-20 rounded-full"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
            <div
              className="h-8 w-28 rounded-full"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
