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
      <h3>About trackvenn</h3>
      <p>trackvenn calculates the exact overlap between your Spotify Liked Songs and a friend's library.</p>
      
      <h3>How It Works</h3>
      <ul>
        <li><strong>Host:</strong> Start a session to broadcast your library.</li>
        <li><strong>Join:</strong> Connect your Spotify account to an active host.</li>
        <li><strong>Intersect:</strong> Calculate the exact track overlap between both libraries.</li>
        <li><strong>Export:</strong> Generate a new shared playlist directly to your Spotify account.</li>
      </ul>

      <h3>Privacy & Process</h3>
      <p>
        Authentication is handled securely via OAuth 2.0 through Spotify. We read your Liked Songs exclusively to compute the intersection. Data is processed entirely in memory for the active session and is never stored, sold, or shared.
      </p>

      <h3>Open Source</h3>
      <p>
        trackvenn is open source. Review the code, report issues, or contribute on <a href="https://github.com/fuentesdaniel0/trackvenn" target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>
    </AboutContainer>
  )
}

export default About
