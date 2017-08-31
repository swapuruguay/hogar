 'use strict'

import express from 'express'
const router = express.Router()
import Bd from '../contable'
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

router.get('/caja', ensureAuth, async (req, res) => {
  let db = new Bd()
  let caja = (await db.getSaldoCaja())[0]
  console.log(caja)
  res.render('caja', {caja})
})

router.get('/consultas', ensureAuth, async (req, res) => {
  res.render('consultas')
})

router.get('/movimientos', ensureAuth, async (req, res) => {
  let db = new Bd()
  let tipos = await db.getTipos()
  tipos = tipos.filter(t => {
    return t.tipo !== 'Cuota'
  })
  res.render('movimientos', {titulo: 'Movimientos de caja', tipos})
})

router.post('/movimientos', async (req, res) => {
  let db = new Bd()
  let mov = req.body
  let result = await db.saveMovimiento(mov)
  console.log(result)
  res.send({result})
})

export default router
