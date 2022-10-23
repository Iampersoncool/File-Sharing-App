if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const express = require('express')
const compression = require('compression')
const multer = require('multer')
const Files = require('./Files')
const path = require('path')
const helmet = require('helmet')

const mongoose = require('mongoose')

const app = express()

app.use(compression())
app.use(helmet())

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

app.use('/static', express.static(path.join(__dirname, '/public')))
app.set('view engine', 'ejs')

app.get('/', async (req, res) => {
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

    res.download(path.join('uploads', filePath), originalFileName)
  } catch (e) {
    // res.status(404).send('File Not Found.')
  }
})

app.listen(PORT, () => console.log(`app listening on port ${PORT}`))
