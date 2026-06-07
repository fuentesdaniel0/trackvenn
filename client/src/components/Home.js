import React, { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import axios from "axios"
import styled from "@emotion/styled"
import Tracks from "./Tracks"
import { mockProfile, mockUsers, mockIntersectionTracks, mockHistory } from "../mocks/mockData"

axios.defaults.headers.common["Content-Type"] = "application/json"
axios.defaults.withCredentials = true
const uri = process.env.REACT_APP_API_URL || `/`

const Header = styled.div`
  text-align: center;
  margin-bottom: 20px;

  h1 {
    font-family: 'Outfit', sans-serif;
    font-size: 40px;
    font-weight: 800;
    margin-bottom: 0;
    color: var(--text-primary);
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.2;
  }
`

const LoginButton = styled.a`
  display: inline-block;
  background: #34d399; /* Creamy mint green, darker than the original #a7f3d0 */
  color: #ffffff;
  text-decoration: none;
  font-weight: 800;
  font-size: 18px;
  padding: 15px 40px;
  border-radius: 30px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 211, 153, 0.4);

  &:hover {
    transform: translateY(-2px);
    background: #6ee7b7; /* Lighter mint on hover */
    box-shadow: 0 6px 20px rgba(110, 231, 183, 0.6);
  }
`

const ActionButton = styled.button`
  background: var(--bg-glass);
  color: var(--text-primary);
  border: 1px solid var(--border-glass);
  font-weight: 600;
  font-size: 16px;
  padding: 12px 24px;
  border-radius: 8px;
  margin: 20px 0;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--bg-glass-hover);
    border-color: var(--accent-primary);
    box-shadow: 0 4px 15px var(--accent-shadow-light);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: var(--border-glass);
    box-shadow: none;
  }
`

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`



const RoleContainer = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;

  .role-card {
    background: var(--bg-glass);
    border: 1px solid var(--border-glass);
    border-radius: 16px;
    padding: 40px;
    width: 300px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;

    h3 {
      font-size: 24px;
      margin-bottom: 15px;
      color: var(--accent-primary);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.5;
    }

    &:hover {
      background: var(--bg-glass-hover);
      border-color: var(--accent-primary);
      transform: translateY(-5px);
      box-shadow: 0 10px 30px var(--accent-shadow-light);
    }
  }
`

const WaitingContainer = styled.div`
  text-align: center;
  margin-top: 60px;
  background: var(--bg-glass);
  padding: 50px;
  border-radius: 20px;
  border: 1px solid var(--accent-primary);
  box-shadow: 0 0 40px var(--accent-shadow-light);

  .live-badge {
    background: #ef4444;
    color: white;
    font-weight: bold;
    padding: 5px 12px;
    border-radius: 20px;
    display: inline-block;
    margin-bottom: 20px;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
  }

  h2 {
    font-size: 32px;
    margin-bottom: 15px;
  }

  strong {
    color: var(--accent-primary);
    font-size: 24px;
  }
`

const GuestContainer = styled.div`
  margin-top: 40px;

  h2 {
    text-align: center;
    margin-bottom: 30px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
  }

  .user-card {
    background: var(--bg-glass);
    border: 1px solid var(--border-glass);
    padding: 20px;
    border-radius: 12px;
    text-align: center;
    font-weight: bold;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--accent-bg-light);
      border-color: var(--accent-primary);
      transform: scale(1.05);
    }
  }
`

const AnalyzingContainer = styled.div`
  text-align: center;
  margin-top: 80px;

  .orbs {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 30px;
  }

  .orb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent-primary);
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .orb:nth-of-type(1) { animation-delay: -0.32s; background: #6366f1; }
  .orb:nth-of-type(2) { animation-delay: -0.16s; background: #a855f7; }
  .orb:nth-of-type(3) { animation-delay: 0; background: #ec4899; }

  @keyframes bounce {
    0%, 80%, 100% { 
      transform: scale(0);
      opacity: 0.5;
    } 
    40% { 
      transform: scale(1);
      opacity: 1;
      box-shadow: 0 0 15px var(--accent-primary);
    }
  }

  h2 {
    font-size: 28px;
    margin-bottom: 10px;
    animation: pulse-glow 2s infinite alternate;
  }

  p {
    color: var(--text-secondary);
  }
`

export default function Home() {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authLink, setAuthLink] = useState("")
  const [profile, setProfile] = useState(null)
  
  const [availableUsers, setAvailableUsers] = useState([])
  const [intersectionWith, setIntersectionWith] = useState("")
  const [intersectionTracks, setIntersectionTracks] = useState([])
  const [exporting, setExporting] = useState(false)
  const [exportUrl, setExportUrl] = useState("")

  const [error, setError] = useState(null)

  const [currentView, setCurrentView] = useState("role_selection")
  // Views: 'role_selection' | 'host_waiting' | 'guest_selection' | 'analyzing' | 'results' | 'history'
  const [historyTracks, setHistoryTracks] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [portalNode, setPortalNode] = useState(null)

  useEffect(() => {
    setPortalNode(document.getElementById('topnav-actions'))
  }, [])

  const checkAuthAndFetchData = useCallback(async () => {
    try {
      setAuthLoading(true)
      const tracksRes = await axios.get(uri + "tracks")
      setIsAuthorized(true)
      setProfile(tracksRes.data)
      
      const usersRes = await axios.get(uri + "tracks/users")
      setAvailableUsers(usersRes.data.filter(u => u.id !== tracksRes.data.id))
    } catch (e) {
      console.warn("Initial /tracks fetch failed. (This is expected if not logged in). Details:", {
        message: e.message,
        status: e.response?.status,
        data: e.response?.data
      })
      if (e.response?.status === 500) {
        setError(`Backend Error: ${e.response?.data?.error} - ${e.response?.data?.details || ''}\nStack: ${e.response?.data?.stack || ''}`)
      }
      setIsAuthorized(false)
      try {
        const authRes = await axios.get(uri + "auth")
        setAuthLink(authRes.data.authLink)
      } catch (authErr) {
        const detailedError = authErr.response?.data?.error || authErr.message || "Unknown error"
        const status = authErr.response?.status || 'Network/CORS/Cert Error'
        setError(`[${status}] ${detailedError}`)
      }
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const handleHostSession = async () => {
    if (isDemoMode) {
      const defaultName = profile?.display_name || profile?.id || "My Set"
      const displayName = window.prompt("Enter a name to be found as:", defaultName)
      if (!displayName) return
      setCurrentView("host_waiting")
      setTimeout(() => {
        setIntersectionWith("Bob (Demo)")
        setIntersectionTracks(mockIntersectionTracks)
        setCurrentView("results")
      }, 5000)
      return
    }
    const defaultName = profile?.display_name || profile?.id || "My Set"
    const displayName = window.prompt("Enter a name to be found as:", defaultName)
    if (!displayName) return // user cancelled
    try {
      const { data } = await axios.post(uri + "tracks/save-host", { callerId: profile?.id, displayName })
      setAvailableUsers(data.users.filter(u => u.id !== profile?.id))
      setCurrentView("host_waiting")
    } catch (e) {
      console.error("Failed to save host data:", e)
      alert("Failed to start host session.")
    }
  }

  const handleSelectHost = async (hostId) => {
    if (isDemoMode) {
      const hostUser = availableUsers.find(u => u.id === hostId)
      setIntersectionWith(hostUser ? hostUser.displayName : hostId)
      setCurrentView("analyzing")
      setTimeout(() => {
        setExportUrl("")
        setIntersectionTracks(mockIntersectionTracks)
        setCurrentView("results")
      }, 1500)
      return
    }
    const hostUser = availableUsers.find(u => u.id === hostId)
    setIntersectionWith(hostUser ? hostUser.displayName : hostId)
    setCurrentView("analyzing")
    try {
      setExportUrl("") 
      const { data } = await axios.get(uri + `tracks/intersection/${hostId}?caller=${profile?.id}`)
      setIntersectionTracks(data)
      
      setTimeout(() => {
        setCurrentView("results")
      }, 1500)
    } catch (e) {
      if (e.response?.status === 404) {
        alert("This session has already ended!")
        handleRefreshUsers()
      } else {
        console.error("Failed to fetch intersection:", e)
        alert("Failed to fetch intersection.")
      }
      setCurrentView("guest_selection")
    }
  }

  const handleEndSession = async () => {
    if (isDemoMode) {
      setCurrentView("role_selection")
      return
    }
    try {
      await axios.delete(uri + `tracks/host?callerId=${profile?.id}`)
      setCurrentView("role_selection")
      alert("Session ended successfully.")
    } catch (e) {
      console.error("Failed to end session:", e)
      alert("Failed to end session.")
    }
  }

  const handleViewHistory = async () => {
    if (isDemoMode) {
      setHistoryTracks(mockHistory)
      setCurrentView("history")
      return
    }
    try {
      const { data } = await axios.get(uri + `tracks/history/${profile.id}`)
      setHistoryTracks(data)
      setCurrentView("history")
    } catch (e) {
      console.error("Failed to load history:", e)
      alert("Failed to load session history.")
    }
  }

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your entire session history?")) return;
    if (isDemoMode) {
      setHistoryTracks([])
      return
    }
    try {
      await axios.delete(uri + `tracks/history/${profile.id}`)
      setHistoryTracks([])
    } catch (e) {
      console.error("Failed to clear history:", e)
    }
  }

  const handleDeleteMatch = async (e, timestamp) => {
    e.stopPropagation(); // prevent opening the match
    if (isDemoMode) {
      setHistoryTracks(prev => prev.filter(h => h.timestamp !== timestamp))
      return
    }
    try {
      await axios.delete(uri + `tracks/history/${profile.id}/${timestamp}`)
      setHistoryTracks(prev => prev.filter(h => h.timestamp !== timestamp))
    } catch (e) {
      console.error("Failed to delete match:", e)
    }
  }

  const profileId = profile?.id;

  // Host Polling Logic
  useEffect(() => {
    let interval = null;
    if (isDemoMode) return;
    if (currentView === "host_waiting" && profileId) {
      interval = setInterval(async () => {
        try {
          const { data } = await axios.get(uri + `tracks/matches/${profileId}`)
          if (data && data.tracks && data.tracks.length > 0) {
            // Found a match!
            setIntersectionWith(data.callerDisplayName || data.callerId) // The person who matched with us
            setIntersectionTracks(data.tracks)
            setCurrentView("results")
          }
        } catch (e) {
          console.error("Polling failed:", e)
        }
      }, 3000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentView, isDemoMode, profileId])

  // Browser Navigation / Tab Close Teardown
  useEffect(() => {
    const handleUnload = () => {
      if (profileId) {
        // Use fetch with keepalive to reliably send the DELETE request as the tab closes
        fetch(uri + `tracks/host?callerId=${profileId}`, {
          method: 'DELETE',
          keepalive: true
        }).catch(() => {})
      }
    }
    window.addEventListener("beforeunload", handleUnload)
    window.addEventListener("unload", handleUnload)
    
    return () => {
      window.removeEventListener("beforeunload", handleUnload)
      window.removeEventListener("unload", handleUnload)
    }
  }, [profileId])

  const handleRefreshLibrary = async () => {
    if (refreshing || isDemoMode) return;
    setRefreshing(true);
    try {
      const { data } = await axios.get(uri + "tracks?refresh=true")
      setProfile(data)
    } catch (e) {
      console.error("Failed to refresh library:", e)
      alert("Failed to refresh library.")
    } finally {
      setRefreshing(false);
    }
  }

  const handleRefreshUsers = async () => {
    if (isDemoMode) return;
    try {
      const usersRes = await axios.get(uri + `tracks/users?t=${Date.now()}`)
      setAvailableUsers(usersRes.data.filter(u => u.id !== profile?.id))
    } catch (e) {
      console.error("Failed to refresh users:", e)
    }
  }

  const handleLogout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false)
      setProfile(null)
      setIsAuthorized(false)
      setIntersectionTracks([])
      setIntersectionWith("")
      setCurrentView("role_selection")
      return
    }
    try {
      if (profile?.id) {
        await axios.delete(uri + `tracks/host?callerId=${profile.id}`).catch(() => {})
      }
      const { data } = await axios.get(uri + "reset")
      setProfile(null)
      setIsAuthorized(data.authorized)
      setAuthLink(data.authLink)
      setIntersectionTracks([])
      setIntersectionWith("")
      setCurrentView("role_selection")
    } catch (e) {
      console.error("Failed to log out:", e)
    }
  }

  const handleExportPlaylist = async () => {
    if (!intersectionTracks.length) return
    try {
      setExporting(true)
      const trackUris = intersectionTracks.map(t => t.uri)
      const { data } = await axios.post(uri + "tracks/playlist", {
        name: `trackvenn Match: ${intersectionWith}`,
        trackUris
      })
      setExportUrl(data.url)
    } catch (e) {
      console.error("Failed to export playlist:", e)
      alert("Failed to export playlist. Make sure you accepted the new Spotify permissions!")
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    checkAuthAndFetchData()
  }, [checkAuthAndFetchData])

  if (authLoading) return <Header><p>Loading...</p></Header>

  const renderRoleSelection = () => (
    <RoleContainer className="stagger-container">
      <div className="role-card" style={{ "--sibling-index": 1 }} onClick={handleHostSession}>
        <h3>Host</h3>
        <p>Let friends select you to see your shared tracks.</p>
      </div>
      <div className="role-card" style={{ "--sibling-index": 2 }} onClick={() => {
        handleRefreshUsers();
        setCurrentView("guest_selection");
      }}>
        <h3>Find</h3>
        <p>Select a friend to view your music overlap.</p>
      </div>
      <div className="role-card" style={{ "--sibling-index": 3 }} onClick={handleViewHistory}>
        <h3>History</h3>
        <p>View past Venns with your friends.</p>
      </div>
    </RoleContainer>
  )

  const renderHostWaiting = () => (
    <WaitingContainer className="animate-fade-in-up">
      <div className="live-badge">Live</div>
      <h2>You are discoverable!</h2>
      <p>Tell friends to select <strong>{profile?.display_name || profile?.id}</strong> to see your intersection.</p>
      <ActionButton onClick={handleEndSession} style={{ marginTop: '30px', background: 'transparent' }}>
        End Session & Go Back
      </ActionButton>
    </WaitingContainer>
  )

  const renderGuestSelection = () => (
    <GuestContainer>
      <h2>Select a Friend</h2>
      {availableUsers.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No friends are currently discoverable.</p>
      ) : (
        <div className="grid stagger-container">
          {availableUsers.map((u, i) => (
            <div className="user-card" key={u.id} style={{ "--sibling-index": i + 1 }} onClick={() => handleSelectHost(u.id)}>
              {u.displayName}
            </div>
          ))}
        </div>
      )}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <ActionButton onClick={handleRefreshUsers}>Refresh Hosts</ActionButton>
        <ActionButton onClick={() => setCurrentView("role_selection")} style={{ marginLeft: '10px', background: 'transparent', border: 'none' }}>Back</ActionButton>
      </div>
    </GuestContainer>
  )

  const renderAnalyzing = () => (
    <AnalyzingContainer className="animate-fade-in-up">
      <div className="orbs">
        <div className="orb"></div>
        <div className="orb"></div>
        <div className="orb"></div>
      </div>
      <h2>Analyzing Libraries...</h2>
      <p>Finding the intersection with {intersectionWith}</p>
    </AnalyzingContainer>
  )

  const renderResults = () => {
    // If the callerId of the match is our profile ID, we were the guest. 
    // Otherwise, we were the host and the other person was the guest.
    return (
      <div className="animate-fade-in-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <ActionButton onClick={handleEndSession} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-glass)', marginRight: '20px' }}>
              ← Finish
            </ActionButton>
            <h3 style={{ display: 'inline-block' }}>Found {intersectionTracks.length} tracks in common with {intersectionWith}!</h3>
          </div>
          {!exportUrl && !isDemoMode ? (
            <ActionButton 
              onClick={handleExportPlaylist} 
              disabled={exporting}
              style={{ background: 'var(--accent-primary)', color: 'var(--bg-primary)', margin: 0 }}
            >
              {exporting ? "Exporting..." : "Export to Spotify"}
            </ActionButton>
          ) : exportUrl && !isDemoMode ? (
            <a href={exportUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
              View Playlist on Spotify ↗
            </a>
          ) : null}
        </div>
        <Tracks trackList={intersectionTracks} />
      </div>
    )
  }

  const renderHistory = () => (
    <GuestContainer>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', position: 'relative' }}>
        <ActionButton onClick={() => setCurrentView("role_selection")} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-glass)', margin: 0 }}>
          ← Back
        </ActionButton>
        <h2 style={{ margin: 0, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>Session History</h2>
        {historyTracks.length > 0 && (
          <ActionButton onClick={handleClearHistory} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-glass)', margin: 0, color: 'var(--text-secondary)' }}>
            Clear All
          </ActionButton>
        )}
      </div>
      
      {historyTracks.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>You have no past sessions yet.</p>
      ) : (
        <div className="grid stagger-container">
          {historyTracks.map((h, i) => {
            const isGuest = h.callerId === profile?.id;
            const partnerId = isGuest ? h.otherUserId : h.callerId;
            const partnerName = isGuest ? h.otherUserDisplayName : h.callerDisplayName;
            return (
              <div 
                className="user-card" 
                key={i} 
                onClick={() => {
                  setIntersectionWith(partnerName || partnerId);
                  setIntersectionTracks(h.tracks);
                  setExportUrl("");
                  setCurrentView("results");
                }}
                style={{ position: 'relative', "--sibling-index": i + 1 }}
              >
                <div 
                  onClick={(e) => handleDeleteMatch(e, h.timestamp)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '15px',
                    fontSize: '20px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                  title="Delete match"
                >
                  &times;
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Matched with</div>
                <div style={{ fontSize: '20px', margin: '10px 0' }}>{partnerName || partnerId}</div>
                <div style={{ color: 'var(--accent-primary)' }}>{h.count} tracks</div>
              </div>
            )
          })}
        </div>
      )}
    </GuestContainer>
  )

  return (
    <div>
      {isAuthorized && portalNode && createPortal(
        <>
          <ActionButton 
            onClick={handleRefreshLibrary} 
            disabled={refreshing}
            style={{ margin: 0, padding: '8px 16px', fontSize: '14px', background: 'transparent', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '8px', opacity: refreshing ? 0.7 : 1, cursor: refreshing ? 'not-allowed' : 'pointer' }}
          >
            {refreshing ? (
              <>
                <span className="spinner">↻</span> Refreshing...
              </>
            ) : (
              "↻ Refresh Library"
            )}
          </ActionButton>
          <ActionButton onClick={handleLogout} style={{ margin: 0, padding: '8px 16px', fontSize: '14px', background: 'transparent', border: '1px solid var(--border-glass)' }}>Log Out</ActionButton>
        </>,
        portalNode
      )}

      <Header>
        <h1>Create playlists from the exact intersection of your music libraries.</h1>
      </Header>

      {!isAuthorized ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          {error && <p style={{ color: '#ff4444', fontWeight: 'bold', marginBottom: '20px' }}>Error connecting to backend: {error}. Check your browser console.</p>}
          {authLink && <LoginButton href={authLink}>Connect Spotify</LoginButton>}
          <div style={{ marginTop: '20px' }}>
            <ActionButton onClick={() => {
              setIsDemoMode(true)
              setIsAuthorized(true)
              setProfile(mockProfile)
              setAvailableUsers(mockUsers)
              setCurrentView("role_selection")
            }} style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>
              Try Demo Version
            </ActionButton>
          </div>
          {!authLink && !error && <p>Loading connection...</p>}
        </div>
      ) : (
        <DashboardContainer>
          {currentView === "role_selection" && renderRoleSelection()}
          {currentView === "host_waiting" && renderHostWaiting()}
          {currentView === "guest_selection" && renderGuestSelection()}
          {currentView === "analyzing" && renderAnalyzing()}
          {currentView === "results" && renderResults()}
          {currentView === "history" && renderHistory()}
        </DashboardContainer>
      )}
    </div>
  )
}