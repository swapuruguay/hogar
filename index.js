const express = require('express')
const bodyParser = require('body-parser')
const hbs = require('express-handlebars')
const handleb = require('handlebars')
const contri = require('./rutas/contribuyentes')
const fs = require('fs')
const app = express()

const session = require('express-session')
const cookie = require('cookie-parser')
const flash = require('connect-flash')

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}))
app.set('view engine', 'hbs')

handleb.registerPartial('footer', fs.readFileSync(__dirname + '/views/partials/footer.hbs', 'utf8'))
handleb.registerPartial('header', fs.readFileSync(__dirname + '/views/partials/header.hbs', 'utf8'))


app.use(express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());

app.use(session({
    secret: 'abc12345',
    resave: false,
    saveUninitialized: true
}))

const port = process.env.port || 5501

app.use('/contribuyentes', contri)

app.get('/', function(req, res) {
  
  res.render('index')
})

app.listen(port, function() {
  console.log(`Escuchando puerto ${port}`)
})
