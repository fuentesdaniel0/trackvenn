const express = require('express')
const router = express.Router()
const spotifyService = require('../services/SpotifyService')
const dataStore = require('../services/DataStore')

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}

const enforceUserAuth = (req, res, next) => {
  const cookieUserId = req.signedCookies.user_id;
  const targetId = req.body.callerId || req.query.callerId || req.params.userId;
  
  if (!cookieUserId || cookieUserId !== targetId) {
    return res.status(403).json({ error: 'Forbidden: Session mismatch or missing signed cookie' });
  }
  next();
};

router.get('/', async (req, res) => {
  try {
    const accessToken = req.accessToken
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' })
    }

    let profile;
    try {
      profile = await spotifyService.getUserProfile(accessToken);
    } catch (e) {
      console.error('Profile fetch failed:', e.body || e);
      return res.status(500).json({ error: 'Profile fetch failed', details: (e.body && e.body.error && e.body.error.message) || e.message, stack: e.stack });
    }

    if (!req.query.refresh && dataStore.isIn(profile.id)) {
      dataStore.setCurrentUser(profile.id)
      res.cookie('user_id', profile.id, { signed: true, ...cookieConfig })
      return res.json(profile)
    }

    let tracks;
    try {
      tracks = await spotifyService.getSavedTracks(accessToken);
    } catch (e) {
      console.error('Tracks fetch failed:', e.body || e);
      return res.status(500).json({ error: 'Tracks fetch failed', details: (e.body && e.body.error && e.body.error.message) || e.message, stack: e.stack });
    }

    dataStore.addUser({ id: profile.id, tracks })
    dataStore.setCurrentUser(profile.id)
    res.cookie('user_id', profile.id, { signed: true, ...cookieConfig })

    res.json(profile)
  } catch (err) {
    console.error('Error fetching tracks:', err)
    res.status(500).json({ error: 'Failed to fetch tracks', details: err.message, stack: err.stack })
  }
})

router.get('/users', (req, res) => {
  const users = dataStore.getUserIds()
  res.json(users)
})

router.get('/intersection/:otherUserId', (req, res) => {
  try {
    const callerId = req.query.caller
    const intersection = dataStore.generateIntersection(callerId, req.params.otherUserId)
    res.json(intersection)
  } catch (e) {
    if (e.message === 'SESSION_ENDED') {
      res.status(404).json({ error: 'Session has ended' })
    } else {
      res.status(500).json({ error: 'Failed to generate intersection' })
    }
  }
})

router.post('/save-host', enforceUserAuth, async (req, res) => {
  const { callerId, displayName } = req.body
  let currentUser = dataStore.getUser(callerId)

  // If the user ended their session previously, they were removed from the DataStore.
  // We must re-fetch their library from Spotify to start a new host session.
  if (!currentUser || !currentUser.tracks) {
    try {
      const profile = await spotifyService.getUserProfile(req.accessToken)
      const tracks = await spotifyService.getSavedTracks(req.accessToken)
      profile.tracks = tracks
      profile.displayName = displayName || profile.display_name || profile.id
      dataStore.addUser(profile)
      currentUser = profile
    } catch (e) {
      console.error('Failed to re-fetch tracks for host session:', e)
      return res.status(500).json({ error: 'Failed to re-fetch tracks for host session' })
    }
  }

  const success = dataStore.saveHost(currentUser.id, currentUser.tracks, displayName || currentUser.displayName)
  if (success) {
    res.json({ success: true, users: dataStore.getUserIds() })
  } else {
    res.status(500).json({ error: 'Failed to save host tracks persistently' })
  }
})

router.post('/playlist', async (req, res) => {
  try {
    const accessToken = req.accessToken
    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' })
    }

    const { name, trackUris } = req.body
    if (!name || !trackUris || !trackUris.length) {
      return res.status(400).json({ error: 'Missing name or trackUris' })
    }

    const userId = req.signedCookies.user_id;
    if (!userId) {
      return res.status(403).json({ error: 'Session mismatch or missing user_id cookie' })
    }

    const playlist = await spotifyService.createPlaylist(accessToken, userId, name, 'Created via trackvenn - The Playlist Intersection App')
    await spotifyService.addTracksToPlaylist(accessToken, playlist.id, trackUris)

    res.json({ success: true, url: playlist.external_urls.spotify })
  } catch (err) {
    console.error('Error creating playlist:', err)
    res.status(500).json({ error: 'Failed to create playlist' })
  }
})

router.get('/matches/:hostId', (req, res) => {
  try {
    const hostId = req.params.hostId
    const match = dataStore.getMatchesForHost(hostId)
    if (match) {
      res.json(match)
    } else {
      res.json(null)
    }
  } catch (err) {
    if (err.message === 'SESSION_ENDED') {
      res.status(404).json({ error: 'Host is no longer active.' })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})

router.delete('/host', enforceUserAuth, async (req, res) => {
  try {
    const callerId = req.query.callerId
    if (callerId) {
      dataStore.removeHost(callerId)
    }
    res.json({ success: true, users: dataStore.getUserIds() })
  } catch (e) {
    console.error('Failed to end session:', e)
    res.status(500).json({ error: 'Failed to end session' })
  }
})

router.get('/history/:userId', (req, res) => {
  const userId = req.params.userId
  const history = dataStore.getHistoryForUser(userId)
  res.json(history)
})

router.delete('/history/:userId', enforceUserAuth, (req, res) => {
  const userId = req.params.userId
  dataStore.clearHistoryForUser(userId)
  res.json({ success: true })
})

router.delete('/history/:userId/:timestamp', enforceUserAuth, (req, res) => {
  const timestamp = req.params.timestamp
  dataStore.deleteMatch(timestamp)
  res.json({ success: true })
})

module.exports = router
