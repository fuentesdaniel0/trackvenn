const express = require('express')
const cookieParser = require('cookie-parser')
const { json } = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()

// Trust proxy for secure cookies behind Cloud Run
app.set('trust proxy', 1)

// Secure HTTP headers
app.use(helmet())

// Rate limiting to prevent brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
})
app.use(limiter)

// Restrict CORS to specific client domains
const allowedOrigins = [
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : []),
  'https://localhost:3000',
  'https://127.0.0.1:3000'
].filter(Boolean)

app.use(
  cors({
    origin: function (origin, callback) {
      // In development, allow all origins so local network testing works
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true)
      }
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Blocked by CORS'))
      }
    },
    credentials: true,
  }),
)
const { refreshTokenMiddleware } = require('./middleware/auth')
const authRouter = require('./routes/auth')

const tracksRouter = require('./routes/tracks')

app.use(cookieParser(process.env.COOKIE_SECRET || 'spotter-secret-key-2026'))

// CSRF Mitigation: Enforce Content-Type for mutating requests
app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    if (req.method === 'DELETE' && (!req.headers['content-length'] || req.headers['content-length'] === '0')) {
      return next();
    }
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ error: 'Unsupported Media Type. Expected application/json' });
    }
  }
  next();
});

app.use(json())
app.use(refreshTokenMiddleware)

app.use('/', authRouter)
app.use('/tracks', tracksRouter)

module.exports = app
