// Push notification helpers menggunakan Web Notification API (browser-native).

/**
 * Meminta izin notifikasi browser.
 * Mengembalikan `true` jika izin diberikan, `false` jika ditolak atau tidak didukung.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }
  if (Notification.permission === 'granted') {
    return true
  }
  if (Notification.permission === 'denied') {
    return false
  }
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

/**
 * Menampilkan notifikasi browser jika izin sudah diberikan.
 */
export function showNotification(title: string, body: string): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }
  if (Notification.permission !== 'granted') {
    return
  }
  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    })
  } catch {
    // Fallback: beberapa browser (mis. mobile) tidak mendukung constructor Notification.
    // Abaikan saja — notifikasi gagal ditampilkan bukan hal kritis.
  }
}
