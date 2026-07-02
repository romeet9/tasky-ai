"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown, Check, File, X } from "@phosphor-icons/react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  text: string;
}

interface ChatToolbarProps {
  uploadedFiles: UploadedFile[];
  onFileRemove: (index: number) => void;
  isProcessingFiles: boolean;
  fileError: string;
  detailLevel: string;
  onDetailLevelChange: (level: string) => void;
  model: string;
  onModelChange: (model: string) => void;
}

const DETAIL_OPTIONS = [
  { value: "brief", label: "Brief", desc: "Minimal, 1-2 subtasks" },
  { value: "standard", label: "Standard", desc: "Title + description + 3-4 subtasks" },
  { value: "detailed", label: "Detailed", desc: "Full descriptions + effort estimates" },
  { value: "comprehensive", label: "Comprehensive", desc: "Everything + blockers + priorities" },
];

const MODEL_OPTIONS = [
  { value: "groq", label: "Groq", desc: "Llama 3.3 70B — Fast & accurate" },
  { value: "ollama", label: "Gemma 4", desc: "31B — Google's latest model" },
];

export default function ChatToolbar({
  uploadedFiles,
  onFileRemove,
  isProcessingFiles,
  fileError,
  detailLevel,
  onDetailLevelChange,
  model,
  onModelChange,
}: ChatToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const currentDetail = DETAIL_OPTIONS.find((o) => o.value === detailLevel) || DETAIL_OPTIONS[1];
  const currentModel = MODEL_OPTIONS.find((o) => o.value === model) || MODEL_OPTIONS[0];

  return (
    <div>
      {/* File chips */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-1.5 mb-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {uploadedFiles.map((file, i) => (
              <motion.div
                key={file.name + i}
                className="flex items-center gap-1.5 rounded-[86px] px-2.5 py-1 text-[11px] font-medium"
                style={{
                  background: "#1b1c1e",
                  color: "#cecece",
                  letterSpacing: "0px",
                }}
                initial={{ opacity: 0, scale: 0.8, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -8 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  delay: i * 0.04,
                }}
                layout
              >
                <File size={9} color="#9c9c9d" weight="regular" />
                <span className="max-w-[90px] truncate">{file.name}</span>
                <span className="text-[#6a6b6c]">{formatSize(file.size)}</span>
                <motion.button
                  onClick={() => onFileRemove(i)}
                  className="text-[#6a6b6c] transition-colors hover:text-[#FF6363]"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={7} weight="regular" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {fileError && (
        <motion.div
          className="text-[11px] text-[#FF6363] mb-1.5"
          style={{ letterSpacing: "0.2px" }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {fileError}
        </motion.div>
      )}

      {isProcessingFiles && (
        <motion.div
          className="flex items-center gap-1.5 mb-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="h-2 w-2 rounded-full border border-[#55b3ff] border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
            Processing files...
          </span>
        </motion.div>
      )}

      {/* Toolbar row */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Model selector */}
        <div className="relative" ref={modelDropdownRef}>
          <motion.button
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            className="flex items-center gap-1.5 rounded-[86px] px-3 py-1.5 text-[12px] font-medium text-[#9c9c9d]"
            style={{
              background: "transparent",
              boxShadow: "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset",
              letterSpacing: "0.2px",
            }}
            whileHover={{ opacity: 0.6 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <CaretDown size={12} weight="regular" />
            {currentModel.label}
            <motion.span animate={{ rotate: modelDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <CaretDown size={8} weight="regular" />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {modelDropdownOpen && (
              <motion.div
                className="absolute bottom-full left-0 mb-2 w-56 rounded-xl overflow-hidden z-50"
                style={{
                  background: "#101111",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
                }}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {MODEL_OPTIONS.map((opt, i) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => {
                      onModelChange(opt.value);
                      setModelDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center gap-3"
                    style={{
                      borderBottom: i < MODEL_OPTIONS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                    whileHover={{ opacity: 0.6 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="h-3 w-3 rounded-full shrink-0 flex items-center justify-center"
                      style={{
                        background: opt.value === model ? "#55b3ff" : "transparent",
                        border: opt.value === model ? "none" : "1px solid #252829",
                      }}
                      layout
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {opt.value === model && <Check size={7} color="#07080a" weight="regular" />}
                    </motion.div>
                    <div>
                      <div className="text-[13px] font-medium text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
                        {opt.desc}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detail level dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 rounded-[86px] px-3 py-1.5 text-[12px] font-medium text-[#9c9c9d]"
            style={{
              background: "transparent",
              boxShadow: "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset",
              letterSpacing: "0.2px",
            }}
            whileHover={{ opacity: 0.6 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Detail: {currentDetail.label}
            <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <CaretDown size={8} weight="regular" />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                className="absolute bottom-full left-0 mb-2 w-60 rounded-xl overflow-hidden z-50"
                style={{
                  background: "#101111",
                  border: "1px solid rgba(255,255,255,0.06)",
                  boxShadow: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
                }}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {DETAIL_OPTIONS.map((opt, i) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => {
                      onDetailLevelChange(opt.value);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 flex items-center gap-3"
                    style={{
                      borderBottom: i < DETAIL_OPTIONS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                    whileHover={{ opacity: 0.6 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="h-3 w-3 rounded-full shrink-0 flex items-center justify-center"
                      style={{
                        background: opt.value === detailLevel ? "#55b3ff" : "transparent",
                        border: opt.value === detailLevel ? "none" : "1px solid #252829",
                      }}
                      layout
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      {opt.value === detailLevel && <Check size={7} color="#07080a" weight="regular" />}
                    </motion.div>
                    <div>
                      <div className="text-[13px] font-medium text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>
                        {opt.label}
                      </div>
                      <div className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>
                        {opt.desc}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
