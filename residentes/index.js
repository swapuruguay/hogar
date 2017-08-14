const co = require('co')
const mysql = require('promise-mysql')
let config = require('../config')

class Residentes {

  constructor() {
    this.connect()
  }

  connect() {

    let options = {
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database
    }

    this.con = mysql.createConnection(options)

    let connection = this.con
    let setup = co.wrap(function * () {
      let  conn = yield connection
      return conn
    })
    return Promise.resolve(setup())
  }

  disconnect() {
    let connection = this.con
    let setup = co.wrap(function * () {
      let conn = yield connection
      conn.destroy()
      return conn
    })
    return Promise.resolve(setup())
  }

  saveResidente(residente) {

    let connection = this.con
    let task = co.wrap(function * () {
      let conn = yield connection
      let sql = 'INSERT INTO cuotas (id_residente, nombre, apellido, documento, fecha_nacimiento, mutualista, cuidados, fecha_ingreso) VALUES ?'
      let result = yield conn.query(sql, residente)
      if(!result) {
        Promise.reject(new Error('Ocurrio un error'))
      }
      return Promise.resolve(result)
    })
    return Promise.resolve(task())

  }

  /*delResidente(id) {

  }*/

  getResidentes() {
    let connection = this.con
    let task = co.wrap(function * () {
      let conn = yield connection
      let lista = yield conn.query('SELECT * FROM residentes WHERE estado = 1')
      if(!lista) {
        Promise.reject(new Error('Ocurrio un error'))
      }
      return Promise.resolve(lista)
    })
    return Promise.resolve(task())

  }

  getResidente(id) {
    let connection = this.con
    let task = co.wrap(function * () {
      let conn = yield connection
      let residente = yield conn.query(`SELECT * FROM residentes WHERE estado = 1 AND id_residente = ${id}`)
      if(!residente) {
        Promise.reject(new Error('Ocurrio un error'))
      }
      return Promise.resolve(residente)
    })
    return Promise.resolve(task())
  }

}

module.exports = Residentes
