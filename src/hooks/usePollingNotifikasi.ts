import { useEffect, useRef, useState } from 'react'
import { fetchNotifikasi } from '../lib/api'
import { requestNotificationPermission, showNotification } from '../lib/notification'

export function usePollingNotifikasi(enabled: boolean) {
  const [unreadCount, setUnreadCount] = useState(0)
  const notifiedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function poll() {
      try {
        const { items, belumDibaca } = await fetchNotifikasi()
        if (cancelled) return
        setUnreadCount(belumDibaca)
        const baru = items.filter((n) => !n.is_read && !notifiedIdsRef.current.has(n.id))
        for (const n of baru) {
          notifiedIdsRef.current.add(n.id)
          showNotification(n.judul, n.pesan ?? 'Anda memiliki notifikasi baru.')
        }
      } catch {
        void 0
      }
    }

    requestNotificationPermission().finally(() => {
      if (!cancelled) poll()
    })
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') poll()
    }, 60_000)
    const onVis = () => { if (document.visibilityState === 'visible') poll() }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelled = true
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [enabled])

  return { unreadCount, setUnreadCount }
}
