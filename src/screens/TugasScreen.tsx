import { useEffect, useRef, useState } from 'react'
import {
  downloadJawaban,
  downloadLampiranTugas,
  fetchTugas,
  uploadPengumpulan,
} from '../lib/api'
import type { TugasItem } from '../lib/types'
import { formatTanggal, statusLabel } from '../lib/format'

export default function TugasScreen() {
  const [tugas, setTugas] = useState<TugasItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pesan, setPesan] = useState<string | null>(null)
  const [kumpulId, setKumpulId] = useState<string | null>(null)
  const [catatan, setCatatan] = useState('')
  const [kumpulLoading, setKumpulLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const muat = () => {
    setLoading(true)
    setError(null)
    fetchTugas()
      .then(setTugas)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat tugas.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchTugas()
        setTugas(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memuat tugas.')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const bukaUrl = (url: string) => {
    window.open(url, '_blank')
  }

  const unduhLampiran = async (id: string) => {
    try {
      const { url } = await downloadLampiranTugas(id)
      bukaUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunduh lampiran.')
    }
  }

  const unduhJawaban = async (pengumpulanId: string) => {
    try {
      const { url } = await downloadJawaban(pengumpulanId)
      bukaUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunduh jawaban.')
    }
  }

  const submitKumpul = async (tugasId: string) => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setError('Pilih file jawaban terlebih dahulu.')
      return
    }
    setKumpulLoading(true)
    setError(null)
    try {
      const hasil = await uploadPengumpulan(tugasId, file, catatan)
      setPesan(hasil.message)
      setKumpulId(null)
      setCatatan('')
      if (fileRef.current) fileRef.current.value = ''
      muat()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah.')
    } finally {
      setKumpulLoading(false)
    }
  }

  if (loading) return <div className="loading">Memuat tugas...</div>

  return (
    <div className="screen">
      {error && <div className="alert alert-error">{error}</div>}
      {pesan && <div className="alert alert-success">{pesan}</div>}

      {tugas.length === 0 ? (
        <p className="kosong">Belum ada tugas untuk kelas Anda.</p>
      ) : (
        tugas.map((t) => (
          <div key={t.id} className="item-card">
            <div className="item-head">
              <strong>{t.judul}</strong>
              <span className={`badge ${t.pengumpulan ? 'badge-ok' : 'badge-warn'}`}>
                {statusLabel(t.pengumpulan?.status ?? null)}
              </span>
            </div>
            <span className="item-meta">{t.mapel_nama} · {t.guru_nama}</span>
            {t.deskripsi && <p className="item-desc">{t.deskripsi}</p>}
            <span className="item-meta">Deadline: <b>{formatTanggal(t.deadline)}</b></span>

            <div className="item-actions">
              {t.lampiran_url && (
                <button className="btn-secondary" onClick={() => unduhLampiran(t.id)}>
                  📎 Lampiran
                </button>
              )}
              {t.pengumpulan && (
                <button className="btn-secondary" onClick={() => unduhJawaban(t.pengumpulan!.id)}>
                  ⬇ Jawaban saya
                </button>
              )}
              {t.status === 'published' && (
                <button
                  className="btn-primary"
                  onClick={() => setKumpulId(kumpulId === t.id ? null : t.id)}
                >
                  {t.pengumpulan ? '🔁 Kumpul ulang' : '📤 Kumpulkan'}
                </button>
              )}
            </div>

            {kumpulId === t.id && (
              <div className="form-kumpul">
                <input ref={fileRef} type="file" />
                <textarea
                  placeholder="Catatan (opsional)"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={2}
                />
                <button
                  className="btn-primary"
                  disabled={kumpulLoading}
                  onClick={() => submitKumpul(t.id)}
                >
                  {kumpulLoading ? 'Mengunggah...' : 'Unggah Jawaban'}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
