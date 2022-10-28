if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const { getUserInfo } = require('@replit/repl-auth')
const express = require('express')
const multer = require('multer')
const Files = require('./Files')
const path = require('path')
const mongoose = require('mongoose')

const app = express()
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, '/public')))

if (process.env.NODE_ENV === 'production') {
  const compression = require('compression')
  const helmet = require('helmet')

  app.use(compression())
  app.use(helmet())
}

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10000000,
  },
})
const PORT = process.env.PORT || 3000

console.log('NODE_ENV: ' + process.env.NODE_ENV)

mongoose.connect(process.env.DATABASE_URL)

const db = mongoose.connection
db.on('error', (err) => console.log(err))
db.on('open', () => console.log('connected to db.'))

app.get('/', async (req, res) => {
  const user = getUserInfo(req)

  const files = await Files.find({})
  res.render('index', { files })
})

app.post('/upload/new', upload.single('uploadedFile'), async (req, res) => {
  try {
    const { filename, originalname } = req.file
    await Files.create({
      originalFileName: originalname,
      path: filename,
    })
    res.redirect('/')
  } catch (e) {
    res.status(500).send('Error uploading file.')
  }
})

app.get('/files/:id', async (req, res) => {
  try {
    const { path: filePath, originalFileName } = await Files.findById({
      _id: req.params.id,
    })

    res.download(`./uploads/${filePath}`, originalFileName)
  } catch (e) {
    res.status(404).send('File Not Found.')
  }
})

app.listen(PORT, () => console.log(`app listening on port ${PORT}`))
