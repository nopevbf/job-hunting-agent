"use client";

import React from "react";
import { X, Trash2, AlertTriangle, Loader2, Building2, MapPin } from "lucide-react";
import { JobPostData } from "@/lib/types";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  type: "SINGLE" | "ALL";
  job?: JobPostData | null;
  totalCount?: number;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  type,
  job,
  totalCount = 0,
  isLoading = false,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  const isSingle = type === "SINGLE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-base/40 backdrop-blur-sm animate-fadeIn">
      <div className="glass-modal rounded-bento-lg max-w-md w-full p-6 shadow-2xl relative border border-red-100/50">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-line-subtle mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-bento-sm bg-red-100 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-ink-base">
                {isSingle ? "Konfirmasi Hapus Lowongan" : "Bersihkan Semua Lowongan"}
              </h3>
              <p className="text-xs text-ink-muted">
                {isSingle ? "Penghapusan satu data lowongan" : "Penghapusan seluruh data lowongan"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-full text-ink-muted hover:text-ink-base hover:bg-white/80 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-3.5 py-1 text-xs">
          {isSingle && job ? (
            <div className="bg-canvas-base/80 p-3.5 rounded-bento-sm border border-line-subtle space-y-1.5">
              <h4 className="font-display font-bold text-sm text-ink-base line-clamp-1">
                {job.position}
              </h4>
              <div className="flex items-center gap-3 text-ink-muted text-xs">
                <span className="flex items-center gap-1 font-medium text-ink-base">
                  <Building2 className="w-3.5 h-3.5 text-sage-primary" />
                  {job.company}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sage-primary" />
                    {job.location}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-red-50/70 p-3.5 rounded-bento-sm border border-red-200/60 flex items-center justify-between">
              <div>
                <p className="font-semibold text-red-900 text-xs">Total data yang akan dihapus:</p>
                <p className="text-red-700/80 text-[11px] mt-0.5">Semua data riwayat dan peluang lowongan</p>
              </div>
              <span className="font-display font-extrabold text-lg text-red-600 bg-white/90 px-3 py-1 rounded-md border border-red-200 shadow-sm">
                {totalCount} item
              </span>
            </div>
          )}

          <p className="text-ink-muted leading-relaxed">
            {isSingle
              ? "Apakah Anda yakin ingin menghapus lowongan ini? Data akan dihapus secara permanen dari database."
              : "Apakah Anda yakin ingin membersihkan semua daftar lowongan? Tindakan ini permanen dan akan menghapus seluruh data lowongan dari database."}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-3 border-t border-line-subtle flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-bento-sm border border-line-subtle bg-white/70 hover:bg-white text-xs font-semibold text-ink-base transition disabled:opacity-50"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-bento-sm bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition shadow-sm hover:shadow flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSingle ? "Hapus Lowongan" : "Bersihkan Sekarang"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
