
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyService = require('./SpotifyService');

describe('SpotifyService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUserProfile', () => {
    it('should fetch and return the user profile', async () => {
      const mockResponse = { id: 'test_user', display_name: 'Test User' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const profile = await spotifyService.getUserProfile('test_token');
      
      expect(global.fetch).toHaveBeenCalledWith('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': 'Bearer test_token',
          'User-Agent': 'trackvenn/1.0.0'
        }
      });
      expect(profile).toEqual(mockResponse);
    });

    it('should throw an error if fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Token expired')
      });

      await expect(spotifyService.getUserProfile('test_token')).rejects.toThrow('Spotify Fetch Error: 401 Unauthorized - Token expired');
    });
  });

  describe('getSavedTracks', () => {
    it('should fetch all pages of saved tracks', async () => {
      const mockPage1 = {
        items: [{ track: { id: 't1', name: 'Track 1' } }, { track: null }, { track: { id: 't2', name: 'Track 2' } }],
        next: 'https://api.spotify.com/v1/me/tracks?offset=50&limit=50'
      };
      const mockPage2 = {
        items: [{ track: { id: 't3', name: 'Track 3' } }],
        next: null
      };

      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPage1) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockPage2) });

      const tracks = await spotifyService.getSavedTracks('test_token');
      
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(tracks.length).toBe(3);
      expect(tracks[0].id).toBe('t1');
      expect(tracks[1].id).toBe('t2');
      expect(tracks[2].id).toBe('t3');
    });

    it('should handle fetch errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: () => Promise.resolve('Rate limit exceeded')
      });

      await expect(spotifyService.getSavedTracks('test_token')).rejects.toThrow('Spotify Fetch Error: 429 Too Many Requests - Rate limit exceeded');
    });
  });

  describe('addTracksToPlaylist', () => {
    it('should chunk track URIs into batches of 100', async () => {
      const trackUris = Array.from({ length: 250 }, (_, i) => `spotify:track:${i}`);
      
      const mockSetAccessToken = vi.spyOn(SpotifyWebApi.prototype, 'setAccessToken').mockImplementation(() => {});
      const mockAddTracksToPlaylist = vi.spyOn(SpotifyWebApi.prototype, 'addTracksToPlaylist').mockResolvedValue({ body: {} });

      await spotifyService.addTracksToPlaylist('test_token', 'playlist123', trackUris);
      
      expect(mockSetAccessToken).toHaveBeenCalledWith('test_token');
      expect(mockAddTracksToPlaylist).toHaveBeenCalledTimes(3);
      
      expect(mockAddTracksToPlaylist).toHaveBeenNthCalledWith(1, 'playlist123', trackUris.slice(0, 100));
      expect(mockAddTracksToPlaylist).toHaveBeenNthCalledWith(2, 'playlist123', trackUris.slice(100, 200));
      expect(mockAddTracksToPlaylist).toHaveBeenNthCalledWith(3, 'playlist123', trackUris.slice(200, 250));
    });

    it('should handle small playlists without chunking', async () => {
      const trackUris = Array.from({ length: 50 }, (_, i) => `spotify:track:${i}`);
      
      const mockSetAccessToken = vi.spyOn(SpotifyWebApi.prototype, 'setAccessToken').mockImplementation(() => {});
      const mockAddTracksToPlaylist = vi.spyOn(SpotifyWebApi.prototype, 'addTracksToPlaylist').mockResolvedValue({ body: {} });

      await spotifyService.addTracksToPlaylist('test_token', 'playlist123', trackUris);
      
      expect(mockSetAccessToken).toHaveBeenCalledWith('test_token');
      expect(mockAddTracksToPlaylist).toHaveBeenCalledTimes(1);
      
      expect(mockAddTracksToPlaylist).toHaveBeenNthCalledWith(1, 'playlist123', trackUris);
    });
  });
});
