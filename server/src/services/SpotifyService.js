const SpotifyWebApi = require('spotify-web-api-node')

class SpotifyService {
  constructor() {
    this.credentials = {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI || `https://127.0.0.1:${process.env.SERVER_PORT || 8080}/callback`,
    }
  }

  getAuthorizeUrl(state) {
    const scopes = ['user-library-read', 'user-read-private', 'user-read-email', 'playlist-modify-public']
    const api = new SpotifyWebApi(this.credentials)
    return api.createAuthorizeURL(scopes, state, true)
  }

  async exchangeCode(code) {
    const api = new SpotifyWebApi(this.credentials)
    const data = await api.authorizationCodeGrant(code)
    return {
      accessToken: data.body['access_token'],
      refreshToken: data.body['refresh_token'],
      expiresIn: data.body['expires_in'],
    }
  }

  async refreshTokens(refreshToken) {
    const api = new SpotifyWebApi(this.credentials)
    api.setRefreshToken(refreshToken)
    const data = await api.refreshAccessToken()
    return {
      accessToken: data.body['access_token'],
      refreshToken: data.body['refresh_token'],
      expiresIn: data.body['expires_in'],
    }
  }

  async getUserProfile(accessToken) {
    const res = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'trackvenn/1.0.0'
      }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Spotify Fetch Error: ${res.status} ${res.statusText} - ${text}`);
    }
    return await res.json();
  }

  async getSavedTracks(accessToken) {
    let allTracks = [];
    let url = 'https://api.spotify.com/v1/me/tracks?limit=50&offset=0';
    let count = 0;
    const maxTracks = 2000;

    while (url && count < maxTracks) {
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'trackvenn/1.0.0'
        }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Spotify Fetch Error: ${res.status} ${res.statusText} - ${text}`);
      }
      const data = await res.json();
      const validItems = data.items.filter(item => item && item.track).map((item) => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists,
        album: item.track.album,
        uri: item.track.uri,
      }));
      
      allTracks = allTracks.concat(validItems);
      count += validItems.length;
      
      url = data.next;
    }
    
    return allTracks;
  }

  async createPlaylist(accessToken, userId, name, description) {
    const api = new SpotifyWebApi(this.credentials)
    api.setAccessToken(accessToken)
    const data = await api.createPlaylist(userId, name, {
      description,
      public: true
    })
    return data.body
  }

  async addTracksToPlaylist(accessToken, playlistId, trackUris) {
    const api = new SpotifyWebApi(this.credentials)
    api.setAccessToken(accessToken)
    
    // Spotify API has a limit of 100 tracks per request for adding to a playlist.
    const CHUNK_SIZE = 100
    for (let i = 0; i < trackUris.length; i += CHUNK_SIZE) {
      const chunk = trackUris.slice(i, i + CHUNK_SIZE)
      await api.addTracksToPlaylist(playlistId, chunk)
    }
    
    return { success: true }
  }
}

module.exports = new SpotifyService()
