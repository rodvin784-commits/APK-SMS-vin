import { useEffect, useState } from 'react'
import { fetchNilai } from '../lib/api'
import type { NilaiItem } from '../lib/types'

export default function NilaiScreen() {
  const [nilai, setNilai] = useState<NilaiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNilai()
      .then(setNilai)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat nilai.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Memuat nilai...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="screen">
      {nilai.length === 0 ? (
        <p className="kosong">Belum ada nilai.</p>
      ) : (
        nilai.map((n) => (
          <div key={n.id} className="item-card">
            <div className="item-head">
              <strong>{n.mapel_nama}</strong>
              <span className="badge badge-ok">{n.nilai_akhir ?? '—'}</span>
            </div>
            <span className="item-meta">{n.guru_nama} · {n.semester} · {n.tahun_ajaran}</span>
            <div className="nilai-grid">
              <div><small>Tugas</small><b>{n.tugas ?? '—'}</b></div>
              <div><small>UTS</small><b>{n.uts ?? '—'}</b></div>
              <div><small>UAS</small><b>{n.uas ?? '—'}</b></div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
