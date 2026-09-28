/**
 * MateriCard — Kartu satu materi (dipakai di BelajarScreen).
 * Unduh file via signed URL; error dilaporkan ke induk via onError.
 */
import { useState } from 'react'
import { Download, FileText } from 'lucide-react'
import type { MateriItem } from '../../lib/types'
import { downloadMateri } from '../../lib/api'
import { formatTanggal, mapErrorMessage } from '../../lib/format'

interface Props {
  m: MateriItem
  onError: (msg: string) => void
}

export default function MateriCard({ m, onError }: Props) {
  const [busy, setBusy] = useState(false)

  const unduh = async () => {
    setBusy(true)
    try {
      const { url } = await downloadMateri(m.id)
      window.open(url, '_blank')
    } catch (err) {
      onError(mapErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600" aria-hidden>
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold leading-snug text-slate-800">{m.judul}</h3>
          <p className="mt-0.5 truncate text-xs text-slate-500">{m.guru_nama} • {formatTanggal(m.created_at)}</p>
          {m.deskripsi && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-slate-600">{m.deskripsi}</p>}
        </div>
      </div>
      {m.file_url ? (
        <button
          onClick={unduh}
          disabled={busy}
          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden />
          {busy ? 'Menyiapkan…' : (m.nama_file ?? 'Unduh file')}
        </button>
      ) : (
        <p className="mt-3 text-xs text-slate-400">Tanpa file lampiran</p>
      )}
    </article>
  )
}
