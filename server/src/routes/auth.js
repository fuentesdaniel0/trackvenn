const { Router } = require('express')
const crypto = require('crypto')
const spotifyService = require('../services/SpotifyService')

const router = Router()

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
}

const clientUrlStr = process.env.CLIENT_URL || 'https://127.0.0.1:3000'
const clientUrl = clientUrlStr.split(',')[0]

router.get('/auth', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex')
  res.cookie('spotify_auth_state', state, cookieConfig)

  const authLink = spotifyService.getAuthorizeUrl(state)

  res.status(200).json({
    authorized: !!req.cookies.access_token,
    authLink,
  })
})

router.get('/callback', async (req, res) => {
  const { code, state } = req.query
  const storedState = req.cookies ? req.cookies.spotify_auth_state : null

  if (state === null || state !== storedState) {
    return res.redirect(
      302,
      `${clientUrl}/?error=state_mismatch`,
    )
  }

  res.clearCookie('spotify_auth_state', cookieConfig)

  try {
    const data = await spotifyService.exchangeCode(code)

    res.cookie('access_token', data.accessToken, {
      ...cookieConfig,
      maxAge: data.expiresIn * 1000,
    })

    res.cookie('refresh_token', data.refreshToken, cookieConfig)

    res.redirect(302, `${clientUrl}/`)
  } catch (err) {
    console.log('Something went wrong authenticating!', err)
    res.redirect(302, `${clientUrl}/?error=auth_failed`)
  }
})

router.get('/reset', (req, res) => {
  res.clearCookie('access_token', cookieConfig)
  res.clearCookie('refresh_token', cookieConfig)

  const state = crypto.randomBytes(16).toString('hex')
  res.cookie('spotify_auth_state', state, cookieConfig)
  const authLink = spotifyService.getAuthorizeUrl(state)

  res.status(200).json({ authorized: false, authLink })
})

module.exports = router
