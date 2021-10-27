import { config } from 'dotenv'
config()

import express, { Express, Request, Response } from 'express'
import { DBServer } from './DBServer'
import * as fs from 'fs'
import helmet from 'helmet'

class ApplicationServer {
  private _app: Express = express()
  private _port = Number(process.env.APP_BASE_PORT)
  private _baseRoute = express.Router()

  setPort(port: number): ApplicationServer {
    this._port = port
    return this
  }

  constructor() {
    this._baseRoute.get('/about',  (req: Request, res: Response) => {
      const data = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
      res.send({
        name: data.name
        , version: data.version
        , repo: data.repository
        , author: data.author
        , license: data.license
        , db: DBServer.getDBInfo()
      })
    })
    this._baseRoute.get('/site-map',  (req: Request, res: Response) => {
      res.send({
        routes: this._baseRoute.stack.filter(r => !!r.path)
      })
    })

    this._app.use('/', this._baseRoute)
    this._app.use(express.json)
    this._app.use(helmet())
  }

  configure(): ApplicationServer {
    // this._apollo.applyMiddleware({app: this._app})
    // this._app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: typeDefs }))
    return this
  }

  run() :void {
    DBServer.run().then(() => {
      // this._app.listen(this._port, () => {
      //   console.log(`Server started at http://localhost:${this._port}`)
      //   APP_INIT.emit(null)
      // })
    })
  }
}

new ApplicationServer().run()