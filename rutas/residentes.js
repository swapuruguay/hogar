'use strict'

import express from 'express'
const router = express.Router()
import formData from 'express-form-data'
import Bd from '../residentes'


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

router.get('/',  (req, res) => {
  res.render('index-residentes', {titulo: 'Area Residentes'})
})

router.get('/nuevo', (req, res) => {
  res.render('residentes-nuevo')
})

router.post('/add', async (req, res) => {
  const db = new Bd()
  let residente = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    documento: req.body.documento,
    fecha_nacimiento: convertFecha(req.body.nacimiento),
    mutualista: req.body.mutualista,
    cuidados: req.body.cuidados,
    telefono: req.body.telefono,
    familiar: req.body.referente,
    estado: 1,
    fecha_ingreso: convertFecha(req.body.ingreso)
  }
  console.log(residente)
  let result = await db.saveResidente(residente)
  res.send(result)
})

router.post('/editar', async function(req, res) {
  let db = new Bd()
  let residente = {}
  residente = req.body
  residente.id_residente = residente.id
  residente.fecha_nacimiento = convertFecha(req.body.nacimiento)
  residente.fecha_ingreso = convertFecha(req.body.ingreso)
  delete residente.ingreso
  delete residente.nacimiento
  delete residente.id
  let result = await db.saveResidente(residente)
  res.send(result)
  db.disconnect()
})

router.get('/editar/:id', ensureAuth, async function  (req, res) {
  let db = new Bd()
  let id = req.params.id

  let residente = (await db.getResidente(id))[0]
  residente.fecha_ingreso = revertirFecha(residente.fecha_ingreso)
  residente.fecha_nacimiento = revertirFecha(residente.fecha_nacimiento)

  db.disconnect()
  res.render('residentes-edit', {residente})

})

router.get('/listar', ensureAuth, async (req, res) => {
  try {
    let db = new Bd()
    let contris = await db.getResidentes(' WHERE estado = 1')
    db.disconnect()
    res.render('listar-residentes', {title: 'Listado de Residentes', contris})

  } catch(err) {
    console.log(err.message)
  }
})

router.get('/eliminar/:id', async function(req, res) {
  let db = new Bd()
  let id = req.params.id
  await db.delResidente(id)
  db.disconnect()
  res.redirect('/residentes/listar')
})

router.post('/filtrar', async function (req, res) {
  let db = new Bd()
  let texto = req.body.texto
  let contris = await db.getResidentes(`WHERE apellido LIKE '${texto}%' AND estado = 1`, 'ORDER BY apellido, nombre')
  
  db.disconnect()
  res.send({ contris })
})

function convertFecha(fecha) {
  console.log(fecha)
  const espanol = fecha.split('/')
  return `${espanol[2]}-${espanol[1]}-${espanol[0]}`
}

function revertirFecha(row) {
  let fecha = new Intl.NumberFormat("es-UY", {minimumIntegerDigits: 2}).format(row.getDate()) + '/'
  + new Intl.NumberFormat("es-UY", {minimumIntegerDigits: 2}).format((row.getMonth() + 1)) + '/' + row.getFullYear()

  return fecha
}

export default router
