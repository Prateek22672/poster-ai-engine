'use client';

import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowUp, Paperclip, X, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Tailored prompt input for PosterAI: a premium glassy box with an autosizing
 * textarea, reference-image upload (drag/paste/click), preview, and a send button.
 * (Chat-only features like Search/Think/Canvas toggles and voice were removed —
 *  they don't apply to poster generation and would corrupt the prompt.)
 */

/* ── Tooltip ────────────────────────────────────────────────────── */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-lg border border-white/10 bg-ink px-2.5 py-1.5 text-xs text-white/80 shadow-xl',
      'animate-in fade-in-0 zoom-in-95',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = 'TooltipContent';

/* ── Image preview dialog ───────────────────────────────────────── */
function ImageViewDialog({ imageUrl, onClose }: { imageUrl: string | null; onClose: () => void }) {
  if (!imageUrl) return null;
  return (
    <DialogPrimitive.Root open={!!imageUrl} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[90vw] md:max-w-[700px] -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95">
          <DialogPrimitive.Title className="sr-only">Image preview</DialogPrimitive.Title>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-ink shadow-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="preview" className="w-full max-h-[80vh] object-contain" />
            <DialogPrimitive.Close className="absolute right-3 top-3 rounded-full bg-white/5 border border-white/10 p-2 hover:bg-white/10">
              <X className="h-4 w-4 text-white/70" />
            </DialogPrimitive.Close>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
interface PromptInputBoxProps {
  value?: string;
  onValueChange?: (v: string) => void;
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function PromptInputBox({
  value,
  onValueChange,
  onSend = () => {},
  isLoading = false,
  placeholder = 'Describe your poster…',
  className,
}: PromptInputBoxProps) {
  const [internal, setInternal] = React.useState('');
  const input = value ?? internal;
  const setInput = onValueChange ?? setInternal;

  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const uploadRef = React.useRef<HTMLInputElement>(null);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  // autosize
  React.useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 220)}px`;
  }, [input]);

  const isImage = (f: File) => f.type.startsWith('image/');
  const processFile = React.useCallback((file: File) => {
    if (!isImage(file) || file.size > 10 * 1024 * 1024) return;
    setFiles([file]);
    const reader = new FileReader();
    reader.onload = (e) => setPreviews({ [file.name]: e.target?.result as string });
    reader.readAsDataURL(file);
  }, []);

  // paste image
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.includes('image')) {
          const f = items[i].getAsFile();
          if (f) { e.preventDefault(); processFile(f); break; }
        }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [processFile]);

  const hasContent = input.trim() !== '' || files.length > 0;

  function submit() {
    if (!hasContent || isLoading) return;
    onSend(input, files);
    setInput('');
    setFiles([]);
    setPreviews({});
  }

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault(); e.stopPropagation();
          const img = Array.from(e.dataTransfer.files).find(isImage);
          if (img) processFile(img);
        }}
        className={cn(
          'rounded-3xl border border-white/[0.14] bg-ink backdrop-blur-xl p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300',
          'focus-within:border-white focus-within:shadow-[0_0_40px_rgba(99,102,241,0.15)]',
          isLoading && 'border-indigo-500/50',
          className
        )}
      >
        {/* file previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-1.5">
            {files.map((file) => (
              previews[file.name] && (
                <div
                  key={file.name}
                  className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-white/25"
                  onClick={() => setSelectedImage(previews[file.name])}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previews[file.name]} alt={file.name} className="h-full w-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setFiles([]); setPreviews({}); }}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              )
            ))}
          </div>
        )}

        <textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none min-h-[44px] disabled:opacity-60"
        />

        <div className="flex items-center justify-between pt-1.5">
          {/* upload */}
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <button
                onClick={() => uploadRef.current?.click()}
                disabled={isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors"
              >
                <Paperclip className="h-5 w-5" />
                <input
                  ref={uploadRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = ''; }}
                />
              </button>
            </TooltipPrimitive.Trigger>
            <TooltipContent side="top">Attach a reference image</TooltipContent>
          </TooltipPrimitive.Root>

          {/* send */}
          <button
            onClick={submit}
            disabled={!hasContent && !isLoading}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200',
              isLoading
                ? 'bg-white/5 text-white/60'
                : hasContent
                ? 'bg-white text-black shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:from-indigo-400 hover:to-violet-500'
                : 'bg-white/5 text-white/30'
            )}
          >
            {isLoading ? <Square className="h-3.5 w-3.5 fill-white/70 animate-pulse" /> : <ArrowUp className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <ImageViewDialog imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
    </TooltipPrimitive.Provider>
  );
}

export default PromptInputBox;
