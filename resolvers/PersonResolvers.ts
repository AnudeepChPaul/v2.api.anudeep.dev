import { DBServer } from '../DBServer'
import { ExpressContext } from 'apollo-server-express'

export const resolvers = {
  Query: {
    Users: async (parent: never, { username, userInfo }: {username: string[], userInfo: any}, context): Promise<any> => {
      let query = {}
      if (username) {
        query = { username: { '$in': username } }
      }

      if (userInfo) {
        for (const key in userInfo) {
          if (userInfo)
          {query = {
            [key]: userInfo[key]
          }}
        }
      }

      return DBServer.getCollection('users').find(query).toArray()
    }
  }
  , Mutation: {
    UpdateUser: async (parent: never, { username, User }: {username: string, User: any}): Promise<any> => {
      await DBServer.getCollection('users').updateOne({ username: username }, { '$set': User })
      return (await DBServer.getCollection('users').find({ username: username }).toArray())[0]
    }
  }
}