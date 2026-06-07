# ∩ trackvenn

[![Live Demo](https://img.shields.io/badge/Live%20App-venn.tools-34d399?style=flat-square)](https://venn.tools)
[![CI/CD](https://github.com/fuentesdaniel0/trackvenn/actions/workflows/cd.yml/badge.svg)](https://github.com/fuentesdaniel0/trackvenn/actions)

A full-stack web application that calculates the intersection of multiple Spotify libraries to generate shared, collaborative playlists. 

## Tech Stack

- **Frontend:** React, Emotion (CSS-in-JS)
- **Backend:** Node.js, Express, Spotify Web API
- **Infrastructure:** Google Cloud Run (Serverless), Docker, Nginx
- **CI/CD:** GitHub Actions (Automated testing, linting, and zero-downtime deployment)

## Key Features

- **OAuth 2.0 Integration:** Securely authenticates users via Spotify.
- **Library Intersections:** Fetches and compares thousands of tracks across multiple user libraries using advanced pagination and upstream API rate-limit handling.
- **"Demo Mode":** A seamless fallback mock-data system that allows guests and recruiters to experience the full application flow without needing explicit Spotify Developer App approval.
- **Modern UI/UX:** A highly responsive, glassmorphic design featuring micro-animations, skeleton loaders, and a premium aesthetic.

## Architecture & DevOps

**Trackvenn** was engineered with enterprise-grade best practices in mind:

- **Microservice Design:** The React client and Node.js server are containerized into separate Docker images and deployed as independent serverless microservices on Google Cloud Run. This ensures clear separation of concerns and independent auto-scaling under load.
- **Strict CI/CD Pipelines:** 
  - **Continuous Integration:** Every push runs automated Vitest suites and ESLint checks. 
  - **Continuous Deployment:** Implements a strict "fail-fast" deployment gate. If tests pass, GitHub Actions dynamically injects production environment variables, builds the frontend, and authenticates with GCP via an IAM Service Account to roll out new containers with zero downtime.
- **Security First:** Implements HTTP-only secure cookies for session management, strict CORS policies, Helmet for secure HTTP headers, CSRF mitigation, and aggressive IP-based rate limiting to prevent upstream API blocking.

## Local Development

1. **Clone the repo:**
   ```bash
   git clone https://github.com/fuentesdaniel0/trackvenn.git
   cd trackvenn
   ```

2. **Install dependencies:**
   *(A postinstall script will automatically install both client and server dependencies)*
   ```bash
   npm install
   ```

3. **Configure environments:**
   Create a `.env` file inside the `server/` directory:
   ```env
   CLIENT_ID=your_spotify_client_id
   CLIENT_SECRET=your_spotify_client_secret
   COOKIE_SECRET=your_random_secret_string
   ```

4. **Start the local dev environment:**
   ```bash
   npm start
   ```
   - **Frontend:** `http://127.0.0.1:3000`
   - **Backend API:** `https://127.0.0.1:8080`
