const spotifyService = require('../services/SpotifyService')

const cookieConfig = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
}

const refreshTokenMiddleware = async (req, res, next) => {
  let accessToken = req.cookies && req.cookies.access_token
  const refreshToken = req.cookies && req.cookies.refresh_token

  if (!accessToken && refreshToken) {
    try {
      const data = await spotifyService.refreshTokens(refreshToken)
      accessToken = data.accessToken
      res.cookie('access_token', accessToken, {
        ...cookieConfig,
        maxAge: data.expiresIn * 1000,
      })
      if (data.refreshToken) {
        res.cookie('refresh_token', data.refreshToken, cookieConfig)
      }
    } catch (err) {
      console.log('Could not refresh token', err.message)
    }
  }

  if (accessToken) {
    req.accessToken = accessToken
  }

  next()
}

module.exports = { refreshTokenMiddleware }
