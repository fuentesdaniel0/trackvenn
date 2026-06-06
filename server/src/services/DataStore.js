const fs = require('fs')
const path = require('path')

class DataStore {
  constructor() {
    this.users = new Map()
    this.hosts = new Set()
    this.matches = []
    this.currentUser = null
    this.dataPath = path.join(__dirname, '..', 'data')
    this.hostFile = path.join(this.dataPath, 'host.json')

    // Ensure data directory exists
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(this.dataPath, { recursive: true })
    }

    // Load persistent host if it exists
    if (fs.existsSync(this.hostFile)) {
      try {
        const hostData = JSON.parse(fs.readFileSync(this.hostFile, 'utf8'))
        if (hostData && hostData.id && hostData.tracks) {
          this.addUser(hostData)
          this.hosts.add(hostData.id)
          console.log(`Loaded persistent host: ${hostData.id}`)
        }
      } catch (err) {
        console.error('Failed to load host data:', err)
      }
    }
  }

  saveHost(id, tracks, displayName) {
    const hostData = { id, tracks, displayName }
    try {
      fs.writeFileSync(this.hostFile, JSON.stringify(hostData))
      this.addUser(hostData)
      this.hosts.add(id)
      return true
    } catch (err) {
      console.error('Failed to save host data:', err)
      return false
    }
  }

  addUser({ id, tracks, display_name, displayName }) {
    const existing = this.users.get(id)
    const finalName = displayName || display_name || (existing ? existing.displayName : null) || id
    this.users.set(id, { id, tracks, displayName: finalName })
  }

  removeHost(id) {
    this.hosts.delete(id)
    // If they are the persistent host, remove the file so it doesn't reload
    if (fs.existsSync(this.hostFile)) {
      try {
        const hostData = JSON.parse(fs.readFileSync(this.hostFile, 'utf8'))
        if (hostData.id === id) {
          fs.unlinkSync(this.hostFile)
        }
      } catch (err) {
        console.error('Failed to parse or remove host.json on session end:', err)
      }
    }
  }

  getUser(id) {
    return this.users.get(id)
  }

  isIn(id) {
    return this.users.has(id)
  }

  setCurrentUser(id) {
    this.currentUser = id
  }

  getCurrentUser() {
    return this.users.get(this.currentUser) || { id: this.currentUser }
  }

  getUserIds() {
    return Array.from(this.hosts).map(id => {
      const u = this.users.get(id);
      return { id, displayName: u ? u.displayName : id }
    })
  }

  getNumberUsers() {
    return this.users.size
  }

  generateIntersection(callerId, otherUserId) {
    if (!callerId) {
      console.log('generateIntersection: callerId is empty');
      return []
    }

    if (!this.hosts.has(otherUserId)) {
      throw new Error('SESSION_ENDED');
    }

    const currentTracks = this.users.get(callerId)?.tracks || []
    const otherTracks = this.users.get(otherUserId)?.tracks || []

    const currentTrackIds = new Set(currentTracks.map((t) => t.id))
    const intersection = otherTracks.filter((t) => currentTrackIds.has(t.id))
    
    console.log(`Intersection between ${callerId} (${currentTracks.length} tracks) and ${otherUserId} (${otherTracks.length} tracks): ${intersection.length} common tracks`);
    
    // Debug helper: print the smaller library to see what's in it
    const smallerLib = currentTracks.length < otherTracks.length ? currentTracks : otherTracks;
    const largerLib = currentTracks.length >= otherTracks.length ? currentTracks : otherTracks;
    
    if (smallerLib.length > 0 && smallerLib.length <= 10) {
      console.log(`Debug: The smaller library contains these exact tracks:`, smallerLib.map(t => `${t.name} (ID: ${t.id})`));
      
      // Look for name matches ignoring ID to diagnose missing tracks
      for (const track of smallerLib) {
        const nameMatches = largerLib.filter(t => t.name.toLowerCase() === track.name.toLowerCase());
        if (nameMatches.length > 0) {
          console.log(`Debug: Found tracks in the larger library with the EXACT SAME NAME but DIFFERENT IDs:`, nameMatches.map(t => `${t.name} (ID: ${t.id})`));
        } else {
          console.log(`Debug: The track "${track.name}" was NOT FOUND AT ALL in the larger library's loaded ${largerLib.length} tracks.`);
        }
      }
    }

    const callerUser = this.users.get(callerId)
    const otherUser = this.users.get(otherUserId)

    // Save the match for the Host to retrieve via polling
    this.matches.push({
      callerId,
      otherUserId,
      callerDisplayName: callerUser ? callerUser.displayName : callerId,
      otherUserDisplayName: otherUser ? otherUser.displayName : otherUserId,
      tracks: intersection,
      count: intersection.length,
      timestamp: Date.now()
    })

    return intersection
  }
  getMatchesForHost(hostId) {
    // Return the most recent match for this host (within the last 15 seconds)
    const recentMatches = this.matches.filter(m => 
      m.otherUserId === hostId && 
      (Date.now() - m.timestamp) < 15000
    )
    if (recentMatches.length > 0) {
      return recentMatches[recentMatches.length - 1];
    }
    return null;
  }

  getHistoryForUser(userId) {
    // Return all matches where the user was either the host or the guest
    return this.matches
      .filter(m => m.callerId === userId || m.otherUserId === userId)
      .sort((a, b) => b.timestamp - a.timestamp) // newest first
  }

  clearHistoryForUser(userId) {
    this.matches = this.matches.filter(m => m.callerId !== userId && m.otherUserId !== userId)
  }

  deleteMatch(timestamp) {
    this.matches = this.matches.filter(m => m.timestamp !== parseInt(timestamp))
  }
}

module.exports = new DataStore()
