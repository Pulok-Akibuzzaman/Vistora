export type DocumentGenerationRequest = {
  documentType: 'cv' | 'sop' | 'ps' | 'cl'
  details: Record<string, string>
  candidate: {
    name: string
    country: string
  }
}

export async function generateDocument(request: DocumentGenerationRequest, signal?: AbortSignal): Promise<string> {
  const endpoint = import.meta.env.VITE_DOCUMENT_API_URL as string | undefined
  if (!endpoint) throw new Error('DOCUMENT_API_NOT_CONFIGURED')

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  })
  if (!response.ok) throw new Error(`Document generation failed with ${response.status}`)
  const data = await response.json() as { content?: string; document?: string }
  const content = data.content || data.document
  if (!content) throw new Error('Document generation returned no content')
  return content
}
