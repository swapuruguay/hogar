'use strict'

import express from 'express'
const router = express.Router()
//import dateFormat from 'dateformat-light'
import Bd from '../articulos'
import medidas from '../articulos/medidas'
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

  res.render('index-contable', {titulo: 'Módulo Contable'})
})

router.get('/nuevo', ensureAuth, async (req, res) => {
  let dbMedidas = new medidas()
  let lista = await dbMedidas.getMedidas()

  res.render('articulos-nuevo', {lista})
})

router.post('/', async (req, res) => {
  let db = new Bd()
  let art = req.body
  let result = db.save(art)
  res.send({result})
})

export default router
