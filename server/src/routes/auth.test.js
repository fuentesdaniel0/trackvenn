const request = require('supertest')
const express = require('express')
const cookieParser = require('cookie-parser')
const authRouter = require('./auth')
const spotifyService = require('../services/SpotifyService')

const app = express()
app.use(cookieParser())
app.use('/', authRouter)

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /auth', () => {
    it('should return an auth URL and set oauth_state cookie', async () => {
      vi.spyOn(spotifyService, 'getAuthorizeUrl').mockReturnValue(
        'https://spotify.com/authorize',
      )

      const response = await request(app).get('/auth')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        authorized: false,
        authLink: 'https://spotify.com/authorize',
      })

      const cookies = response.headers['set-cookie']
      expect(cookies).toBeDefined()
      const stateCookie = cookies.find((c) =>
        c.startsWith('spotify_auth_state='),
      )
      expect(stateCookie).toBeDefined()
      expect(stateCookie).toContain('HttpOnly')
      expect(stateCookie).toContain('Secure')
      expect(stateCookie).toContain('SameSite=None')
    })
  })

  describe('GET /callback', () => {
    it('should redirect with error if state does not match', async () => {
      const response = await request(app)
        .get('/callback?code=mockcode&state=mismatched-state')
        .set('Cookie', ['spotify_auth_state=correct-state'])

      expect(response.status).toBe(302)
      expect(response.headers.location).toContain('error=state_mismatch')
    })

    it('should set access and refresh tokens on successful callback', async () => {
      vi.spyOn(spotifyService, 'exchangeCode').mockResolvedValue({
        accessToken: 'access-123',
        refreshToken: 'refresh-456',
        expiresIn: 3600,
      })

      const response = await request(app)
        .get('/callback?code=mockcode&state=correct-state')
        .set('Cookie', ['spotify_auth_state=correct-state'])

      expect(response.status).toBe(302)
      // It should redirect to client
      expect(response.headers.location).toBe(
        `https://127.0.0.1:${process.env.CLIENT_PORT || 3000}/`,
      )

      const cookies = response.headers['set-cookie']
      expect(cookies).toBeDefined()
      const accessCookie = cookies.find((c) =>
        c.startsWith('access_token=access-123'),
      )
      const refreshCookie = cookies.find((c) =>
        c.startsWith('refresh_token=refresh-456'),
      )
      expect(accessCookie).toBeDefined()
      expect(refreshCookie).toBeDefined()
    })
  })
})
