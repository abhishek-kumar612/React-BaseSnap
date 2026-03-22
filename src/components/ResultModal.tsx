import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ResultModalProps {
  base64: string;
  fileName: string;
  fileSize: number;
  onClose: () => void;
}

export function ResultModal({
  base64,
  fileName,
  fileSize,
  onClose,
}: ResultModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Performance optimization: compute truncated preview once
  const { truncatedPreview, charCount, fileSizeKB } = useMemo(() => {
    const length = base64.length;
    // Show first 80 and last 40 characters for preview
    const preview =
      length > 150 ? `${base64.slice(0, 80)}...${base64.slice(-40)}` : base64;

    return {
      truncatedPreview: preview,
      charCount: length.toLocaleString(),
      fileSizeKB: (fileSize / 1024).toFixed(1),
    };
  }, [base64, fileSize]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(base64);
      setIsCopied(true);
      toast.success("Copied to clipboard!", {
        description: "Base64 string is ready to paste.",
      });
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [base64]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full rounded-2xl overflow-hidden max-w-2xl max-h-[90vh] bg-white shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-2 right-2 z-100 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm backdrop-blur transition-colors hover:bg-amber-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Image Preview Section */}
        <div className="relative bg-linear-to-br from-slate-100 to-slate-50 p-6 sm:p-8">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.3'%3E%3Ccircle cx='1' cy='1' r='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="relative flex items-center justify-center"
          >
            <img
              src={base64}
              alt={fileName}
              className="max-h-48 sm:max-h-56 rounded-xl object-contain shadow-lg shadow-slate-900/10"
            />
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8">
          {/* Success Header */}
          {/* <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-800">Conversion Complete</h3>
              <p className="text-sm text-slate-500 truncate" title={fileName}>{fileName}</p>
            </div>
          </div> */}

          {/* Stats */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Characters
              </p>
              <p className="mt-0.5 text-lg font-bold text-slate-700">
                {charCount}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Original Size
              </p>
              <p className="mt-0.5 text-lg font-bold text-slate-700">
                {fileSizeKB} KB
              </p>
            </div>
          </div>

          {/* Base64 Preview - Truncated for performance */}
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Base64 String
              </span>
              <span className="text-[10px] text-slate-400">Preview only</span>
            </div>
            <div className="rounded-lg bg-white border border-slate-100 p-3 overflow-hidden">
              <code className="block text-[11px] leading-relaxed text-slate-500 font-mono break-all">
                {truncatedPreview}
              </code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={copyToClipboard}
              className={`cursor-pointer flex-1 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition-all ${
                isCopied
                  ? "bg-emerald-500 text-white shadow-emerald-500/25"
                  : "bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25 hover:shadow-md hover:shadow-amber-500/30"
              }`}
            >
              {isCopied ? (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy Base64
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onClose}
              className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              New
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
