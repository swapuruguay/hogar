'use strict'

import express from 'express'
const router = express.Router()
//import dateFormat from 'dateformat-light'
import Bd from '../articulos/index.js'
import medidas from '../articulos/medidas/index.js'
//import PDFDocument from 'pdfkit'
//import BDIng from '../ingresos'
import formData from 'express-form-data'
// parsing data with connect-multiparty. Result set on req.body and req.files
router.use(formData.parse())
// clear all empty files
router.use(formData.format())
// change file objects to node stream.Readable
router.use(formData.stream())
// union body and files
router.use(formData.union())

function ensureAuth(req, res, next) {
  if(req.isAuthenticated()) {
    if(req.user.perfil == 1) {
      req.user.habilitado = true
    }
    return next()
  }
  res.redirect('/login')
}

router.get('/', ensureAuth, (req, res) => {
  res.redirect('/articulos/stock')
})

router.get('/alta', ensureAuth, (req, res) => {
  res.redirect('/articulos/nuevo')
})

router.get('/stock', ensureAuth, (req, res) => {
  res.redirect('/articulos/listar')
})

router.get('/nuevo', ensureAuth, async (req, res) => {
  const dbMedidas = new medidas()
  const lista = await dbMedidas.getMedidas()
  await dbMedidas.disconect()

  res.render('articulos-nuevo', {lista, articulo: { id_articulo: 0 }})
})

router.get('/listar', ensureAuth, async (req, res) => {
  const db = new Bd()
  const articulos = await db.getArticulos('', '')
  await db.disconect()

  res.render('articulos-listar', {articulos})
})

router.post('/listar', ensureAuth, async (req, res) => {
  const texto = String(req.body.texto || '').toLowerCase().trim()
  const db = new Bd()
  const articulos = await db.getArticulos('', '')
  await db.disconect()

  if (!texto) {
    return res.send({articulos})
  }

  const filtrados = articulos.filter((articulo) => {
    return Object.values(articulo).some((value) => {
      if (value === null || value === undefined) {
        return false
      }
      return String(value).toLowerCase().includes(texto)
    })
  })

  res.send({articulos: filtrados})
})

router.get('/editar/:id', ensureAuth, async (req, res) => {
  const db = new Bd()
  const articulo = (await db.getArticulo(req.params.id))[0]
  await db.disconect()

  const dbMedidas = new medidas()
  const lista = await dbMedidas.getMedidas()
  await dbMedidas.disconect()

  const idMedidaSeleccionada = articulo.id_medida_fk || articulo.medida || 0
  const listaConSelected = lista.map((m) => ({
    ...m,
    selected: Number(m.id_medida) === Number(idMedidaSeleccionada) ? 'selected' : ''
  }))

  res.render('articulos-nuevo', {lista: listaConSelected, articulo})
})

router.post('/', async (req, res) => {
  const db = new Bd()
  const art = req.body
  const result = await db.save(art)
  await db.disconect()
  res.send({result})
})

router.post('/editar', ensureAuth, async (req, res) => {
  const db = new Bd()
  const art = req.body
  art.id_articulo = Number(art.id_articulo || art.id || 0)
  delete art.id
  const result = await db.save(art)
  await db.disconect()

  res.send({result})
})

router.get('/eliminar/:id', ensureAuth, async (req, res) => {
  const db = new Bd()
  await db.delete(req.params.id)
  await db.disconect()
  res.redirect('/articulos/listar')
})

export default router
