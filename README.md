# ∩ trackvenn

A cloud-native web application that calculates the mathematical intersection of multiple Spotify libraries to generate shared playlists.

## 🏗 Architecture & Tech Stack

trackvenn uses a decoupled architecture deployed on **Google Cloud Run**:

* **Client (React):** Manages user interactions, session history, and OAuth presentation.
* **Server (Node.js/Express):** Handles Spotify API authentication, pagination, rate limiting, and the intersection algorithm.
* **Testing:** Vitest, Supertest, React Testing Library.

## ⚡ Core Engineering

* **Secure Authentication:** Uses the Spotify Authorization Code Flow. Access tokens are strictly managed server-side and user sessions are tracked via signed, HTTP-only cookies to prevent client exposure.
* **$O(N + M)$ Intersection:** Normalizes track URIs and uses Hash Sets to compute intersections of large libraries (up to 10,000 tracks) without nested loop performance degradation.
* **Host-Anchored Processing:** A primary user establishes a persistent, in-memory host session. Guest users independently sync against the host's library for live Venn diagram generation.
* **Robust Pagination:** Recursively paginates through Spotify's `v1/me/tracks` endpoint to handle library limits and 429 rate limits.

## 🔒 Spotify API Policy (2026)

Due to recent Spotify Web API Developer Policy changes, Authorization Code Flow apps require Enterprise Quota extensions (250k+ MAU) to exit Development Mode. 

Therefore, trackvenn operates as a closed, allowlisted app capped at 5 users, serving as an architectural demonstration of secure token lifecycles and cloud deployment.

## 🚀 Local Development

Ensure Node.js (v18+) is installed.

```bash
git clone https://github.com/fuentesdaniel0/trackvenn.git
cd trackvenn

# 1. Configure secrets
cp server/.sample_env server/.env
# Add your SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to server/.env

# 2. Install and start (monorepo script)
npm install
npm start
```

* **Client:** http://localhost:3000
* **Server:** http://localhost:8080

**Note:** To authenticate locally, your Spotify email must be added to the developer dashboard allowlist for your Spotify app.
