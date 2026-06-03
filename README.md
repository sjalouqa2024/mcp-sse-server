# Public No-Auth SSE MCP Server

This deploys a public SSE MCP server using `supergateway` + the official
`@modelcontextprotocol/server-everything` demo server. No authentication required.

## Deploy to Railway (free, ~3 minutes)

### Step 1 — Upload this folder to GitHub

1. Go to https://github.com/new
2. Create a new **public** repository, name it `mcp-sse-server`
3. Click "uploading an existing file"
4. Drag and drop both files (`Dockerfile` and `railway.json`) into the page
5. Click **Commit changes**

### Step 2 — Deploy on Railway

1. Go to https://railway.app and sign up / log in (free)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `mcp-sse-server` repo
4. Railway auto-detects the Dockerfile and starts building
5. Once deployed, go to your service → **Settings** → **Networking** → click **Generate Domain**
6. Copy your public URL (looks like `https://mcp-sse-server-production.up.railway.app`)

### Step 3 — Your SSE endpoint is ready

Use this config (replace the URL with yours):

```json
{
  "endpoint": "https://YOUR-APP.up.railway.app/sse",
  "transport": "sse",
  "auth_type": "none",
  "is_active": true
}
```

## What tools does this server expose?

The `server-everything` demo exposes these test tools:
- `echo` — echoes back a message
- `add` — adds two numbers
- `longRunningOperation` — tests streaming
- `sampleLLM` — sample LLM call
- `getTinyImage` — returns a tiny image

Perfect for testing SSE connectivity.
