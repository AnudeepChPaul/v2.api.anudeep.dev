import { DBServer } from '../DBServer'
import fs from 'fs'

export const resolvers = {
  Query: {
    About(parent: never, args: never, context: any): any {
      if (!context.isAuthenticated) {
        return {
          name: null
          , version: null
          , repo: null
          , author: null
          , license: null
        }
      }

      const data = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
      return {
        name: data.name
        , version: data.version
        , repo: data.repository
        , author: data.author
        , license: data.license
      }
    }
  }
  , ApplicationData: {
    db: (parent: never, args: never, context: { user, isAuthenticated }) : { name: string, isConnected: boolean } => {
      if (!context.isAuthenticated) {
        return null
      }
      return DBServer.getDBInfo()
    }
  }
}