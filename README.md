# ∩ trackvenn

A web app to calculate the intersection of multiple Spotify libraries to generate shared playlists. Deployed on Google Cloud Run.

## 🚀 Local Development

1. Clone and install:
```bash
git clone https://github.com/fuentesdaniel0/trackvenn.git
cd trackvenn
npm install
```

2. Configure secrets in `server/.env`:
```
SPOTIFY_CLIENT_ID=your_id
SPOTIFY_CLIENT_SECRET=your_secret
```

3. Start the app:
```bash
npm start
```
- Client: http://localhost:3000
- Server: http://localhost:8080

*(Note: Add your Spotify email to the developer dashboard allowlist.)*
