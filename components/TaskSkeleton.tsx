"use client";

import { motion } from "framer-motion";

export default function TaskSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 sm:px-6 py-4">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-xl p-4 sm:p-5"
          style={{
            background: "#101111",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-start gap-3">
            {/* Status circle */}
            <div
              className="mt-0.5 h-7 w-7 shrink-0 rounded-full sm:mt-1 sm:h-6 sm:w-6"
              style={{
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <motion.div
                className="h-full w-full rounded-full"
                style={{ background: "rgba(255,255,255,0.06)" }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="flex-1">
              {/* Title */}
              <div
                className="h-5 rounded sm:h-6"
                style={{
                  width: "60%",
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

              {/* Description */}
              <div
                className="mt-2 h-3 rounded sm:mt-2.5"
                style={{
                  width: "40%",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <motion.div
                  className="h-full rounded"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                />
              </div>

              {/* Badges */}
              <div className="mt-3 flex items-center gap-2">
                <div
                  className="h-5 w-20 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  />
                </div>
                <div
                  className="h-5 w-14 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
