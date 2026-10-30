# Gemini IELTS evaluation endpoint

The frontend submits a `multipart/form-data` request to the URL configured in
`VITE_EVALUATION_API_URL`.

## Request

- `attempt`: JSON containing the IELTS test name, objective answers and scores,
  and both Writing responses.
- `speakingPart1`, `speakingPart2`, `speakingPart3`: optional WebM audio files.

The backend must keep `GEMINI_API_KEY` in a server-side secret. Never expose it
through a `VITE_` environment variable.

## Response

Return JSON with this shape:

```json
{
  "overallBand": 6.5,
  "descriptor": "Competent User",
  "overallComment": "Personalised summary",
  "listening": {
    "band": 7,
    "summary": "Skill explanation",
    "strengths": ["..."],
    "improvements": ["..."]
  },
  "reading": {
    "band": 6.5,
    "summary": "Skill explanation",
    "strengths": ["..."],
    "improvements": ["..."]
  },
  "writing": {
    "band": 6,
    "summary": "Rubric explanation",
    "strengths": ["..."],
    "improvements": ["..."],
    "criteria": {
      "Task Achievement": 6,
      "Coherence & Cohesion": 6,
      "Lexical Resource": 6,
      "Grammar": 6
    },
    "taskComments": ["Task 1 feedback", "Task 2 feedback"]
  },
  "speaking": {
    "band": 6.5,
    "summary": "Rubric explanation",
    "strengths": ["..."],
    "improvements": ["..."],
    "criteria": {
      "Fluency & Coherence": 6.5,
      "Lexical Resource": 6.5,
      "Grammar": 6,
      "Pronunciation": 6.5
    },
    "comments": ["..."]
  },
  "studyPlan": ["First action", "Second action"]
}
```

If the endpoint is absent or fails, the frontend displays a clearly labelled
local preview based on deterministic Reading and Listening scoring and
completion data. It does not present fallback Writing or Speaking scores as
Gemini analysis.
