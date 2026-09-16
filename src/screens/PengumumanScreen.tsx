import { useEffect, useState } from 'react'
import { fetchPengumuman } from '../lib/api'
import type { PengumumanItem } from '../lib/types'
import { formatTanggal } from '../lib/format'

export default function PengumumanScreen() {
  const [items, setItems] = useState<PengumumanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPengumuman()
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat pengumuman.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Memuat pengumuman...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="screen">
      {items.length === 0 ? (
        <p className="kosong">Belum ada pengumuman.</p>
      ) : (
        items.map((p) => (
          <div key={p.id} className="item-card">
            <div className="item-head">
              <strong>{p.judul}</strong>
            </div>
            <span className="item-meta">{p.guru_nama}</span>
            <p className="item-desc">{p.isi}</p>
            <small className="item-tanggal">{formatTanggal(p.created_at)}</small>
          </div>
        ))
      )}
    </div>
  )
}
