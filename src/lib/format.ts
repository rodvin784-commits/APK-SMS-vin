// Helper format tampilan (tanggal & jam) untuk APK siswa.

/**
 * Memetakan error unknown ke pesan ramah pengguna.
 */
export function mapErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    // Network error
    if (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network') ||
      msg.includes('net::')
    ) {
      return 'Koneksi terputus, silakan coba lagi'
    }
  }
  // HTTP status code (biasa dilempar dari api layer)
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = (error as { status: number }).status
    switch (status) {
      case 401:
        return 'Sesi berakhir, silakan login ulang'
      case 403:
        return 'Anda tidak memiliki akses'
      case 404:
        return 'Data tidak ditemukan'
      case 500:
        return 'Server bermasalah, silakan coba lagi'
    }
  }
  // Cek status dari message string (fallback)
  if (error instanceof Error) {
    const msg = error.message
    if (msg.includes('401')) return 'Sesi berakhir, silakan login ulang'
    if (msg.includes('403')) return 'Anda tidak memiliki akses'
    if (msg.includes('404')) return 'Data tidak ditemukan'
    if (msg.includes('500')) return 'Server bermasalah, silakan coba lagi'
  }
  return 'Terjadi kesalahan, silakan coba lagi'
}

export function formatTanggal(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTanggalJam(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// "07:00:00" (TIME dari Postgres) -> "07:00"
export function formatJam(time: string): string {
  return time.slice(0, 5)
}

export function statusLabel(status: string | null): string {
  switch (status) {
    case 'dikumpulkan':
      return 'Terkumpul'
    case 'terlambat':
      return 'Terlambat'
    case 'dinilai':
      return 'Dinilai'
    default:
      return 'Belum dikumpulkan'
  }
}
