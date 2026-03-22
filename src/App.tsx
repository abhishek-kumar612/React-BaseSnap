import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "sonner";
import { ImageDropzone } from "./components/ImageDropzone";
import { ResultModal } from "./components/ResultModal";
import { MAX_FILE_SIZE_LIMIT } from "./utils/FileSize";

interface ConvertedImage {
  base64: string;
  fileName: string;
  fileSize: number;
}

function App() {
  const [convertedImage, setConvertedImage] = useState<ConvertedImage | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageConverted = (
    base64: string,
    fileName: string,
    fileSize: number,
  ) => {
    setConvertedImage({ base64, fileName, fileSize });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="h-screen bg-linear-to-br from-[#0a0a0f] via-[#111118] to-[#0d0d14] flex flex-col overflow-hidden">
      <Toaster
        richColors
        position="top-center"
        toastOptions={{
          style: {
            background: "#1a1a24",
            color: "#e2e2ea",
            border: "1px solid #2a2a3a",
            borderRadius: "14px",
            boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.5)",
            padding: "14px 18px",
            fontSize: "14px",
          },
        }}
      />

      {/* Header - Compact */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="pt-6 sm:pt-8 text-center shrink-0"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20"
          >
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-none tracking-tight text-white">
            BaseSnap
          </h1>
        </div>
        <p className="text-slate-400 text-md mt-4">
          Convert images to Base64 instantly
        </p>
      </motion.header>

      {/* Main Content - Fills remaining space */}
      <main className="flex-1 flex items-center justify-center min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-3xl"
        >
          <ImageDropzone onImageConverted={handleImageConverted} />
        </motion.div>
      </main>

      {/* Footer - Compact */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="py-3 text-center shrink-0"
      >
        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
          <span className="flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          </span>
          <span>
            Supports{" "}
            <span className="font-medium text-slate-400">JPG, PNG, WEBP</span> ·
            Max {MAX_FILE_SIZE_LIMIT}MB
          </span>
        </div>
      </motion.footer>

      {/* Result Modal */}
      <AnimatePresence>
        {isModalOpen && convertedImage && (
          <ResultModal
            base64={convertedImage.base64}
            fileName={convertedImage.fileName}
            fileSize={convertedImage.fileSize}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
