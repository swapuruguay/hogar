import co from 'co'
import mysql from 'promise-mysql'
const config = require('../config')

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
    let connection = this.con
    
    let tarea = co.wrap(function * () {
      let conn = yield connection
      let contris = yield conn.query(`SELECT * FROM contribuyentes WHERE id_ciclo_fk = ${ciclo}`)
      if(!contris) {
        Promise.rejetc(new Error('Ocurrio un error'))
      }

      return Promise.resolve(contris)
    })
    return Promise.resolve(tarea())
 
  }

  getByCategoria(categoria) {
    let connection = this.con
    
    let tarea = co.wrap(function * () {
      let conn = yield connection
      let contris = yield conn.query(`SELECT * FROM contribuyentes WHERE id_categoria_fk = ${categoria}`)
      if(!contris) {
        Promise.rejetc(new Error('Ocurrio un error'))
      }

      return Promise.resolve(contris)
    })
    return Promise.resolve(tarea())
  }

  saveContribuyente(contri) {
    

  }

  deleteContribuyente(contri) {

  }

  getCuotasPendientes(idContribuyente) {
    let connection = this.con
    
    let tarea = co.wrap(function * () {
      let conn = yield connection
      let contris = yield conn.query(`SELECT * FROM cuotas WHERE estado = 0 AND id_contribuyente_fk = ${idContribuyente}`)
      if(!contris) {
        Promise.rejetc(new Error('Ocurrio un error'))
      }

      return Promise.resolve(contris)
    })
    return Promise.resolve(tarea())
  }

  getCuotas(mes, anio) {
    let connection = this.con
  
    let tarea = co.wrap(function * () {
      let conn = yield connection
      let contris = yield conn.query(`SELECT * FROM cuotas WHERE mes = ${mes} AND anio = ${anio}`)
      if(!contris) {
        Promise.rejetc(new Error('Ocurrio un error'))
      }

      return Promise.resolve(contris)
    })
    return Promise.resolve(tarea())
  }

  getCuotasSinCobrar() {

  }

  generarCuotas(lista) {
    
    let connection = this.con
    
    let tarea = co.wrap(function * () {
      let conn = yield connection
      let sql = "INSERT INTO cuotas (id_contribuyente_fk, mes, anio, estado, fecha_emision) VALUES ?"
      let result = yield conn.query(sql, [lista])
      if(!result) {
        Promise.rejetc(new Error('Ocurrio un error'))
      }

      return Promise.resolve(result)
    })
    return Promise.resolve(tarea())
  }

  
}

export default Contribuyentes