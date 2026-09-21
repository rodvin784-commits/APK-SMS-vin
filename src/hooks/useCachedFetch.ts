import { useEffect, useState } from 'react'

interface Options<T> {
  fetchFn: () => Promise<T>
  getCached?: () => T | null
  cacheFn?: (data: T) => void
}

export function useCachedFetch<T>({ fetchFn, getCached, cacheFn }: Options<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const reload = () => {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }

  useEffect(() => {
    let cancelled = false
    async function init() {
      const cached = getCached?.() ?? null
      if (cached && !data) setData(cached as T)
      try {
        const d = await fetchFn()
        if (cancelled) return
        setData(d)
        cacheFn?.(d)
        setError(null)
      } catch (err: unknown) {
        if (cached) {
          setData(cached)
          setError(err instanceof Error ? err.message : String(err))
        } else {
          setError(err instanceof Error ? err.message : String(err))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey])

  return { data, loading, error, reload, setData, setError, setLoading }
}
