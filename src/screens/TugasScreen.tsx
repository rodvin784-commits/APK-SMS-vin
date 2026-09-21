import { useEffect, useRef, useState } from 'react'
import { downloadJawaban, downloadLampiranTugas, fetchTugas, uploadPengumpulan } from '../lib/api'
import type { TugasItem } from '../lib/types'
import { mapErrorMessage } from '../lib/format'
import { cacheTugas, getCachedTugas } from '../lib/cache'
import Loading from '../components/ui/Loading'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import TugasCard from '../components/tugas/TugasCard'
import FotoPicker from '../components/tugas/FotoPicker'

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

  useEffect(() => {
    return () => {
      fotoPreviews.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [fotoPreviews])

  const bukaUrl = (url: string) => window.open(url, '_blank')

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
      const hasil = await uploadPengumpulan(tugasId, file, form.jawaban, form.catatan, (percent) => setUploadProgress(percent), fotoFiles)
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

  if (loading) return <Loading message="Memuat tugas..." />

  const filteredTugas = tugas.filter((t) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return t.judul.toLowerCase().includes(q) || (t.deskripsi ?? '').toLowerCase().includes(q) || t.mapel_nama.toLowerCase().includes(q) || t.guru_nama.toLowerCase().includes(q)
  })

  return (
    <div className="screen">
      {error && (
        <Alert variant="error" action={<Button variant="secondary" onClick={muat} style={{ marginLeft: '1rem' }}>Coba lagi</Button>}>
          {error}
        </Alert>
      )}
      {pesan && <Alert variant="success">{pesan}</Alert>}

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
          <TugasCard
            key={t.id}
            tugas={t}
            fotoUrls={tugasFotoUrls[t.id]}
            jawabanFotoUrls={t.pengumpulan ? jawabanFotoUrls[t.pengumpulan.id] : undefined}
            onUnduhLampiran={unduhLampiran}
            onUnduhJawaban={unduhJawaban}
            onLihatFotoTugas={lihatFotoTugas}
            onLihatFotoJawaban={lihatFotoJawaban}
            onBukaForm={bukaFormKumpul}
            renderForm={
              kumpulId === t.id
                ? () => (
                    <div className="form-kumpul">
                      <textarea placeholder="Tulis jawaban di sini…" value={form.jawaban} onChange={(e) => setForm((f) => ({ ...f, jawaban: e.target.value }))} rows={4} />
                      <span className="item-meta">File opsional — jawaban teks saja sudah cukup. Foto bisa ditambahkan di bawah.</span>
                      <input ref={(el) => { fileRefs.current[t.id] = el }} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" />
                      <FotoPicker files={fotoFiles} previews={fotoPreviews} onAdd={handleFotoChange} onRemove={hapusFoto} />
                      <textarea placeholder="Catatan (opsional)" value={form.catatan} onChange={(e) => setForm((f) => ({ ...f, catatan: e.target.value }))} rows={2} />
                      {uploadProgress !== null && (
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      )}
                      <Button disabled={kumpulLoading} onClick={() => submitKumpul(t.id)}>
                        {kumpulLoading ? `Mengunggah... ${uploadProgress ?? 0}%` : 'Kirim Jawaban'}
                      </Button>
                    </div>
                  )
                : undefined
            }
          />
        ))
      )}
    </div>
  )
}
