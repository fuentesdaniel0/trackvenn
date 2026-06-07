import React from "react"
import styled from "@emotion/styled"

const AboutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;

  h2 {
    font-size: 32px;
    margin-bottom: 20px;
    color: var(--text-primary);
  }

  h3 {
    font-size: 24px;
    margin-top: 30px;
    margin-bottom: 15px;
    color: var(--text-primary);
  }

  p {
    font-size: 18px;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin-bottom: 30px;
  }

  li {
    font-size: 18px;
    color: var(--text-secondary);
    margin-bottom: 12px;
    background: var(--bg-glass);
    padding: 15px 20px;
    border-radius: 8px;
    border: 1px solid var(--border-glass);
  }

  li strong {
    color: var(--accent-primary);
  }

  .highlight {
    color: var(--accent-primary);
    font-weight: 600;
  }
  a {
    color: var(--accent-primary);
    text-decoration: none;
    font-weight: 600;
  }

  a:hover {
    text-decoration: underline;
  }
`

function About() {
  return (
    <AboutContainer>
      <h2>About <span className="highlight">trackvenn</span></h2>
      <p>
        trackvenn identifies the exact overlap between your Spotify Liked Songs and your friends' libraries.
      </p>
      
      <h3>How It Works</h3>
      <ul>
        <li><strong>Host:</strong> One person logs in and starts a hosting session.</li>
        <li><strong>Join:</strong> A friend joins the session and connects their Spotify account.</li>
        <li><strong>Intersect:</strong> The app compares both users' "Liked Songs" libraries to find the exact track overlap.</li>
        <li><strong>Export:</strong> View the results in a Venn diagram and save the shared tracks as a new playlist!</li>
      </ul>

      <h3>Privacy & Process</h3>
      <p>
        Authentication is handled securely through Spotify. We read your Liked Songs exclusively to compute library intersections. Your data is used strictly for this calculation and is never stored, sold, or shared beyond the active session.
      </p>

      <h3>Open Source</h3>
      <p>
        trackvenn is open source! Feel free to check out the code, report issues, or contribute on <a href="https://github.com/fuentesdaniel0/trackvenn" target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>
    </AboutContainer>
  )
}

export default About
