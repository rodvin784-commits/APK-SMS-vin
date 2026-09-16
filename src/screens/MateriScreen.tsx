import { useEffect, useState } from 'react'
import { downloadMateri, fetchMateri } from '../lib/api'
import type { MateriItem } from '../lib/types'
import { formatTanggal } from '../lib/format'

export default function MateriScreen() {
  const [materi, setMateri] = useState<MateriItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMateri()
      .then(setMateri)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat materi.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Memuat materi...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="screen">
      {materi.length === 0 ? (
        <p className="kosong">Belum ada materi.</p>
      ) : (
        materi.map((m) => (
          <div key={m.id} className="item-card">
            <div className="item-head">
              <strong>{m.judul}</strong>
            </div>
            <span className="item-meta">{m.mapel_nama} · {m.guru_nama}</span>
            {m.deskripsi && <p className="item-desc">{m.deskripsi}</p>}
            <div className="item-actions">
              {m.file_url ? (
                <button
                  className="btn-secondary"
                  onClick={async () => {
                    try {
                      const { url } = await downloadMateri(m.id)
                      window.open(url, '_blank')
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Gagal mengunduh materi.')
                    }
                  }}
                >
                  ⬇ {m.nama_file ?? 'Unduh file'}
                </button>
              ) : (
                <span className="item-meta">Tanpa file</span>
              )}
              <small className="item-tanggal">{formatTanggal(m.created_at)}</small>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
