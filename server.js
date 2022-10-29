if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const { getUserInfo } = require('@replit/repl-auth')
const express = require('express')
const multer = require('multer')
const Files = require('./Files')
const path = require('path')
const mongoose = require('mongoose')

const app = express()
// app.use(express.urlencoded({ extended: false }))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/public')))

if (process.env.NODE_ENV === 'production') {
  const compression = require('compression')
  const helmet = require('helmet')

  app.use(compression())
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: false,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'replit.com/public/js/repl-auth-v2.js'],
        styleSrc: ["'self'"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    })
  )
}

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 41943040, //40 megabytes
  },
})
const PORT = process.env.PORT || 3000

console.log('NODE_ENV: ' + process.env.NODE_ENV)

mongoose.connect(process.env.DATABASE_URL)

const db = mongoose.connection
db.on('error', (err) => console.log(err))
db.on('open', () => console.log('connected to db.'))

app.get('/', async (req, res) => {
  res.render('index')
})

app.get('/admin', async (req, res) => {
  const user = getUserInfo(req)
  const authorized = user?.id === process.env.OWNER_USER_ID ? true : false
  let files

  if (authorized) files = await Files.find()

  res.render('showAll', { files, authorized })
})

app.post('/upload/new', (req, res) => {
  upload.single('uploadedFile')(req, res, async (err) => {
    if (err) return res.status(500).send('Internal server error')

    const { filename, originalname } = req.file

    const createdFile = await Files.create({
      originalFileName: originalname,
      path: filename,
    })

    console.log(`https://${req.headers.host}/files/${createdFile.uuid}`)

    res.render('download', {
      fileName: createdFile.originalFileName,
      link: `https://${req.headers.host}/files/${createdFile.uuid}`,
    })
  })
})

app.get('/files/:id', async (req, res) => {
  try {
    const file = await Files.findOne({
      uuid: req.params.id,
    })

    res.download(`./uploads/${file.path}`, file.originalFileName)
  } catch (e) {
    res.status(404).send('File Not Found.')
  }
})

app.listen(PORT, () => console.log(`app listening on port ${PORT}`))
