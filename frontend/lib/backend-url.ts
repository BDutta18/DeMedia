const DEFAULT_BACKEND_URL = "http://127.0.0.1:5000"

export const getBackendApiBaseUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()
  if (!configured) return DEFAULT_BACKEND_URL
  return configured.replace(/\/$/, "")
}
