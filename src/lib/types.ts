// Tipe data API siswa (mencerminkan respons /api/siswa/* di project-tim-vin-vines).

export interface KelasInfo {
  id?: string
  nama_kelas: string | null
  tingkat: number | null
  tahun_ajaran: string | null
}

export interface Me {
  siswa: { id: string; nama_lengkap: string | null; nis: string | null }
  kelas: KelasInfo
}

export interface DashboardData {
  kelas: { nama_kelas: string | null; tingkat: number | null; tahun_ajaran: string | null }
  counts: {
    tugas: number
    materi: number
    video: number
    pengumuman: number
    nilai: number
    notifikasi_belum_dibaca: number
  }
  jadwal_hari_ini: JadwalItem[]
  tugas_terbaru: TugasItem[]
  pengumuman_terbaru: PengumumanItem[]
}

export interface TugasItem {
  id: string
  judul: string
  deskripsi: string | null
  tanggal_mulai: string
  deadline: string
  lampiran_url: string | null
  foto_urls: string[] | null
  status: string
  created_at: string
  guru_nama: string
  mapel_nama: string
  mapel_kode: string
  pengumpulan: {
    id: string
    status: string | null
    nama_file: string | null
    foto_urls: string[] | null
    jawaban_teks: string | null
    catatan: string | null
    submitted_at: string | null
    nilai: number | null
    feedback: string | null
    dinilai_at: string | null
  } | null
}

export interface MateriItem {
  id: string
  judul: string
  deskripsi: string | null
  file_url: string | null
  nama_file: string | null
  created_at: string
  guru_nama: string
  mapel_nama: string
  mapel_kode: string
}

export interface VideoItem {
  id: string
  judul: string
  deskripsi: string | null
  video_url: string | null
  thumbnail_url: string | null
  created_at: string
  guru_nama: string
  mapel_nama: string
  mapel_kode: string
}

export interface PengumumanItem {
  id: string
  judul: string
  isi: string
  created_at: string
  guru_nama: string
}

export interface JadwalItem {
  id: string
  hari: string
  jam_mulai: string
  jam_selesai: string
  ruangan: string
  tahun_ajaran: string
  guru_nama: string
  mapel_nama: string
  mapel_kode: string
}

export interface NilaiItem {
  id: string
  guru_nama: string
  mapel_nama: string
  mapel_kode: string
  tugas: number | null
  uts: number | null
  uas: number | null
  nilai_akhir: number | null
  semester: string
  tahun_ajaran: string
}

export interface NotifikasiItem {
  id: string
  judul: string
  pesan: string | null
  tipe: string | null
  referensi_id: string | null
  is_read: boolean
  created_at: string
}

export interface PresensiItem {
  id: string
  tanggal: string
  status: string
  keterangan: string | null
  mapel_nama: string | null
  guru_nama: string | null
}

export interface ApiError extends Error {
  status?: number
}
