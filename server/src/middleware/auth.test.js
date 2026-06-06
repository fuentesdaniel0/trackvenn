const { refreshTokenMiddleware } = require('./auth')
const spotifyService = require('../services/SpotifyService')

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should call next immediately if no tokens exist', async () => {
    const req = { cookies: {} }
    const res = {}
    const next = vi.fn()

    vi.spyOn(spotifyService, 'refreshTokens')

    await refreshTokenMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(spotifyService.refreshTokens).not.toHaveBeenCalled()
  })

  it('should set req.accessToken if already present', async () => {
    const req = { cookies: { access_token: 'valid-token' } }
    const res = {}
    const next = vi.fn()

    vi.spyOn(spotifyService, 'refreshTokens')

    await refreshTokenMiddleware(req, res, next)

    expect(req.accessToken).toBe('valid-token')
    expect(next).toHaveBeenCalled()
    expect(spotifyService.refreshTokens).not.toHaveBeenCalled()
  })

  it('should refresh token if access_token is missing but refresh_token exists', async () => {
    const req = { cookies: { refresh_token: 'valid-refresh' } }
    const res = { cookie: vi.fn() }
    const next = vi.fn()

    vi.spyOn(spotifyService, 'refreshTokens').mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      expiresIn: 3600,
    })

    await refreshTokenMiddleware(req, res, next)

    expect(spotifyService.refreshTokens).toHaveBeenCalledWith('valid-refresh')
    expect(req.accessToken).toBe('new-access')
    expect(res.cookie).toHaveBeenCalledTimes(2)
    expect(next).toHaveBeenCalled()
  })

  it('should call next and not crash if refresh fails', async () => {
    const req = { cookies: { refresh_token: 'invalid-refresh' } }
    const res = {}
    const next = vi.fn()

    vi.spyOn(spotifyService, 'refreshTokens').mockRejectedValue(
      new Error('Refresh failed'),
    )

    await refreshTokenMiddleware(req, res, next)

    expect(req.accessToken).toBeUndefined()
    expect(next).toHaveBeenCalled()
  })
})
