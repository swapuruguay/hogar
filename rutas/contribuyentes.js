'use strict'

import express from 'express'
const router = express.Router()
import Bd from '../contribuyentes/index.js'
import BDIng from '../contable/index.js'
import PDFDocument from 'pdfkit'
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

router.get('/', ensureAuth, function(req, res) {

  res.render('index-contribuyentes', {titulo: 'Area contribuyentes'})
})

router.get('/listar', ensureAuth, async function(req, res) {

  try {
    let db = new Bd()
    let contris = await db.getContribuyentes(' WHERE estado = 1')
    db.disconnect()
    res.render('listar-contribuyentes', {title: 'Listado de contribuyentes', contris: contris})

  } catch(err) {
    console.log(err.message)
    res.end('Ocurrio un error')
  }
})

router.get('/deudores', async function(req, res) {
  try {
    let db = new Bd()
    let contris = await db.getDeudores()
    db.disconnect()
    res.render('listar-deudores', {title: 'Listado de deudores', contris})

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

  await db.generarCli(contris)
  db.disconnect()
  //res.send('Mes generado con éxito')
  res.end()
})

router.post('/filtrar', async function (req, res) {
  let db = new Bd()
  let texto = req.body.texto
  let contris = await db.getContribuyentes(`WHERE apellido LIKE '${texto}%' AND estado = 1`, 'ORDER BY apellido, nombre')
  db.disconnect()
  //console.log(contris)
  res.send({ contris })
})

router.post('/add', async function(req, res) {
  let db = new Bd()
  let contri = {}
  contri = req.body
  contri.estado = 1
  contri.fecha_alta = new Date().toJSON().slice(0, 10)
  contri.id_ciclo_fk = contri.ciclo
  delete contri.ciclo
  delete contri.id
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

router.post('/saldo/', async function (req, res) {
  let id = req.body.id
  let db = new Bd()
  let result = await db.getCuotasPendientes(id)
  db.disconnect()
  res.send({result})

})

router.post('/editar', async function(req, res) {
  let db = new Bd()
  let contri = {}
  contri = req.body
  contri.id_contribuyente = contri.id
  contri.id_cliclo_fk
  delete contri.ciclo
  delete contri.id
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

router.get('/eliminar/:id', async function(req, res) {
  let db = new Bd()
  let id = req.params.id
  await db.deleteContribuyente(id)
  db.disconnect()
  res.redirect('/contribuyentes/listar')
})

router.post('/generar', async function  (req, res) {
  let db = new Bd()
  try {
    let mes = Number(req.body.mes)
    let anio = Number(req.body.anio)
    if(!Number.isInteger(mes) || !Number.isInteger(anio) || mes < 1 || mes > 12 || anio < 2000) {
      db.disconnect()
      return res.status(400).send('Mes o año inválido')
    }

    let existe = await db.getGenerado(mes, anio)
    if(existe.length < 1) {
      let contris = await db.getContribuyentes(' WHERE estado = 1')
      let fecha = new Date().toJSON().slice(0,10)
      let filas = []
      for(let c of contris) {
        let cat = (await db.getCategoria(c.id_categoria_fk))[0]
        filas.push([c.id_contribuyente, mes, anio, cat.importe, 1, fecha])
      }
      await db.generarCuotas(filas)
      await db.grabarMes(mes, anio)
    }

    let cuotas = await db.getCuotasParaImprimir(mes, anio)
    db.disconnect()
    if(cuotas.length < 1) {
      return res.status(404).send('No hay cuotas para ese mes')
    }

    let doc = new PDFDocument({size: 'A4', margin: 30})
    let mesTexto = `${String(mes).padStart(2, '0')}/${anio}`
    let fileMes = String(mes).padStart(2, '0')
    let fileAnio = String(anio)
    let formatImporte = (valor) => String(Math.round(Number(valor || 0)))

    res.setHeader('Content-disposition', `attachment; filename="cuotas-${fileAnio}-${fileMes}.pdf"`)
    res.setHeader('Content-type', 'application/pdf')
    doc.pipe(res)

    const cardsPerPage = 6
    const rows = 6
    const contentWidth = doc.page.width - (doc.page.margins.left + doc.page.margins.right)
    const contentHeight = doc.page.height - (doc.page.margins.top + doc.page.margins.bottom)
    const cardWidth = contentWidth
    const cardHeight = contentHeight / rows

    const drawCard = (cuota, x, y) => {
      const talonWidth = cardWidth / 3
      const reciboWidth = cardWidth - talonWidth
      const sectionPad = 8
      const nombre = `${cuota.nombre} ${cuota.apellido}`.trim()
      const importe = formatImporte(cuota.importe)

      doc.rect(x, y, cardWidth, cardHeight).stroke()
      doc.moveTo(x + talonWidth, y).lineTo(x + talonWidth, y + cardHeight).stroke()

      doc.font('fonts/cabin/Cabin-Bold.ttf').fontSize(13)
      doc.text(`Nro. ${cuota.id_contribuyente_fk}`, x + sectionPad, y + 28, {width: talonWidth - (sectionPad * 2)})
      doc.font('fonts/cabin/Cabin-Regular.ttf').fontSize(10)
      doc.text(`Nombre: ${nombre}`, x + sectionPad, y + 44, {width: talonWidth - (sectionPad * 2)})
      doc.text(`Mes ${mesTexto}`, x + sectionPad, y + 76, {width: talonWidth - (sectionPad * 2)})
      doc.text(`Importe $${importe}`, x + sectionPad, y + 92, {width: talonWidth - (sectionPad * 2)})

      doc.font('fonts/cabin/Cabin-Bold.ttf').fontSize(12)
      doc.text('HOGAR DE ANCIANOS', x + talonWidth + sectionPad, y + sectionPad, {width: reciboWidth - (sectionPad * 2), align: 'center'})
      doc.font('fonts/cabin/Cabin-Regular.ttf').fontSize(10)
      doc.text(nombre, x + talonWidth + sectionPad, y + 44, {width: reciboWidth - (sectionPad * 2), align: 'center'})
      doc.text(`Mes ${mesTexto}`, x + talonWidth + sectionPad, y + 76, {width: reciboWidth - (sectionPad * 2)})
      doc.font('fonts/cabin/Cabin-Bold.ttf').fontSize(14)
      doc.text(`$${importe}`, x + talonWidth + sectionPad, y + 98, {width: reciboWidth - (sectionPad * 2), align: 'right'})
    }

    cuotas.forEach((cuota, i) => {
      if(i > 0 && i % cardsPerPage === 0) {
        doc.addPage()
      }

      const iPage = i % cardsPerPage
      const x = doc.page.margins.left
      const y = doc.page.margins.top + (iPage * cardHeight)
      drawCard(cuota, x, y)
    })

    doc.end()
  } catch(err) {
    console.log(err.message)
    db.disconnect()
    res.status(500).send('Ocurrio un error al generar el PDF')
  }
})

router.post('/pagar', async (req, res) => {
  let fecha = req.body.fecha.split('/')
  fecha = `${fecha[2]}-${fecha[1]}-${fecha[0]}`
  let cuota = {
    id_contribuyente: req.body.id_contribuyente,
    fecha
  }

  let db = new Bd()
  let result = await db.pagarCuota(cuota)
  let contri = (await db.getContribuyente(req.body.id_contribuyente))[0]
  if (result.affectedRows > 0) {
    let ingreso = {
      id_movimiento: 0,
      id_tipo_fk: 1,
      importe: req.body.importe,
      fecha,
      concepto: `Cuota contrib. ${contri.nombre} ${contri.apellido}`
    }
    let dbi = new BDIng()
    await dbi.saveMovimiento(ingreso)
    console.log(ingreso)
    dbi.disconnect()
  }
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
  await db.generarCuotas(arreglo)
  db.disconnect()
  res.send({ok: 'Ok'})
})

router.get('/:id', async (req, res) => {
  let id = req.params.id
  let db = new Bd()
  let result = (await db.getContribuyente(id))[0]
  let cat = (await db.getCategoria(result.id_categoria_fk))[0]
  result.cat = cat
  if(result) {
    res.send(result)
  } else {
    res.send({nombre: '', apellido: ''})
  }
  db.disconnect()

})

export default router
