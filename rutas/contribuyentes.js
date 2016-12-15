const express = require('express')
const router = express.Router()
const Bd = require('../contribuyentes')
const config = require('../config')
const async = require('asyncawait/async')
const await = require('asyncawait/await')
const formData = require('express-form-data')

// parsing data with connect-multiparty. Result set on req.body and req.files 
router.use(formData.parse());
// clear all empty files 
router.use(formData.format());
// change file objects to node stream.Readable  
router.use(formData.stream());
// union body and files 
router.use(formData.union());

router.get('/', async(function(req, res) {
  
  res.render('index-contribuyentes')
}))

router.get('/listar', async(function(req, res) {
  let db = new Bd()
  let contris = await(db.getContribuyentes(' WHERE estado = 1'))
  db.disconnect()
  res.render('listar-contribuyentes', {title: 'Listado de contribuyentes', contris: contris})
}))

router.get('/nuevo', async(function(req, res) {
  let db = new Bd()
  let ciclos = await(db.getCiclos())
  db.disconnect()
  res.render('contribuyentes-nuevo', {ciclos: ciclos})
}))

router.get('/editar/:id', async(function(req, res) {
  let db = new Bd()
  let id = req.params.id

  let contri = await(db.getContribuyente(id))[0]
  let ciclos = await(db.getCiclos())
  db.disconnect()
  res.render('contribuyentes-edit', {contri: contri, ciclos: ciclos})

}))

router.get('/generar', function(req, res) {
  res.render('cuotas-generar')
})

router.post('/generar', async(function(req, res) {
  let db = new Bd()
  let mes = req.body.mes
  let anio = req.body.anio
  let contris = await(db.getContribuyentes(' WHERE estado = 1'))
  let fecha = new Date().toJSON().slice(0,10)
  let filas = []
  contris.forEach(function(el) {
    filas.push([el.id_contribuyente, mes, anio, 0, fecha])
  })
  await(db.generarCuotas(filas))
  res.send('Mes generado con éxito')

}))

module.exports = router