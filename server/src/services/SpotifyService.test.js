import { describe, it, expect, vi, beforeEach } from 'vitest';
import SpotifyWebApi from 'spotify-web-api-node';
import spotifyService from './SpotifyService';

describe('SpotifyService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
