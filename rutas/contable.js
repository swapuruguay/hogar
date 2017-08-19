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

router.post('/pagos', async (req, res) => {
  let db = new Bd()
  let movimiento = req.body
  movimiento.id_tipo_fk = 2
  let result = await db.saveMovimiento(movimiento)
  console.log(result)
  console.log(movimiento)
  res.send({res: req.body})
})

router.get('/', ensureAuth, (req, res) => {

  res.render('index-contable', {titulo: 'Módulo Contable'})
})

router.get('/caja', ensureAuth, async (req, res) => {
  let db = new Bd()
  let caja = (await db.getSaldoCaja())[0]
  console.log(caja)
  res.render('caja', {caja})
})

router.get('/pagos', ensureAuth, (req, res) => {
  res.render('pagos', {titulo: 'Pago de gastos'})
})

export default router
