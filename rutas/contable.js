'use strict'

import express from 'express'
const router = express.Router()
import dateFormat from 'dateformat-light'
import Bd from '../contable'
import PDFDocument from 'pdfkit'
//import BDIng from '../ingresos'
import formData from 'express-form-data'
import letras from '../utils/nrosALetras.js'
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
  res.render('caja', {caja})
})

router.get('/consultas', ensureAuth, async (req, res) => {
  res.render('consultas')
})

router.post('/consultas', async (req, res) => {
  const db = new Bd()
  
  let listado = await db.getMovimientos()
  res.send({listado})
})


router.get('/recibo/:id', async (req, res) => {
  dateFormat.i18n = {
     dayNames: [
          'Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab',
          'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
      ],
      monthNames: [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic',
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ],
      timeNames: [
          'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
      ]
  }
  dateFormat.masks.largo = 'd " de " mmmm " de " yyyy'
    
  let db = new Bd()
  let movimiento = (await db.getMovimientos(` WHERE id_movimiento = ${req.params.id}`))[0]
  let fecha = movimiento.fecha.getFullYear() + '-'
  + new Intl.NumberFormat("es-UY", {minimumIntegerDigits: 2}).format((movimiento.fecha.getMonth() + 1)) + '-' + new Intl.NumberFormat("es-UY", {minimumIntegerDigits: 2}).format(movimiento.fecha.getDate())
  
  // Create a document
  let doc = new PDFDocument
  
  // Pipe its output somewhere, like to a file or HTTP response
  // See below for browser usage
  res.setHeader('Content-disposition', 'attachment; filename="nombre.pdf"')
  
  res.setHeader('Content-type', 'application/pdf')
  
  doc.font('fonts/cabin/Cabin-Regular.ttf', 18)
    .fontSize(25)
    .text('RECIBO DE ENTREGA DE DINERO', 100, 50)
  doc.fontSize(15)
    .text(`Lascano, ${dateFormat(fecha, 'largo', true)}`, 100, 100)
  doc.moveDown()
    .text(`Recibí de Hogar de Ancianos de Lascano la suma de $ ${Math.abs(movimiento.importe)} (${letras(Math.abs(movimiento.importe))})
          por concepto de Entrega para depósito`)
    
  
  doc.moveDown()
  doc.moveDown()
  doc.moveDown()
  doc.moveDown()
  doc.moveDown()
  doc.moveDown()

    .text('__________________________', 300)
  doc.moveDown()
    .text('Firma', 400)
    
  /* doc.moveDown()
    .fillColor('black')
    .fontSize(15)
    .text('El contenido digamos que puede ser cualquier cosa', {
      align: 'justify',
      indent: 30,
      height: 300,
      ellipsis: true
    }) */
        
  doc.pipe(res)
    
  doc.end()
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
  if(mov.id_tipo_fk == 6) {
    result.link = true
  }
  res.send({result})
})

export default router
