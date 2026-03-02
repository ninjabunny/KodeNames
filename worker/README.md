# Cloudflare AI Worker Setup

This Worker serves `GET /api/words` for AI-generated KodeNames word sets.

## 1) Create KV and configure Wrangler

1. Create a KV namespace:
   - `wrangler kv namespace create WORDS_KV`
2. Copy the returned namespace ID into `worker/wrangler.toml`.

## 2) Set secrets

From `worker/`:

- `wrangler secret put CF_ACCOUNT_ID`
- `wrangler secret put CF_API_TOKEN`

`CF_API_TOKEN` needs permission to run Workers AI for the account.

## 3) Deploy

- `wrangler deploy`

The API should be reachable at:

- `https://<worker-domain>/api/words?seed=123&count=25`

## 4) Point the frontend to Worker URL

By default, `scripts/index.js` calls `/api/words` on the same origin.
If hosting static files separately, set this before loading `scripts/index.js`:

```html
<script>
  window.KODENAMES_AI_ENDPOINT = "https://<worker-domain>/api/words";
</script>
```

## Response shape

```json
{
  "words": ["word1", "word2", "..."],
  "source": "ai|cache|fallback",
  "ruleVersion": "v5"
}
```
