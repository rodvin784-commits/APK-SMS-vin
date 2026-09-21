import { useEffect, useState } from 'react'
import { fetchNotifikasi, tandaiNotifikasiDibaca } from '../lib/api'
import type { NotifikasiItem } from '../lib/types'
import { formatTanggalJam, mapErrorMessage } from '../lib/format'

interface Props {
  onCountChange?: (count: number) => void
}

export default function NotifikasiScreen({ onCountChange }: Props) {
  const [items, setItems] = useState<NotifikasiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [muatUlang, setMuatUlang] = useState(0)

  useEffect(() => {
    async function init() {
      try {
        const { items, belumDibaca } = await fetchNotifikasi()
        setItems(items)
        setError(null)
        onCountChange?.(belumDibaca)
      } catch (err) {
        setError(mapErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [onCountChange, muatUlang])

  const muat = () => {
    setLoading(true)
    setMuatUlang((k) => k + 1)
  }

  const tandaiSemua = async () => {
    const belum = items.filter((n) => !n.is_read).map((n) => n.id)
    if (belum.length === 0) return
    try {
      await tandaiNotifikasiDibaca(belum)
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
      onCountChange?.(0)
    } catch (err) {
      setError(mapErrorMessage(err))
    }
  }

  if (loading) return <div className="loading">Memuat notifikasi...</div>

  return (
    <div className="screen">
      <div className="screen-toolbar">
        <span className="item-meta">
          {items.filter((n) => !n.is_read).length} belum dibaca
        </span>
        <button className="btn-secondary" onClick={tandaiSemua}>
          ✓ Tandai semua
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn-primary" onClick={muat} style={{ marginLeft: '1rem' }}>Coba lagi</button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="kosong">Belum ada notifikasi.</p>
      ) : (
        items.map((n) => (
          <div key={n.id} className={`item-card ${n.is_read ? 'notif-read' : 'notif-unread'}`}>
            <div className="item-head">
              <strong>{n.judul}</strong>
              {!n.is_read && <span className="badge badge-warn">Baru</span>}
            </div>
            {n.pesan && <p className="item-desc">{n.pesan}</p>}
            <small className="item-tanggal">{formatTanggalJam(n.created_at)}</small>
          </div>
        ))
      )}
    </div>
  )
}
