'use strict'

import express from 'express'
const router = express.Router()
import formData from 'express-form-data'


// parsing data with connect-multiparty. Result set on req.body and req.files
router.use(formData.parse())
// clear all empty files
router.use(formData.format())
// change file objects to node stream.Readable
router.use(formData.stream())
// union body and files
router.use(formData.union())

router.get('/', function  (req, res) {
  res.render('index-residentes', {titulo: 'Area Residentes'})
})

router.get('/nuevo', (req, res) => {
  res.render('residentes-nuevo')
})

export default router
