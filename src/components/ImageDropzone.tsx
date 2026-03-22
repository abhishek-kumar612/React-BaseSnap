import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { MAX_FILE_SIZE_LIMIT } from "@/utils/FileSize";

const MAX_FILE_SIZE = MAX_FILE_SIZE_LIMIT * 1024 * 1024;
const ACCEPTED_FORMATS = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

interface ImageDropzoneProps {
  onImageConverted: (
    base64: string,
    fileName: string,
    fileSize: number,
  ) => void;
}

export function ImageDropzone({ onImageConverted }: ImageDropzoneProps) {
  const [isConverting, setIsConverting] = useState(false);

  const convertToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert image"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const error = rejection.errors[0];

        if (error.code === "file-too-large") {
          toast.error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB`, {
            description: "Please choose a smaller image file.",
          });
        } else if (error.code === "file-invalid-type") {
          toast.error("Unsupported file format", {
            description: "Please use JPG, PNG, or WEBP files.",
          });
        } else {
          toast.error("Invalid file");
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setIsConverting(true);

        try {
          const base64 = await convertToBase64(file);
          onImageConverted(base64, file.name, file.size);
          toast.success("Image converted successfully", {
            description: "Your Base64 string is ready to copy.",
          });
        } catch {
          toast.error("Failed to convert image");
        } finally {
          setIsConverting(false);
        }
      }
    },
    [convertToBase64, onImageConverted],
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const rootProps = getRootProps();

  const getDropzoneStyles = () => {
    if (isDragReject) return "border-red-300 bg-red-50/80 shadow-red-100";
    if (isDragAccept)
      return "border-amber-400 bg-amber-50/80 shadow-amber-100 scale-[1.01]";
    if (isDragActive) return "border-amber-300 bg-amber-50/50";
    return "border-amber-200/60 bg-white hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-lg hover:shadow-amber-100/50";
  };

  return (
    <motion.div
      whileHover={{ scale: isConverting || isDragActive ? 1 : 1.005 }}
      whileTap={{ scale: 0.995 }}
      onClick={rootProps.onClick}
      onKeyDown={rootProps.onKeyDown}
      onFocus={rootProps.onFocus}
      onBlur={rootProps.onBlur}
      onDragEnter={rootProps.onDragEnter}
      onDragOver={rootProps.onDragOver}
      onDragLeave={rootProps.onDragLeave}
      onDrop={rootProps.onDrop}
      tabIndex={rootProps.tabIndex}
      role={rootProps.role}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed
        p-8 sm:p-12 transition-all duration-300 ease-out
        shadow-xl ${getDropzoneStyles()}
      `}
    >
      <input {...getInputProps()} />

      {/* Decorative corner elements */}
      <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-amber-300/50 rounded-tl" />
      <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-amber-300/50 rounded-tr" />
      <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-amber-300/50 rounded-bl" />
      <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-amber-300/50 rounded-br" />

      <AnimatePresence mode="wait">
        {isConverting ? (
          <motion.div
            key="converting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-6"
          >
            <div className="relative mb-5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="h-12 w-12 rounded-full border-[3px] border-amber-100 border-t-amber-500"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="h-4 w-4 rounded-full bg-amber-200"
                />
              </div>
            </div>
            <p className="text-base font-medium text-slate-700">
              Converting...
            </p>
            <p className="mt-1 text-sm text-slate-400">Just a moment</p>
          </motion.div>
        ) : isDragActive ? (
          <motion.div
            key="dragging"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-6"
          >
            {isDragAccept ? (
              <>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30"
                >
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </motion.div>
                <p className="text-lg font-semibold text-amber-600">
                  Drop to convert!
                </p>
                <p className="mt-1 text-sm text-amber-500/70">
                  Release to start
                </p>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 0] }}
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    repeatDelay: 0.3,
                  }}
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100"
                >
                  <svg
                    className="h-8 w-8 text-red-500"
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
                </motion.div>
                <p className="text-lg font-semibold text-red-500">
                  Invalid file
                </p>
                <p className="mt-1 text-sm text-red-400">JPG, PNG, WEBP only</p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-4"
          >
            {/* Upload Icon */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-100 to-orange-100"
            >
              <svg
                className="h-8 w-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </motion.div>

            {/* Text */}
            <p className="mb-1 text-lg font-semibold text-slate-700">
              Drop your image here
            </p>
            <p className="mb-5 text-sm text-slate-400">
              or{" "}
              <span className="text-amber-600 font-medium cursor-pointer hover:underline">
                click to browse
              </span>
            </p>

            {/* Format Tags */}
            <div className="flex gap-2">
              {["JPG", "PNG", "WEBP"].map((format, index) => (
                <motion.span
                  key={format}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  className="rounded-full bg-amber-100/80 px-3 py-1 text-xs font-medium text-amber-700"
                >
                  {format}
                </motion.span>
              ))}
            </div>

            {/* Size Limit */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-xs text-slate-400"
            >
              Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
