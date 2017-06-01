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

function ensureAuth(req, res, next) {
    if(req.isAuthenticated()) {
        if(req.user.perfil == 1) {
        req.user.habilitado = true
      }
        return next()
    }
    res.redirect('/login')
}

router.get('/', ensureAuth, function(req, res) {

  res.render('index-contribuyentes', {titulo: 'Area contribuyentes'})
})

router.get('/listar', ensureAuth, async function  (req, res) {

  try {
    let db = new Bd()
    let contris = await db.getContribuyentes(' WHERE estado = 1')
    db.disconnect()
    res.render('listar-contribuyentes', {title: 'Listado de contribuyentes', contris: contris})

  } catch(err) {
    console.log(err.message)
  }
  })

router.get('/nuevo', ensureAuth,  async function  (req, res) {
  let db = new Bd()
  let ciclos = await db.getCiclos()
  let categorias = await db.getCategorias()
  db.disconnect()
  res.render('contribuyentes-nuevo', {ciclos, categorias})
})

router.get('/prueba', ensureAuth, async function  (req, res) {
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

router.post('/filtrar', async function (req, res) {
  let db = new Bd()
  let texto = req.body.texto
  let contris = await db.getContribuyentes(`WHERE apellido LIKE '${texto}%'`, 'ORDER BY apellido, nombre')
  //console.log(contris)
  res.send({ contris })
})

router.post('/add', async function(req, res) {
  let db = new Bd()
  let contri = {}
  contri = req.body
  contri.estado = 1
  contri.fecha_alta = '2017-05-01'
  contri.id_ciclo_fk = contri.ciclo
  delete contri.ciclo
  delete contri.id
  console.log(contri)
  let result = await db.saveContribuyente(contri)
  res.send(result)
  db.disconnect()
})

router.get('/editar/:id', ensureAuth, async function  (req, res) {
  let db = new Bd()
  let id = req.params.id

  let contri = (await db.getContribuyente(id))[0]
  let categorias = await db.getCategorias()
  categorias = categorias.map(cat => {
    cat.selected = ''
    if(contri.id_categoria_fk == cat.id_categoria) {
      cat.selected = 'SELECTED'
    }
    return cat
  })
 // let contri = contris[0]

  let ciclos = await db.getCiclos()
  ciclos = ciclos.map(c => {
    c.selected = ''
    if(contri.id_ciclo_fk == c.id_ciclo) {
      c.selected = 'SELECTED'
    }
    return c
  })
  db.disconnect()
  res.render('contribuyentes-edit', {contri, ciclos, categorias})

})

router.get('/saldo/:id', ensureAuth, async function (req, res) {
  let id = req.params.id
  let db = new Bd()
  let result = await db.getCuotasPendientes(id)
  db.disconnect()
  res.send(result)

})

router.post('/editar', async function(req, res) {
  let db = new Bd()
  let contri = {}
  contri = req.body
  contri.id_contribuyente = contri.id
  contri.id_cliclo_fk
  delete contri.ciclo
  delete contri.id
  console.log(contri)
  let result = await db.saveContribuyente(contri)
  res.send(result)
  db.disconnect()
})

router.get('/generar', ensureAuth, function(req, res) {
  res.render('cuotas-generar')
})

router.get('/pagar', ensureAuth, function(req, res) {
  res.render('contribuyentes-pagar')
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
    filas.push([c.id_contribuyente, mes, anio, cat.importe, 1, fecha])
  }
  //console.log(filas)
  await db.generarCuotas(filas)
  res.send('Mes generado con éxito')

})

router.post('/pagar', async (req, res) => {
  let fecha = req.body.fecha.split('/')
  fecha = `${fecha[2]}-${fecha[1]}-${fecha[0]}`
  let cuota = {
    id_contribuyente: req.body.id_contribuyente,
    fecha
  }
  //console.log(cuota)
  let db = new Bd()
  let result = await db.pagarCuota(cuota)
//  console.log(result)
  db.disconnect()

  res.send({filas: result.affectedRows})
})

router.get('/cargar', ensureAuth, (req, res) => {
  res.render('cargar-cuota')
})

router.post('/agrega' ,async (req, res) => {
//console.log(req.body)
  let fecha = `${req.body.anio}-${req.body.mes}-01`
  let arreglo = []
  arreglo.push([req.body.id_contribuyente, req.body.mes, req.body.anio, req.body.importe, 1, fecha])
  let db = new Bd()
  let result = await db.generarCuotas(arreglo)
  res.send({ok: 'Ok'})
})

router.get('/:id', ensureAuth, async (req, res) => {
  let id = req.params.id
  let db = new Bd()
  let result = (await db.getContribuyente(id))[0]
  if(result) {
      res.send(result)
  } else {
    res.send({nombre: '', apellido: ''})
  }


})



module.exports = router
