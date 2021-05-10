import {MongoClient } from 'mongodb'
import {DB_INIT} from './events'


let db = null

class DataAcce {
  private static readonly url: string =  'mongodb://achandrapaul_dev:123456789@127.0.0.1:27017/admin?authSource=admin'
  private static client = null;
  private static db = null

  static run(): DataAcce  {
    MongoClient.connect(this.url, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        throw new Error('DB Connection Failed')
      }
      DataAcce.client = client
      DataAcce.db = client.db('resume')
      db = DataAcce.db
      console.log('Connected successfully to server')
      DB_INIT.emit(null)
    })
    return  DataAcce
  }

  static getDBInfo(): object {
    return {
      name: DataAcce.db.databaseName
      , state: DataAcce.db.serverConfig.s.state
      , readPreference: DataAcce.client.s.readPreference
    }
  }
}

export {DataAcce, db}