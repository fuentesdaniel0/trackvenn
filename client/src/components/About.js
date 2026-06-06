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
        <li><strong>Connect:</strong> Link your Spotify account.</li>
        <li><strong>Intersect:</strong> Compare libraries to locate common tracks.</li>
        <li><strong>Export:</strong> Save the resulting shared tracks directly as a new playlist.</li>
      </ul>

      <h3>Privacy & Process</h3>
      <p>
        Authentication is handled securely through Spotify. We read your Liked Songs exclusively to compute library intersections. Your data is used strictly for this calculation and is never stored, sold, or shared beyond the active session.
      </p>
    </AboutContainer>
  )
}

export default About
