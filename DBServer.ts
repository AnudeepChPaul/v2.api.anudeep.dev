import { Collection, Db, MongoClient } from 'mongodb'
import * as fs from 'fs'
import { ApolloServer } from 'apollo-server'
// import { resolvers, typeDefs } from './gql'

import * as path from 'path'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'

const typesArray = loadFilesSync(path.join(__dirname, './types'), { extensions: [ 'graphql' ] })
const resolversArray = loadFilesSync(path.join(__dirname, './resolvers'), { extensions: [ 'ts' ] })

const typeDefs = mergeTypeDefs(typesArray)
const resolvers = mergeResolvers(resolversArray)

class DBServer {
  private static _client: MongoClient = null
  private static _db: Db = null
  private static _apollo = new ApolloServer({
    typeDefs
    , resolvers
    , tracing: false
    , introspection: true
    , playground: process.env.NODE_ENV !== 'production'
    , dataSources: () => {
      return {
        users: DBServer.getCollection('users')
      }
    }
    , context: async ({ req }) => {
      const authHeader = req.headers.authorization
      if (!authHeader) {
        return {
          isAuthenticated: false
          , user: null }
      }

      const user = await DBServer.getCollection('hashtable').findOne({ authToken: authHeader })
      return {
        isAuthenticated: true
        , user: user
      }
    }
  })

  static getDb(): Db {
    return DBServer._db
  }

  static getCollection(name: string): Collection {
    return DBServer._db.collection(name)
  }

  static async configure() {
    if (process.env.SEED_DB === 'false') {
      return
    }

    const dbConfig = JSON.parse(fs.readFileSync('./resources/DbConfig.json', 'utf-8'))

    for await (const config of dbConfig) {
      try {
        await DBServer._db.dropCollection(config.name)
        // eslint-disable-next-line no-empty
      } catch (e) {}

      await DBServer._db.createCollection(config.name)
      await DBServer.getCollection(config.name).createIndex(config.index.name, { unique: config.index.unique })
    }

    const coll = await DBServer._db.collection('users')
    const users = JSON.parse(fs.readFileSync('./resources/Users.json', 'utf-8'))
    await coll.insertMany(users)
  }

  static run(): Promise<void> {
    const url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/admin?authSource=admin`

    return new Promise<void>((res, rej) => {
      MongoClient.connect(url, { useUnifiedTopology: true }, async (err, client) => {
        if (err) {
          return rej()
        }
        DBServer._client = client
        DBServer._db = client.db(process.env.DB_NAME)
        console.log('Connected successfully to server')

        await this.configure()
        console.log('DB Configured!')

        this._apollo.listen({ port: process.env.APP_GRAPHQL_PORT }).then(({ url })=> {
          console.log(`GraphQL server started on ${url}`)
          return res()
        })
      })
    })
  }

  static getDBInfo() {
    return {
      name: DBServer._db.databaseName
      , isConnected: DBServer._client.isConnected()
    }
  }
}

export { DBServer }