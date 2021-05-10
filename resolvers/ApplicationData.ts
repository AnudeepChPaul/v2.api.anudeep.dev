import { DBServer } from '../../DBServer'
import { ObjectId } from 'mongodb'
import fs from 'fs'

export const resolvers = {
  Query: {
    About() {
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
    db: () => {
      return DBServer.getDBInfo()
    }
  }
  , Mutation: {
    AddUser: async (parent, { User }) => {
      const res = await DBServer.getCollection('users').insertOne(User)
      return (await DBServer.getCollection('users').find({ _id: res.insertedId }).toArray())[0]
    }
    , UpdateUser: async (parent, { id, User }) => {
      await DBServer.getCollection('users').updateOne({ _id: new ObjectId(id) }, { '$set': User })
      return (await DBServer.getCollection('users').find(new ObjectId(id)).toArray())[0]
    }
  }
}