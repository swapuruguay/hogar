import express from 'express'
import bodyParser from 'body-parser'
import hbs from 'express-handlebars'
import handleb from 'handlebars'
import contri from './rutas/contribuyentes'
import resi from './rutas/residentes'
import contable from './rutas/contable'
import articulos from './rutas/articulos'
import fs from 'fs'
import passport from 'passport'
const app = express()
import auth from './auth'
import session from 'express-session'
import flash from 'connect-flash'

app.use(session({
  secret: 'abc12345',
  resave: false,
  saveUninitialized: true
}))

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())


passport.use(auth.strategy)
passport.serializeUser(auth.serialize)
passport.deserializeUser(auth.deserialize)

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}))
app.set('view engine', 'hbs')

handleb.registerPartial('footer', fs.readFileSync(__dirname + '/views/partials/footer.hbs', 'utf8'))
handleb.registerPartial('header', fs.readFileSync(__dirname + '/views/partials/header.hbs', 'utf8'))


app.use(express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

function ensureAuth(req, res, next) {
  if(req.isAuthenticated()) {
    if(req.user.perfil == 1) {
      req.user.habilitado = true
    }
    return next()
  }
  res.redirect('/login')
}

app.use(session({
  secret: 'abc12345',
  resave: false,
  saveUninitialized: true
}))

const port = process.env.port || 5501

app.use('/contribuyentes', contri)
app.use('/residentes', resi)
app.use('/contable', contable)
app.use('/articulos', articulos)

app.get('/', ensureAuth, function(req, res) {

  res.render('index')
})

app.get('/login', function(req, res) {
  res.locals.errors = req.flash()
  //  console.log(res.locals.errors);
  res.render('login', {
    errors: res.locals.errors, layout: 'login'
  })
  //res.render('login', {layout: 'login'})
})

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
    //failureFlash: 'Invalid username or password.'
  })
)

app.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/login')
})

app.listen(port, function() {
  console.log(`Escuchando puerto ${port}`)
})
