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

## 🏗️ Architecture Overview

**Trackvenn** uses a decoupled client-server architecture to ensure clear separation of concerns, robust security, and independent scalability.

*   **Frontend (Client):** A React single-page application (SPA) styled with Emotion. It handles the user interface, routing, and interactions, communicating securely with the backend API.
*   **Backend (Server):** A Node.js/Express REST API. It securely manages Spotify OAuth 2.0 authentication (using HTTP-only, secure cookies for session management), handles business logic for calculating library intersections, and acts as a proxy for Spotify API requests.
*   **Infrastructure:** Both client and server are containerized and deployed as separate, independent services on **Google Cloud Run**. 
*   **Security:** The backend incorporates security best practices including CORS strict origin policies, Helmet for secure HTTP headers, CSRF mitigation via Content-Type enforcement, and IP-based rate limiting.

## 📈 Service Scale & Performance

Designed for high availability and efficiency, the application leverages serverless infrastructure:

*   **Independent Scaling:** By separating the client and server into distinct Cloud Run services, the frontend can scale rapidly to serve static assets under heavy UI traffic, while the backend scales independently based on API request load and computational demands (e.g., processing large Spotify playlists).
*   **Serverless Auto-scaling:** Google Cloud Run automatically scales container instances from zero up to handle incoming request volume seamlessly, ensuring responsive performance during traffic spikes.
*   **Bottlenecks & Mitigations:** The primary scaling constraint is the upstream Spotify Web API rate limits. To mitigate this and protect the service availability, the backend implements application-level rate limiting (150 requests per 15 minutes per IP) to throttle aggressive clients before triggering upstream blocks, ensuring overall system stability.
