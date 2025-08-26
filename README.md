# SafeSound.ai Website

A clean, single-page website for SafeSound.ai - Truth-grade ambient safety & vision you control.

## What it is

SafeSound.ai turns real-world activity into verifiable, privacy-first data. Edge-first vision (Saifcam) + immutable truth (HBUK). Own your data. Choose your data-rights mode.

## Files

- `index.html` - Main website with all sections
- `styles.css` - Complete styling with dark theme
- `netlify.toml` - Netlify deployment configuration
- `README.md` - This file

## Features

- **3 Data Rights Modes**: License-to-market, Private-model-only, Utility-only
- **HBUK/Saifcam Story**: Complete technical overview
- **Netlify Form**: Working beta signup form
- **SEO Ready**: Open Graph, Twitter cards, JSON-LD
- **Responsive**: Mobile-first design
- **Fast**: Pure HTML/CSS, no build step

## Deploy to Netlify

1. **New site** → Import from Git (or drag this folder)
2. **Custom domain** → Add `www.safesound.ai` → Set DNS:
   - At your registrar, create CNAME `www` → `your-netlify-subdomain.netlify.app`
   - In Netlify → Domain settings → Add apex `safesound.ai` and enable ALIAS/ANAME
3. **Forms** will appear under Forms in Netlify dashboard

## Contact

- **Email**: hello@safesound.ai
- **Founders**: prudvish@safesound.ai

## Tech Stack

- **Edge ingest**: Saifcam (Python)
- **Truth store**: HBUK (Node/Express + Mongo)
- **API**: /events, /exports, /train (rights-aware)

## Next Steps (Optional)

- Add OG image at `/og.png` (1200×630)
- Hook form to Netlify Functions for email + HBUK integration
- Add `/privacy` page describing data-rights modes
