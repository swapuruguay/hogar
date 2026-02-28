import express from 'express'
import { engine } from 'express-handlebars'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import passport from 'passport'
import session from 'express-session'
import flash from 'connect-flash'
import bcrypt from 'bcryptjs'
import contri from './rutas/contribuyentes.js'
import resi from './rutas/residentes.js'
import contable from './rutas/contable.js'
import articulos from './rutas/articulos.js'
import auth from './auth/index.js'
import Db from './bd/index.js'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

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

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use((req, res, next) => {
  res.locals.datos = { user: req.user || null }
  next()
})

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.perfil == 1) {
      req.user.habilitado = true
    }
    return next()
  }
  res.redirect('/login')
}

app.use('/contribuyentes', contri)
app.use('/residentes', resi)
app.use('/contable', contable)
app.use('/articulos', articulos)

app.get('/', ensureAuth, (req, res) => {
  res.render('index')
})

app.get('/login', (req, res) => {
  res.locals.errors = req.flash()
  res.render('login', {
    errors: res.locals.errors,
    layout: 'login'
  })
})

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
)

app.get('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error)
    }
    res.redirect('/login')
  })
})

app.get('/cuenta/password', ensureAuth, (req, res) => {
  res.render('cuenta-password', {
    error: req.flash('error'),
    ok: req.flash('ok')
  })
})

app.get('/cuenta/datos', ensureAuth, (req, res) => {
  res.render('cuenta-datos', {
    user: req.user,
    error: req.flash('error'),
    ok: req.flash('ok')
  })
})

app.post('/cuenta/datos', ensureAuth, async (req, res) => {
  const nombre = String(req.body.nombre || '').trim()
  const apellido = String(req.body.apellido || '').trim()
  const username = String(req.body.username || '').trim()

  if(!nombre || !apellido || !username) {
    req.flash('error', 'Nombre, apellido y usuario son obligatorios.')
    return res.redirect('/cuenta/datos')
  }
  if(!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
    req.flash('error', 'Usuario inválido. Use 3-30 caracteres: letras, números, punto, guion o guion bajo.')
    return res.redirect('/cuenta/datos')
  }

  const db = new Db()
  const duplicado = await db.getUser(` WHERE username = '${username}' AND id_usuario <> ${Number(req.user.id_usuario)}`)
  if(duplicado.length > 0) {
    await db.disconnect()
    req.flash('error', 'El nombre de usuario ya está en uso.')
    return res.redirect('/cuenta/datos')
  }

  await db.updateUserData(Number(req.user.id_usuario), nombre, apellido, username)
  await db.disconnect()

  req.user.nombre = nombre
  req.user.apellido = apellido
  req.user.username = username
  req.flash('ok', 'Datos actualizados correctamente.')
  res.redirect('/cuenta/datos')
})

app.post('/cuenta/password', ensureAuth, async (req, res) => {
  const { actual, nueva, confirmar } = req.body

  if (!actual || !nueva || !confirmar) {
    req.flash('error', 'Complete todos los campos.')
    return res.redirect('/cuenta/password')
  }
  if (nueva.length < 6) {
    req.flash('error', 'La nueva contraseña debe tener al menos 6 caracteres.')
    return res.redirect('/cuenta/password')
  }
  if (nueva !== confirmar) {
    req.flash('error', 'La confirmación no coincide.')
    return res.redirect('/cuenta/password')
  }

  const db = new Db()
  const user = (await db.getUser(` WHERE id_usuario = ${Number(req.user.id_usuario)}`))[0]
  if (!user || !bcrypt.compareSync(actual, user.password)) {
    await db.disconnect()
    req.flash('error', 'La contraseña actual es incorrecta.')
    return res.redirect('/cuenta/password')
  }

  const hash = bcrypt.hashSync(nueva, 10)
  await db.updateUserPassword(user.id_usuario, hash)
  await db.disconnect()
  req.user.password = hash
  req.flash('ok', 'Contraseña actualizada correctamente.')
  res.redirect('/cuenta/password')
})

const port = Number(process.env.PORT) || 5501
app.listen(port, () => {
  console.log(`Escuchando puerto ${port}`)
})
