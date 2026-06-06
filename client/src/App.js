import React, { useState } from "react"
import styled from "@emotion/styled"
import {
  BrowserRouter as Router,
  Route,
  Switch,
  NavLink,
} from "react-router-dom"
import Home from "./components/Home"
import About from "./components/About"

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--accent-shadow);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ul {
    display: flex;
    gap: 30px;
    list-style: none;
    margin: 0;
    padding: 0;
    align-items: center;
  }

  a {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    transition: color 0.2s ease;

    &:hover {
      color: var(--text-primary);
    }

    &.active {
      color: var(--text-primary);
    }
  }
`

const Logo = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;

  span.icon {
    font-size: 30px;
    color: var(--accent-primary);
  }

  span.text {
    color: var(--text-primary);
  }
`

const MainContent = styled.main`
  flex: 1;
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
`

const BannerContainer = styled.div`
  max-height: ${props => props.isOpen ? "1000px" : "0"};
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-secondary);
  border-bottom: ${props => props.isOpen ? "1px solid var(--accent-shadow)" : "none"};
`

const TopNav = ({ isAboutOpen, toggleAbout, closeAbout }) => {
  return (
    <Nav>
      <NavLink exact to="/" onClick={closeAbout} style={{ textDecoration: 'none' }}>
        <Logo>
          <span className="icon" role="img" aria-label="intersection">
            ∩
          </span>
          <span className="text">trackvenn</span>
        </Logo>
      </NavLink>
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <ul>
          <li>
            <NavLink exact to="/" activeClassName="active" onClick={closeAbout}>Home</NavLink>
          </li>
          <li>
            <button 
              onClick={toggleAbout} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: isAboutOpen ? 'var(--text-primary)' : 'var(--text-secondary)', 
                fontWeight: 600, 
                fontSize: '16px',
                padding: 0
              }}
            >
              About
            </button>
          </li>
        </ul>
        <div id="topnav-actions" style={{ display: 'flex', gap: '15px' }}></div>
      </div>
    </Nav>
  )
}

const App = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <Container>
      <Router>
        <TopNav 
          isAboutOpen={isAboutOpen} 
          toggleAbout={() => setIsAboutOpen(!isAboutOpen)} 
          closeAbout={() => setIsAboutOpen(false)}
        />
        <BannerContainer isOpen={isAboutOpen}>
          <div style={{ padding: '40px' }}>
            <About />
          </div>
        </BannerContainer>
        <MainContent className="animate-fade-in-up">
          <Switch>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </MainContent>
      </Router>
    </Container>
  )
}

export default App
