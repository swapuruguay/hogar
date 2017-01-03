'use strict'

const express = require('express')
const router = express.Router()
const Bd = require('../contribuyentes')
const config = require('../config')
const formData = require('express-form-data')
import co from 'co'


// parsing data with connect-multiparty. Result set on req.body and req.files 
router.use(formData.parse());
// clear all empty files 
router.use(formData.format());
// change file objects to node stream.Readable  
router.use(formData.stream());
// union body and files 
router.use(formData.union());

router.get('/', co.wrap(function * (req, res) {
  res.render('index-residentes', {titulo: 'Area Residentes'})
}))

router.get('/nuevo', (req, res) => {
  res.render('residentes-nuevo')
})

export default router