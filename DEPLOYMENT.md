# Deploying trackvenn to Google Cloud Run

This guide outlines how to deploy the client and server applications of **trackvenn** using Google Cloud Run. We separate the client and the server into two distinct Cloud Run services to ensure maximum scalability.

## Prerequisites

1.  **Google Cloud Platform (GCP) Project:** Ensure you have a GCP project (e.g., `trackvenn`).
2.  **Billing Enabled:** You must have billing enabled for the project to use Cloud Run and Cloud Build.
3.  **gcloud CLI:** Ensure the `gcloud` CLI tool is installed and authenticated.

## Environment Variables

### Server
You will need to set the following environment variables on the Server Cloud Run instance:
- `CLIENT_ID`: Your Spotify Developer App Client ID
- `CLIENT_SECRET`: Your Spotify Developer App Client Secret
- `COOKIE_SECRET`: A cryptographic secret string used to sign session cookies (e.g., a randomly generated 64-character string).
- `CLIENT_URL`: The deployed URL of your Client service (this sets the CORS origin policy).

### Client
You will need to set the following environment variable during the build process of the Client (or via runtime injection):
- `REACT_APP_API_URL`: The deployed URL of your Server service.

## Deployment Steps

> [!TIP]
> Deploy the server first so that you can retrieve its final URL, which you will need to set as the `REACT_APP_API_URL` for the client.

### 1. Deploy the Server

Navigate to the `server/` directory and use the `gcloud run deploy` command to build and deploy from the local source. Cloud Run will automatically detect the `package.json` and build the container using Google Cloud Buildpacks, or you can use the provided `Dockerfile`.

```bash
cd server
gcloud run deploy trackvenn-server \
  --source . \
  --project trackvenn \
  --region us-central1 \
  --allow-unauthenticated
```
Once complete, `gcloud` will output a Service URL. Copy this URL.

### 2. Configure and Deploy the Client

Before deploying the client, ensure it knows how to contact the newly deployed server. 
Navigate to the `client/` directory. If you are using the standard Dockerfile or build process, provide the server URL as an argument or environment variable. 

```bash
cd client
gcloud run deploy trackvenn-client \
  --source . \
  --project trackvenn \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars REACT_APP_API_URL=<YOUR_SERVER_URL>
```

> [!WARNING]
> Don't forget to add your new Client URL to your Server's `CLIENT_URL` environment variable to prevent CORS blocking!
> ```bash
> gcloud run services update trackvenn-server \
>   --project trackvenn \
>   --region us-central1 \
>   --set-env-vars CLIENT_URL=<YOUR_CLIENT_URL>
> ```

### 3. Update Spotify Dashboard

Finally, you must update your app on the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/):
- Add your new Client URL (and Client URL + `/callback` if applicable) to the **Redirect URIs** list.

You are now fully deployed!
