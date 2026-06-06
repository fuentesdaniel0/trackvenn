# ∩ trackvenn

A decoupled web application that securely calculates the exact mathematical intersection of multiple Spotify music libraries.

trackvenn processes large, paginated JSON payloads from the Spotify Web API to compute overlapping tracks between users, automatically generating a unified playlist of shared music. It is engineered with a strict focus on data privacy, secure OAuth 2.0 token management, and algorithmic efficiency.

## 🏗 System Architecture

The application utilizes a decoupled architecture to ensure clear boundaries between state management, user interface, and data processing.

* **Frontend Client:** A responsive, dark-mode web client built in React, handling user interactions, API state management, and the OAuth presentation layer.
* **Backend Service:** A dedicated Express.js API responsible for securely managing Spotify access/refresh tokens, paginating through user library endpoints, executing the intersection algorithm, and handling the playlist mutation requests.

## ⚡ Core Engineering Features

* **Secure Authentication:** Implements the Spotify Authorization Code Flow. Scoped strictly to `user-library-read`, `playlist-modify-public`, and `playlist-modify-private`. Access tokens are managed server-side to prevent client exposure, and user sessions are tracked via signed, HTTP-only cookies.
* **Algorithmic Efficiency:** Comparing arrays of up to 10,000 tracks requires optimized data structures. The backend normalizes track URIs and utilizes Hash Sets to compute the intersection in $O(N + M)$ time complexity, bypassing the severe performance degradation of nested loops.
* **Robust Pagination Handler:** The Spotify API limits library responses to 50 tracks per request. The backend recursively paginates through the `v1/me/tracks` endpoint in batches, handling limits and reducing overhead.
* **Host-Anchored Processing:** Instead of stateless processing, trackvenn features a unique "Host" architecture. A primary user establishes a persistent, in-memory host session (backed up to the filesystem), allowing multiple guest users to independently sync their libraries against the host's library for live, real-time Venn diagram generation.

## 🔒 Spotify API Developer Policy Note (2026)

Due to structural changes in the Spotify Web API Developer Policy implemented in early 2026, applications utilizing the Authorization Code Flow are permanently restricted to Development Mode unless granted enterprise-level Enterprise Quota extensions (requiring 250k+ MAU and a registered corporate entity).

As a result, trackvenn operates as a closed, allowlisted application. It is hard-capped at 5 authenticated users and serves as a private utility and architectural demonstration of third-party API integration, secure token lifecycles, and cloud-native deployment.

## 🛠 Tech Stack

* **Client:** React (Create React App), Vanilla CSS
* **API:** Node.js, Express.js
* **Testing:** Vitest, Supertest, React Testing Library
* **Deployment:** Docker, Google Cloud Artifact Registry, Google Cloud Run

## 🚀 Local Development

The project is structured as a monorepo for ease of local development. Ensure Node.js (v18+) is installed on your machine.

### 1. Environment Configuration

Clone the repository and configure the environment variables for both the client and server.

```bash
git clone https://github.com/[your-username]/trackvenn.git
cd trackvenn

# Configure backend secrets
cp server/.sample_env server/.env
# Open server/.env and add your SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET
```

### 2. Initialization

Install the dependencies across both the server and client, and start the development environment using the root `concurrently` script.

```bash
npm install
npm start
```

The Frontend Client will be available at http://localhost:3000
The Backend API will be available at http://localhost:8080

### 3. API Allowlisting

To authenticate locally or in production, your Spotify email address must be manually added to the developer dashboard allowlist under the trackvenn application settings.
