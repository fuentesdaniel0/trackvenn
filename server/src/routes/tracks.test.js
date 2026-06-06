
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const tracksRouter = require('./tracks');
const dataStore = require('../services/DataStore');
const spotifyService = require('../services/SpotifyService');

// Create a mock express app just for testing the router
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  req.cookies = { access_token: 'fake_token' };
  req.signedCookies = { user_id: req.body.callerId || req.query.callerId || req.params.userId || 'test_user' };
  req.accessToken = 'fake_token';
  next();
});
app.use('/tracks', tracksRouter);



describe('Tracks API Routes', () => {
  beforeEach(() => {
    // Reset DataStore state
    dataStore.users.clear();
    dataStore.hosts.clear();
    dataStore.matches = [];
    dataStore.currentUser = null;
    vi.clearAllMocks();
  });

  describe('POST /tracks/save-host', () => {
    it('should save the current user as a host', async () => {
      // Mock spotify responses
      vi.spyOn(spotifyService, 'getUserProfile').mockResolvedValue({ id: 'test_user' });
      vi.spyOn(spotifyService, 'getSavedTracks').mockResolvedValue([{ id: 't1' }]);
      
      // Mock dataStore.getCurrentUser
      dataStore.addUser({ id: 'test_user', tracks: [{ id: 't1' }] });
      dataStore.setCurrentUser('test_user');

      const res = await request(app).post('/tracks/save-host').send({ callerId: 'test_user' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(dataStore.hosts.has('test_user')).toBe(true);
    });

    it('should return 500 if spotify fetch fails', async () => {
      vi.spyOn(spotifyService, 'getUserProfile').mockRejectedValue(new Error('Spotify Error'));
      const res = await request(app).post('/tracks/save-host').send({ callerId: 'test_user' });
      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /tracks/users', () => {
    it('should return a list of active hosts', async () => {
      dataStore.hosts.add('host_a');
      dataStore.hosts.add('host_b');

      const res = await request(app).get('/tracks/users');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(expect.arrayContaining([{ id: 'host_a', displayName: 'host_a' }, { id: 'host_b', displayName: 'host_b' }]));
    });
  });

  describe('GET /tracks/matches/:hostId', () => {
    it('should return matches if intersection occurred', async () => {
      dataStore.hosts.add('host');
      dataStore.matches.push({ callerId: 'guest', otherUserId: 'host', tracks: [{id: 't1'}], timestamp: Date.now() });

      const res = await request(app).get('/tracks/matches/host');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.tracks.length).toBe(1);
      expect(res.body.callerId).toBe('guest');
    });

    it('should return 200 and null if no matches exist', async () => {
      const res = await request(app).get('/tracks/matches/dead_host');
      expect(res.statusCode).toBe(200);
      expect(res.body).toBeNull();
    });
  });

  describe('DELETE /tracks/host', () => {
    it('should remove the host from the datastore', async () => {
      dataStore.hosts.add('host1');
      
      const res = await request(app).delete('/tracks/host?callerId=host1');
      
      expect(res.statusCode).toBe(200);
      expect(dataStore.hosts.has('host1')).toBe(false);
    });
  });

  describe('History Routes', () => {
    beforeEach(() => {
      dataStore.matches = [
        { callerId: 'test_user', otherUserId: 'user2', timestamp: 100 },
        { callerId: 'test_user', otherUserId: 'user3', timestamp: 200 }
      ];
    });

    it('GET /tracks/history/:userId should return history', async () => {
      const res = await request(app).get('/tracks/history/test_user');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it('DELETE /tracks/history/:userId should clear history', async () => {
      const res = await request(app).delete('/tracks/history/test_user');
      expect(res.statusCode).toBe(200);
      expect(dataStore.matches.length).toBe(0);
    });

    it('DELETE /tracks/history/:userId/:timestamp should delete one match', async () => {
      const res = await request(app).delete('/tracks/history/test_user/100');
      expect(res.statusCode).toBe(200);
      expect(dataStore.matches.length).toBe(1);
      expect(dataStore.matches[0].timestamp).toBe(200);
    });
  });
});
