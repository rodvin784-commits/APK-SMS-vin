import { useEffect, useState } from 'react'
import { fetchNilai } from '../lib/api'
import type { NilaiItem } from '../lib/types'
import { mapErrorMessage } from '../lib/format'

export default function NilaiScreen() {
  const [nilai, setNilai] = useState<NilaiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchNilai()
        setNilai(data)
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

  if (loading) return <div className="loading">Memuat nilai...</div>
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
