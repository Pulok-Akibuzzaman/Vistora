# Gemini document generation endpoint

Configure the frontend with:

```env
VITE_DOCUMENT_API_URL=https://your-backend.example.com/api/generate-document
```

The Gemini API key must be stored by the backend as a secret and must never be
returned to the browser.

## Request

```json
{
  "documentType": "sop",
  "details": {
    "name": "Ayaan Rahman",
    "program": "MSc Computer Science",
    "university": "Example University",
    "interests": "Natural language processing"
  },
  "candidate": {
    "name": "Ayaan Rahman",
    "country": "Bangladesh"
  }
}
```

`documentType` is one of:

- `cv`
- `sop`
- `ps`
- `cl`

## Response

```json
{
  "content": "The complete generated document as plain text."
}
```

The backend should validate input length, apply rate limits, reject prompt
injection attempts, and ask Gemini for plain text rather than executable HTML.
