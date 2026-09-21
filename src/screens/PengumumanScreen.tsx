import { useEffect, useState } from 'react'
import { fetchPengumuman } from '../lib/api'
import type { PengumumanItem } from '../lib/types'
import { formatTanggal, mapErrorMessage } from '../lib/format'

export default function PengumumanScreen() {
  const [items, setItems] = useState<PengumumanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchPengumuman()
        setItems(data)
        setError(null)
      } catch (err) {
        setError(mapErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [muatUlang])

  const muat = () => {
    setLoading(true)
    setMuatUlang((k) => k + 1)
  }

  if (loading) return <div className="loading">Memuat pengumuman...</div>
  if (error) {
    return (
      <div className="screen">
        <div className="alert alert-error">{error}</div>
        <button className="btn-primary" onClick={muat}>Coba lagi</button>
      </div>
    )
  }

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
