"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown, Check, File, X, PushPin } from "@phosphor-icons/react";

const RAYCAST = {
  surface: "#101111",
  border: "rgba(255,255,255,0.06)",
  surfaceCard: "#1b1c1e",
  textPrimary: "#f9f9f9",
  textSecondary: "#cecece",
  textMuted: "#9c9c9d",
  textDim: "#6a6b6c",
  accent: "#55b3ff",
  danger: "#FF6363",
  borderDim: "#252829",
  shadowButton: "rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px -1px 0px 0px inset",
  shadowCard: "rgb(27, 28, 30) 0px 0px 0px 1px, rgb(7, 8, 10) 0px 0px 0px 1px inset",
};

const DETAIL_OPTIONS = [
  { value: "brief", label: "Brief", desc: "Minimal, 1-2 subtasks" },
  { value: "standard", label: "Standard", desc: "Title + description + 3-4 subtasks" },
  { value: "detailed", label: "Detailed", desc: "Full descriptions + effort estimates" },
  { value: "comprehensive", label: "Comprehensive", desc: "Everything + blockers + priorities" },
];

// Gemma 4 is the only available model for now — enforced server-side too.
const LOCKED_MODEL_LABEL = "Gemma 4";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  text: string;
}

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  isLoading: boolean;
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  detailLevel: string;
  onDetailLevelChange: (level: string) => void;
  model: string;
  onModelChange: (model: string) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

async function extractText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  if (file.type === "application/pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  }
  if (file.type.includes("spreadsheet") || file.type.includes("excel") || file.type === "text/csv") {
    const XLSX = await import("xlsx");
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    return workbook.SheetNames.map((name) => XLSX.utils.sheet_to_csv(workbook.Sheets[name])).join("\n");
  }
  if (file.type.includes("wordprocessing") || file.name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    return (await mammoth.extractRawText({ arrayBuffer })).value;
  }
  return "";
}

const btnStyle = {
  background: "transparent",
  boxShadow: RAYCAST.shadowButton,
  letterSpacing: "0.2px",
};

const dropdownStyle = {
  background: RAYCAST.surface,
  border: `1px solid ${RAYCAST.border}`,
  boxShadow: RAYCAST.shadowCard,
};

const dropdownAnimation = {
  initial: { opacity: 0, y: 8, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.96 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const },
};

