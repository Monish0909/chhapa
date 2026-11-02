'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, ArrowLeft, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const BUCKET = 'product-images';
const MAX_IMAGES = 8;
const MAX_SOURCE_MB = 15;
const MAX_EDGE = 1600;

// Shrinks big phone photos before upload (keeps the site fast and storage small)
async function compress(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
  onBusyChange?: (busy: boolean) => void;
}

export default function ImageUploader({ images, onChange, onBusyChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const setBusy = (n: number) => {
    setUploading(n);
    onBusyChange?.(n > 0);
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    setError(null);
    const room = MAX_IMAGES - images.length;
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;
    if (room <= 0) {
      setError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    const picked = files.slice(0, room);
    if (files.length > room) setError(`Only ${MAX_IMAGES} images allowed — extra files were skipped.`);

    setBusy(picked.length);
    const uploaded: string[] = [];
    for (const file of picked) {
      if (file.size > MAX_SOURCE_MB * 1024 * 1024) {
        setError(`${file.name} is larger than ${MAX_SOURCE_MB} MB and was skipped.`);
        setUploading((n) => n - 1);
        continue;
      }
      const blob = await compress(file);
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
      if (upErr) {
        setError(
          upErr.message.toLowerCase().includes('bucket')
            ? 'Image storage is not set up yet. Run supabase/storage-setup.sql in Supabase.'
            : `Upload failed: ${upErr.message}`
        );
      } else {
        uploaded.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
      }
      setUploading((n) => n - 1);
    }
    onBusyChange?.(false);
    if (uploaded.length) onChange([...images, ...uploaded]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-lg border-2 border-dashed p-5 text-center transition-colors ${
          dragOver ? 'border-slate-500 bg-slate-100' : 'border-slate-300 bg-slate-50'
        }`}
      >
        <label className="cursor-pointer inline-flex items-center px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-sm font-medium shadow-sm">
          <Upload className="w-4 h-4 mr-2 text-slate-500" />
          <span>Choose images</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
        </label>
        <p className="text-xs text-slate-500 mt-2">
          Select several at once or drag them here · up to {MAX_IMAGES} photos · the first one is the cover
        </p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {(images.length > 0 || uploading > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((src, i) => (
            <div key={src + i} className="relative group">
              <div className="aspect-[3/4] rounded-lg overflow-hidden border border-slate-300 bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Product photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-slate-900 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full p-1"
                aria-label="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 inset-x-1 flex justify-between">
                <button
                  type="button"
                  disabled={i === 0}
                  onClick={() => move(i, i - 1)}
                  className="bg-white/90 disabled:opacity-30 rounded p-1"
                  aria-label="Move earlier"
                >
                  <ArrowLeft className="w-3 h-3 text-slate-800" />
                </button>
                <button
                  type="button"
                  disabled={i === images.length - 1}
                  onClick={() => move(i, i + 1)}
                  className="bg-white/90 disabled:opacity-30 rounded p-1"
                  aria-label="Move later"
                >
                  <ArrowRight className="w-3 h-3 text-slate-800" />
                </button>
              </div>
            </div>
          ))}
          {Array.from({ length: Math.max(0, uploading) }).map((_, i) => (
            <div
              key={`up-${i}`}
              className="aspect-[3/4] rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-[10px] mt-1">Uploading…</span>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && uploading === 0 && (
        <div className="flex items-center text-xs text-slate-400">
          <ImageIcon className="w-4 h-4 mr-1.5" /> No photos yet
        </div>
      )}
    </div>
  );
}
