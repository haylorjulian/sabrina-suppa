# CMS Setup — Sabrina Suppa

The site now has a **free, git-based CMS** ([Sveltia CMS](https://sveltiacms.app)) at **`/admin`**.
The client edits content in a form; each save commits JSON to this repo; a GitHub Action rebuilds
and deploys to Cloudflare. Uploaded images/videos go to **Cloudflare R2** (kept out of git).

Everything in `src/content/` is the editable source of truth. A build step
(`scripts/build-content.mjs`, run automatically on `npm run dev` / `npm run build`) assembles those
files into `src/content/copy.generated.json` + `src/lib/media.generated.json`, which the app imports.
**Never hand-edit the `*.generated.json` files.**

---

## What the client can edit

- **Site Settings** — SEO title/description, 404 page text
- **Navigation** — logo text, menu links, menu/close labels
- **Hero** — name, descriptor, scroll cue, background image + alt
- **Preloader** — name, descriptor
- **About** — section label, paragraphs, background image + alt, social links
- **Work labels** — all the small button/aria strings
- **Categories** — add/remove; label, order, description paragraphs, cover + landing images
- **Projects** — add/remove; title, category, order, description, "coming soon" flag, and an ordered
  gallery of images/videos with alt text

---

## One-time setup (≈30 min)

You need a **Cloudflare account** and a **GitHub account** (you already own the repo).
Placeholders to fill live in [`public/admin/config.yml`](public/admin/config.yml).

### 1. Cloudflare R2 (media storage)

1. Cloudflare dashboard → **R2** → **Create bucket** → name it `sabrina-suppa-media`.
2. Bucket → **Settings** → enable a **public URL** (either the free `pub-….r2.dev` URL, or connect a
   custom domain like `media.sabrinasuppa.com` — recommended).
3. R2 → **Manage R2 API Tokens** → **Create API token** → *Object Read & Write* for this bucket.
   Note the **Access Key ID** (goes in config) and **Secret Access Key** (do **not** put in config —
   the CMS asks each editor for it on first upload and stores it in their browser).
4. Edit `public/admin/config.yml` → `media_libraries.cloudflare_r2`:
   - `account_id` — your Cloudflare account ID (R2 overview page)
   - `access_key_id` — from step 3
   - `public_url` — the URL from step 2
   - `bucket` / `prefix` — already set (`sabrina-suppa-media`, `uploads/`)

### 2. GitHub login (auth Worker)

Sveltia needs a tiny Cloudflare Worker to run the GitHub OAuth handshake.

1. Deploy [`sveltia/sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) (one-click
   "Deploy to Cloudflare" button in its README, or `git clone` + `wrangler deploy`). Note its URL:
   `https://sveltia-cms-auth.<your-subdomain>.workers.dev`.
2. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**:
   - Homepage URL: `https://sabrinasuppa.com`
   - **Authorization callback URL**: `<worker-url>/callback`
   - Copy the **Client ID** and generate a **Client Secret**.
3. In the Worker (Cloudflare dashboard → Workers → `sveltia-cms-auth` → **Settings → Variables**), add:
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   - `ALLOWED_DOMAINS` = `sabrinasuppa.com` (add your Cloudflare Pages/preview host too if used)
4. In `public/admin/config.yml`, set `backend.base_url` to the Worker URL.
5. Invite the client as a **collaborator** on `haylorjulian/sabrina-suppa` (Repo → Settings →
   Collaborators). They sign in at `/admin` with their free GitHub account.

### 3. Auto-deploy (GitHub Action)

The workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds + deploys on every
push to `main`. Add these in the repo → **Settings → Secrets and variables → Actions**:

- **Secret** `CLOUDFLARE_API_TOKEN` — a token with *Edit Cloudflare Workers* permission.
- **Secret** `CLOUDFLARE_ACCOUNT_ID` — your account ID.
- **Variable** `NEXT_PUBLIC_ASSET_BASE` — set **after** the media migration below (step 4) to your R2
  public URL. Leave unset until then (falls back to the in-repo `/assets` path).

### 4. Migrate existing media to R2 (once)

Existing images/videos currently live in `public/assets/`. Move them to R2 so the CMS and site share
one media home:

```bash
# dry run first
BUCKET=sabrina-suppa-media node scripts/migrate-assets-to-r2.mjs
# then upload for real (uses your logged-in wrangler)
BUCKET=sabrina-suppa-media node scripts/migrate-assets-to-r2.mjs --go
```

Then set `NEXT_PUBLIC_ASSET_BASE` (repo Variable **and** your local `.env.local`) to the R2 public
URL, redeploy, and confirm images load. Once verified, you can delete `public/assets/` to shrink the
repo. (New CMS uploads store absolute R2 URLs and work regardless.)

---

## Everyday workflow

- **Client:** open `/admin`, sign in with GitHub, edit, **Publish**. The change goes live in ~1–2 min
  (the Action rebuilds + deploys). Adding a project/category is a normal "New" entry.
- **You (local):** `npm run dev` — content assembles automatically. To edit content by hand, change
  the files in `src/content/` (not the generated files).

## Notes & guardrails

- **Design safety:** fields are constrained (no free-form page building), so edits can't introduce a
  third background world or break the type system. Keep it that way — see [DESIGN.md](DESIGN.md).
- **Slugs** drive URLs; avoid renaming a project/category slug after launch (breaks links).
- **Image dimensions** for existing assets are cached in `src/lib/media-dimensions.json`. New R2
  uploads render fine without a cached dimension (measured on load); to pre-warm, keep that file.
- **Future shop / user data:** a separate subsystem (Cloudflare D1 + R2 + Stripe) — not part of this
  content CMS.