function Dropdown({ value, options, onChange, open, setOpen }: {
  value: string;
  options: typeof DETAIL_OPTIONS;
  onChange: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) || options[0];
  const label = `Detail: ${current.label}`;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-[86px] px-3 py-1.5 text-[12px] font-medium text-[#9c9c9d]"
        style={btnStyle}
        whileHover={{ opacity: 0.6 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <CaretDown size={8} weight="regular" />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl overflow-hidden z-50" style={dropdownStyle} {...dropdownAnimation}>
            {options.map((opt, i) => (
              <motion.button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full text-left px-3.5 py-2.5 flex items-center gap-3"
                style={{ borderBottom: i < options.length - 1 ? `1px solid ${RAYCAST.border}` : "none" }}
                whileHover={{ opacity: 0.6 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="h-3 w-3 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: opt.value === value ? RAYCAST.accent : "transparent", border: opt.value === value ? "none" : `1px solid ${RAYCAST.borderDim}` }}
                  layout
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  {opt.value === value && <Check size={7} color={RAYCAST.surface} weight="regular" />}
                </motion.div>
                <div>
                  <div className="text-[13px] font-medium text-[#f9f9f9]" style={{ letterSpacing: "0.2px" }}>{opt.label}</div>
                  {"desc" in opt && <div className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>{opt.desc}</div>}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FileChip({ file, onRemove, index }: { file: UploadedFile; onRemove: (i: number) => void; index: number }) {
  return (
    <motion.div
      className="flex items-center gap-1.5 rounded-[86px] px-2.5 py-1 text-[11px] font-medium"
      style={{ background: RAYCAST.surfaceCard, color: RAYCAST.textSecondary, letterSpacing: "0px" }}
      initial={{ opacity: 0, scale: 0.8, x: -8 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, delay: index * 0.04 }}
      layout
    >
      <File size={9} color={RAYCAST.textMuted} weight="regular" />
      <span className="max-w-[90px] truncate">{file.name}</span>
      <span className="text-[#6a6b6c]">{formatSize(file.size)}</span>
      <motion.button onClick={() => onRemove(index)} className="text-[#6a6b6c] transition-colors hover:text-[#FF6363]" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
        <X size={7} weight="regular" />
      </motion.button>
    </motion.div>
  );
}

export default function ChatInput({
  input,
  onInputChange,
  onKeyDown,
  onSend,
  isLoading,
  uploadedFiles,
  onFilesChange,
  detailLevel,
  onDetailLevelChange,
}: ChatInputProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
  const MAX_FILES = 10;
  const MAX_SIZE = 15 * 1024 * 1024;

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setError("");
    if (uploadedFiles.length + files.length > MAX_FILES) { setError(`Maximum ${MAX_FILES} files allowed`); return; }
    const valid = files.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type) && !f.name.endsWith(".docx")) { setError("Only PDF, DOCX, XLSX, and CSV files are supported"); return false; }
      if (f.size > MAX_SIZE) { setError("Each file must be under 15MB"); return false; }
      return true;
    });
    if (!valid.length) return;
    setIsProcessing(true);
    const newFiles: UploadedFile[] = [];
    for (const file of valid) {
      try { newFiles.push({ name: file.name, size: file.size, type: file.type, text: await extractText(file) }); }
      catch { setError(`Failed to read ${file.name}`); }
    }
    onFilesChange([...uploadedFiles, ...newFiles]);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [uploadedFiles, onFilesChange]);

  const removeFile = useCallback((index: number) => {
    onFilesChange(uploadedFiles.filter((_, i) => i !== index));
  }, [uploadedFiles, onFilesChange]);

  return (
    <motion.div className="fixed bottom-16 left-0 right-0 sm:relative sm:bottom-0" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}>
      <div className="mx-auto max-w-[720px] px-3 py-2 pb-6 sm:pb-2.5">
        <motion.div className="rounded-lg" style={{ background: RAYCAST.surface, border: `1px solid rgba(255,255,255,0.08)`, boxShadow: RAYCAST.shadowCard }}>
          <div className="relative overflow-hidden rounded-t-lg">
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask Tasky AI to organize your tasks..."
              rows={1}
              className="w-full resize-none bg-transparent px-4 py-3 pr-12 text-[14px] leading-relaxed text-[#f9f9f9] placeholder:text-[#6a6b6c] focus:outline-none"
              style={{ letterSpacing: "0.2px", maxHeight: "160px" }}
            />
            <motion.button aria-label="Attach file" onClick={() => fileInputRef.current?.click()} className="absolute top-3 right-3 flex items-center justify-center h-8 w-8 rounded-full" style={btnStyle} whileHover={{ opacity: 0.6 }} whileTap={{ scale: 0.9 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              <PushPin size={14} color={RAYCAST.textMuted} weight="regular" />
            </motion.button>
            <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
          </div>

          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div className="flex flex-wrap gap-1.5 px-3" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
                {uploadedFiles.map((file, i) => <FileChip key={file.name + i} file={file} onRemove={removeFile} index={i} />)}
              </motion.div>
            )}
          </AnimatePresence>

          {error && <motion.div className="text-[11px] text-[#FF6363] px-3" style={{ letterSpacing: "0.2px" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}
          {isProcessing && (
            <motion.div className="flex items-center gap-1.5 px-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="h-2 w-2 rounded-full border border-[#55b3ff] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
              <span className="text-[11px] text-[#6a6b6c]" style={{ letterSpacing: "0.2px" }}>Processing files...</span>
            </motion.div>
          )}

          <div className="flex items-center justify-between px-3 py-2.5">
            <motion.div className="flex items-center gap-2" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}>
              <div className="flex items-center gap-1.5 rounded-[86px] px-3 py-1.5 text-[12px] font-medium text-[#9c9c9d]" style={btnStyle}>
                {LOCKED_MODEL_LABEL}
              </div>
              <Dropdown value={detailLevel} options={DETAIL_OPTIONS} onChange={onDetailLevelChange} open={detailOpen} setOpen={setDetailOpen} />
            </motion.div>
            <motion.button onClick={onSend} disabled={!input.trim() || isLoading} className="rounded-md px-3 py-1.5 text-[12px] font-medium text-[#f9f9f9] disabled:opacity-30 disabled:cursor-not-allowed shrink-0" style={{ background: RAYCAST.danger, letterSpacing: "0.05px" }} whileHover={{ scale: 1.03, opacity: 0.85 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
              Send
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}