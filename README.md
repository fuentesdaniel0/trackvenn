# ∩ trackvenn

[![Live Demo](https://img.shields.io/badge/Live%20App-venn.tools-34d399?style=flat-square)](https://venn.tools)
[![CI/CD](https://github.com/fuentesdaniel0/trackvenn/actions/workflows/cd.yml/badge.svg)](https://github.com/fuentesdaniel0/trackvenn/actions)

A full-stack web app that calculates the intersection of Spotify libraries to generate shared playlists.

## Tech Stack
- **Frontend:** React, Emotion
- **Backend:** Node.js, Express, Spotify Web API
- **Infrastructure:** Google Cloud Run, Docker, Nginx, GitHub Actions

## Technical Highlights
- **O(N + M) Intersections:** Fetches libraries via sequential pagination and utilizes a Hash Set for O(1) lookups to compute large intersections instantly.
- **Microservices & CI/CD:** Frontend and backend are decoupled Docker containers deployed to Cloud Run. GitHub Actions handles automated testing and zero-downtime deployments.
- **Robust Security:** Implements HTTP-only `SameSite=Lax` cookies via Nginx reverse proxy, aggressive token-bucket rate limiting, Helmet headers, and CSRF mitigation.
- **Demo Mode:** A seamless mock-data fallback allows guests to explore the UI without Spotify Auth.

## Local Setup

```bash
git clone https://github.com/fuentesdaniel0/trackvenn.git
cd trackvenn
npm install
```

Create `server/.env`:
```env
CLIENT_ID=your_spotify_client_id
CLIENT_SECRET=your_spotify_client_secret
COOKIE_SECRET=your_random_secret_string
```

Run both apps concurrently:
```bash
npm start
```

- **Frontend:** `http://127.0.0.1:3000`
- **Backend:** `https://127.0.0.1:8080` *(Uses self-signed SSL to ensure secure cookies mirror production).*
