'use strict'

const express = require('express')
const router = express.Router()
const Bd = require('../contribuyentes')
const config = require('../config')
const formData = require('express-form-data')

// parsing data with connect-multiparty. Result set on req.body and req.files
router.use(formData.parse());
// clear all empty files
router.use(formData.format());
// change file objects to node stream.Readable
router.use(formData.stream());
// union body and files
router.use(formData.union());

router.get('/', function(req, res) {

  res.render('index-contribuyentes', {titulo: 'Area contribuyentes'})
})

router.get('/listar', async function  (req, res) {

  try {
    let db = new Bd()
    let contris = await db.getContribuyentes(' WHERE estado = 1')
    db.disconnect()
    res.render('listar-contribuyentes', {title: 'Listado de contribuyentes', contris: contris})

  } catch(err) {
    console.log(err.message)
  }
  })

router.get('/nuevo',  async function  (req, res) {
  let db = new Bd()
  let ciclos = await db.getCiclos()
  db.disconnect()
  res.render('contribuyentes-nuevo', {ciclos: ciclos})
})

router.get('/prueba', async function  (req, res) {
  let db = new Bd()
  let fecha = new Date().toJSON().slice(0,10)
  let contris = []
  for(let i = 0; i < 100; i++) {
    contris.push(['Contri'+i, 'Apell'+i, 'Domicilio'+i, 1, 1, 0, 1, fecha, 'telefono'+i])
  }

//  console.log(contris[0])

 await db.generarCli(contris)
  //res.send('Mes generado con éxito')
  res.end()
})

router.get('/editar/:id', async function  (req, res) {
  let db = new Bd()
  let id = req.params.id

  let contri = (await db.getContribuyente(id))[0]
 // let contri = contris[0]

  let ciclos = await db.getCiclos()
  db.disconnect()
  res.render('contribuyentes-edit', {contri: contri, ciclos: ciclos})

})

router.get('/generar', function(req, res) {
  res.render('cuotas-generar')
})

router.get('/preimprimimr', function(req, res) {
  res.render('cuotas-imprimir')
})

router.post('/imprimir', async function (req, res) {
  let db = new Bd()
  let {mes, anio} = req.body

  let cuotas = await db.getCuotas(mes, anio)
  res.send(cuotas)

})

router.post('/generar', async function  (req, res) {
  let db = new Bd()
  let {mes, anio} = req.body
  let contris = await db.getContribuyentes(' WHERE estado = 1')
  let fecha = new Date().toJSON().slice(0,10)
  let filas = []
  /*
  await Promise.all(contris.forEach(async function(el) {
    let cat = (await db.getCategoria(el.id_categoria_fk))[0]
    filas.push([el.id_contribuyente, mes, anio, cat.importe, 0, fecha])

  }))
  */
  for(let c of contris) {
    let cat = (await db.getCategoria(c.id_categoria_fk))[0]
    filas.push([c.id_contribuyente, mes, anio, cat.importe, 0, fecha])
  }
  //console.log(filas)
  await db.generarCuotas(filas)
  res.send('Mes generado con éxito')

})

module.exports = router
