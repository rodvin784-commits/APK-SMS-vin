import { useEffect, useState } from 'react'
import { fetchNotifikasi, tandaiNotifikasiDibaca } from '../lib/api'
import type { NotifikasiItem } from '../lib/types'
import { formatTanggalJam } from '../lib/format'

export default function NotifikasiScreen() {
  const [items, setItems] = useState<NotifikasiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      try {
        const { items } = await fetchNotifikasi()
        setItems(items)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat notifikasi.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const tandaiSemua = async () => {
    const belum = items.filter((n) => !n.is_read).map((n) => n.id)
    if (belum.length === 0) return
    try {
      await tandaiNotifikasiDibaca(belum)
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menandai notifikasi.')
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

      {error && <div className="alert alert-error">{error}</div>}

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
