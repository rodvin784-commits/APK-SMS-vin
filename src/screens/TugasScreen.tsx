import { useEffect, useRef, useState } from 'react'
import {
  downloadJawaban,
  downloadLampiranTugas,
  fetchTugas,
  uploadPengumpulan,
} from '../lib/api'
import type { TugasItem } from '../lib/types'
import { formatTanggal, statusLabel, mapErrorMessage } from '../lib/format'
import { cacheTugas, getCachedTugas } from '../lib/cache'

export default function TugasScreen() {
  const [tugas, setTugas] = useState<TugasItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pesan, setPesan] = useState<string | null>(null)
  const [kumpulId, setKumpulId] = useState<string | null>(null)
  const [form, setForm] = useState({ jawaban: '', catatan: '' })
  const [kumpulLoading, setKumpulLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [fotoFiles, setFotoFiles] = useState<File[]>([])
  const [fotoPreviews, setFotoPreviews] = useState<string[]>([])
  const fotoInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const [tugasFotoUrls, setTugasFotoUrls] = useState<Record<string, string[]>>({})
  const [jawabanFotoUrls, setJawabanFotoUrls] = useState<Record<string, string[]>>({})
  const [searchQuery, setSearchQuery] = useState('')

  const muat = () => {
    setLoading(true)
    setError(null)
    fetchTugas()
      .then((data) => {
        setTugas(data)
        cacheTugas(data)
      })
      .catch((err) => {
        const cached = getCachedTugas()
        if (cached) {
          setTugas(cached)
          setError('Menampilkan data cache (offline). ' + mapErrorMessage(err))
        } else {
          setError(mapErrorMessage(err))
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    async function init() {
      const cached = getCachedTugas()
      if (cached) setTugas(cached)
      try {
        const data = await fetchTugas()
        setTugas(data)
        cacheTugas(data)
      } catch (err) {
        if (!cached) setError(mapErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // cleanup object URLs
  useEffect(() => {
    return () => {
      fotoPreviews.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [fotoPreviews])

  const bukaUrl = (url: string) => {
    window.open(url, '_blank')
  }

  const unduhLampiran = async (id: string) => {
    try {
      const { url } = await downloadLampiranTugas(id)
      bukaUrl(url)
    } catch (err) {
      setError(mapErrorMessage(err))
    }
  }

  const unduhJawaban = async (pengumpulanId: string) => {
    try {
      const { url } = await downloadJawaban(pengumpulanId)
      bukaUrl(url)
    } catch (err) {
      setError(mapErrorMessage(err))
    }
  }

  const lihatFotoTugas = async (t: TugasItem) => {
    if (tugasFotoUrls[t.id]) {
      // already loaded, just open first
      if (tugasFotoUrls[t.id][0]) bukaUrl(tugasFotoUrls[t.id][0])
      return
    }
    try {
      const res = await downloadLampiranTugas(t.id)
      const urls = (res as { foto_urls?: string[] }).foto_urls ?? []
      if (urls.length === 0) {
        setError('Tugas ini tidak memiliki foto.')
        return
      }
      setTugasFotoUrls((prev) => ({ ...prev, [t.id]: urls }))
    } catch (err) {
      setError(mapErrorMessage(err))
    }
  }

  const lihatFotoJawaban = async (pengumpulanId: string) => {
    if (jawabanFotoUrls[pengumpulanId]) {
      if (jawabanFotoUrls[pengumpulanId][0]) bukaUrl(jawabanFotoUrls[pengumpulanId][0])
      return
    }
    try {
      const res = await downloadJawaban(pengumpulanId)
      const urls = (res as { foto_urls?: string[] }).foto_urls ?? []
      if (urls.length === 0) {
        setError('Jawaban ini tidak memiliki foto.')
        return
      }
      setJawabanFotoUrls((prev) => ({ ...prev, [pengumpulanId]: urls }))
    } catch (err) {
      setError(mapErrorMessage(err))
    }
  }

  const handleFotoChange = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    const valid: File[] = []
    const newPreviews: string[] = []
    for (const f of arr) {
      if (!f.type.startsWith('image/')) continue
      if (f.size > 8 * 1024 * 1024) {
        setError(`Foto "${f.name}" melebihi 8MB.`)
        continue
      }
      if (fotoFiles.length + valid.length >= 5) {
        setError('Maksimal 5 foto per pengumpulan.')
        break
      }
      valid.push(f)
      newPreviews.push(URL.createObjectURL(f))
    }
    if (valid.length === 0) return
    setFotoFiles((prev) => [...prev, ...valid].slice(0, 5))
    setFotoPreviews((prev) => [...prev, ...newPreviews].slice(0, 5))
  }

  const hapusFoto = (idx: number) => {
    URL.revokeObjectURL(fotoPreviews[idx])
    setFotoFiles((prev) => prev.filter((_, i) => i !== idx))
    setFotoPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  const bukaFormKumpul = (t: TugasItem) => {
    if (kumpulId === t.id) {
      setKumpulId(null)
      return
    }
    setKumpulId(t.id)
    setForm({ jawaban: '', catatan: '' })
    setFotoFiles([])
    fotoPreviews.forEach((u) => URL.revokeObjectURL(u))
    setFotoPreviews([])
    if (fileRefs.current[t.id]) fileRefs.current[t.id]!.value = ''
    if (fotoInputRef.current) fotoInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  const submitKumpul = async (tugasId: string) => {
    const file = fileRefs.current[tugasId]?.files?.[0] ?? null
    const jawaban = form.jawaban.trim()
    if (!file && !jawaban && fotoFiles.length === 0) {
      setError('Isi jawaban teks, pilih file, atau tambahkan foto jawaban.')
      return
    }
    if (file && file.size > 15 * 1024 * 1024) {
      alert('Ukuran file maksimal 15MB')
      return
    }
    if (fotoFiles.length > 5) {
      setError('Maksimal 5 foto.')
      return
    }
    setKumpulLoading(true)
    setError(null)
    setUploadProgress(file || fotoFiles.length > 0 ? 0 : null)
    try {
      const hasil = await uploadPengumpulan(tugasId, file, form.jawaban, form.catatan, (percent) => {
        setUploadProgress(percent)
      }, fotoFiles)
      setPesan(hasil.message)
      setKumpulId(null)
      setForm({ jawaban: '', catatan: '' })
      setFotoFiles([])
      fotoPreviews.forEach((u) => URL.revokeObjectURL(u))
      setFotoPreviews([])
      if (fileRefs.current[tugasId]) fileRefs.current[tugasId]!.value = ''
      muat()
    } catch (err) {
      setError(mapErrorMessage(err))
    } finally {
      setKumpulLoading(false)
      setUploadProgress(null)
    }
  }

  if (loading) return <div className="loading">Memuat tugas...</div>

  const filteredTugas = tugas.filter((t) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return t.judul.toLowerCase().includes(q) || (t.deskripsi ?? '').toLowerCase().includes(q) || t.mapel_nama.toLowerCase().includes(q) || t.guru_nama.toLowerCase().includes(q)
  })

  return (
    <div className="screen">
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="btn-primary" onClick={muat} style={{ marginLeft: '1rem' }}>Coba lagi</button>
        </div>
      )}
      {pesan && <div className="alert alert-success">{pesan}</div>}

      <div style={{ marginBottom: '12px' }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari tugas, mapel, guru…"
          style={{ width: '100%', padding: '10px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', background: 'white' }}
        />
      </div>

      {filteredTugas.length === 0 ? (
        <p className="kosong">{tugas.length === 0 ? 'Belum ada tugas untuk kelas Anda.' : `Tidak ada hasil untuk "${searchQuery}"`}</p>
      ) : (
        filteredTugas.map((t) => (
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

            {t.foto_urls && t.foto_urls.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <button className="btn-secondary" onClick={() => lihatFotoTugas(t)} style={{ marginBottom: '0.4rem' }}>
                  🖼️ Lihat Foto Tugas ({t.foto_urls.length})
                </button>
                {tugasFotoUrls[t.id] && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' }}>
                    {tugasFotoUrls[t.id].map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`Foto tugas ${idx + 1}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {t.pengumpulan?.jawaban_teks && (
              <p className="item-desc" style={{ whiteSpace: 'pre-line' }}>
                <b>Jawaban saya:</b> {t.pengumpulan.jawaban_teks}
              </p>
            )}

            {t.pengumpulan?.foto_urls && t.pengumpulan.foto_urls.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <span className="item-meta">📷 Foto jawaban ({t.pengumpulan.foto_urls.length})</span>
                <button className="btn-secondary" onClick={() => lihatFotoJawaban(t.pengumpulan!.id)} style={{ marginLeft: '0.5rem' }}>
                  Lihat Foto
                </button>
                {jawabanFotoUrls[t.pengumpulan.id] && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginTop: '6px' }}>
                    {jawabanFotoUrls[t.pengumpulan.id].map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`Foto jawaban ${idx + 1}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {t.pengumpulan?.nilai !== null && t.pengumpulan?.nilai !== undefined && (
              <div style={{ marginTop: '0.6rem', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d' }}>Nilai: {t.pengumpulan.nilai}/100</span>
                {t.pengumpulan.status === 'dinilai' && <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '999px', background: '#16a34a', color: 'white', fontWeight: 700 }}>DINILAI</span>}
              </div>
            )}
            {t.pengumpulan?.feedback && (
              <p className="item-desc" style={{ marginTop: '0.4rem', padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '13px' }}>
                <b style={{ color: '#92400e' }}>Feedback guru:</b> {t.pengumpulan.feedback}
              </p>
            )}

            <div className="item-actions">
              {t.lampiran_url && (
                <button className="btn-secondary" onClick={() => unduhLampiran(t.id)}>
                  📎 Lampiran
                </button>
              )}
              {t.foto_urls && t.foto_urls.length > 0 && !t.lampiran_url && (
                <button className="btn-secondary" onClick={() => lihatFotoTugas(t)}>
                  🖼️ Foto
                </button>
              )}
              {t.pengumpulan?.nama_file && (
                <button className="btn-secondary" onClick={() => unduhJawaban(t.pengumpulan!.id)}>
                  ⬇ Jawaban saya
                </button>
              )}
              {t.pengumpulan?.foto_urls && t.pengumpulan.foto_urls.length > 0 && (
                <button className="btn-secondary" onClick={() => lihatFotoJawaban(t.pengumpulan!.id)}>
                  🖼️ Foto Jawaban
                </button>
              )}
              {t.status === 'published' && (
                <button
                  className="btn-primary"
                  onClick={() => bukaFormKumpul(t)}
                >
                  {t.pengumpulan ? '🔁 Kumpul ulang' : '📤 Kumpulkan'}
                </button>
              )}
            </div>

            {kumpulId === t.id && (
              <div className="form-kumpul">
                <textarea
                  placeholder="Tulis jawaban di sini…"
                  value={form.jawaban}
                  onChange={(e) => setForm((f) => ({ ...f, jawaban: e.target.value }))}
                  rows={4}
                />
                <span className="item-meta">File opsional — jawaban teks saja sudah cukup. Foto bisa ditambahkan di bawah.</span>
                <input
                  ref={(el) => { fileRefs.current[t.id] = el }}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                />
                <div style={{ marginTop: '0.6rem' }}>
                  <span className="item-meta">📷 Foto Jawaban (maks 5, 8MB/foto)</span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    <button type="button" className="btn-secondary" onClick={() => fotoInputRef.current?.click()}>
                      🖼️ Pilih Foto
                    </button>
                    <button type="button" className="btn-secondary" onClick={() => cameraInputRef.current?.click()}>
                      📷 Ambil Foto
                    </button>
                    {fotoFiles.length > 0 && <span className="item-meta" style={{ alignSelf: 'center' }}>{fotoFiles.length}/5</span>}
                  </div>
                  <input ref={fotoInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFotoChange(e.target.files)} style={{ display: 'none' }} />
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => handleFotoChange(e.target.files)} style={{ display: 'none' }} />
                  {fotoPreviews.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginTop: '8px' }}>
                      {fotoPreviews.map((src, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={src} alt={`Preview ${idx + 1}`} style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                          <button type="button" onClick={() => hapusFoto(idx)} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '22px', height: '22px', border: 'none', cursor: 'pointer' }}>×</button>
                          <div style={{ fontSize: '10px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fotoFiles[idx]?.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <textarea
                  placeholder="Catatan (opsional)"
                  value={form.catatan}
                  onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))}
                  rows={2}
                />
                {uploadProgress !== null && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
                <button
                  className="btn-primary"
                  disabled={kumpulLoading}
                  onClick={() => submitKumpul(t.id)}
                >
                  {kumpulLoading ? `Mengunggah... ${uploadProgress ?? 0}%` : 'Kirim Jawaban'}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
