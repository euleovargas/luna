import { useSearchParams as useNextSearchParams } from 'next/navigation'

export function useSearchParams() {
  const params = useNextSearchParams()
  
  return {
    get: (key: string) => params?.get(key) ?? null,
    getAll: (key: string) => params?.getAll(key) ?? [],
    has: (key: string) => params?.has(key) ?? false,
    toString: () => params?.toString() ?? "",
  }
}
