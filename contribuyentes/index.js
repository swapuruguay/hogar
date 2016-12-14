const co = require('co')
const mysql = require('promise-mysql')
let config = require('../config')

class Contribuyentes {

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

  getContribuyentes(where, order) {
    let cond = where || ''
    let orden = order || ''
    
    
    let connection = this.con

    let task = co.wrap(function * () {
      let conn = yield connection
      let listContribuyentes = yield conn.query(`SELECT * FROM contribuyentes ${cond} ${orden}`)

      if(!listContribuyentes) {
        return Promise.reject(new Error(`Not found`))
      }

      return Promise.resolve(listContribuyentes)

    })

    return Promise.resolve(task())

  }

  getCiclos() {
    let connection = this.con
    let task = co.wrap(function * () {
      let conn = yield connection
      let ciclos = conn.query('SELECT * FROM ciclos')
      if(!ciclos) {
        return Promise.reject(new Error('Not found'))
      }
      return Promise.resolve(ciclos)
    })
    return Promise.resolve(task())
  }

  getContribuyente(id) {
    
    
    
    let connection = this.con

    let task = co.wrap(function * () {
      let conn = yield connection
      let contribuyente = yield conn.query(`SELECT * FROM contribuyentes WHERE id_contribuyente = ${id}`)

      if(!contribuyente) {
        return Promise.reject(new Error(`Not found`))
      }

      return Promise.resolve(contribuyente)

    })

    return Promise.resolve(task())
  }

  getByCiclo(ciclo) {

  }

  getByCategoria(categoria) {

  }

  saveContribuyente(contri) {
   

  }

  deleteContribuyente(contri) {

  }

  
}

module.exports = Contribuyentes