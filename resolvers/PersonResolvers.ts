import { DBServer } from '../../DBServer'

export const resolvers = {
  Query: {
    Users: async (parent: never, { username, userInfo }: {username: string[], userInfo: any}, ctx: never): Promise<any> => {
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
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    AddUser: async (context, { User }): Promise<any> => {
      const res = await DBServer.getCollection('users').insertOne(User)
      return (await DBServer.getCollection('users').find({ _id: res.insertedId }).toArray())[0]
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    , UpdateUser: async (context, { username, User }) => {
      await DBServer.getCollection('users').updateOne({ username: username }, { '$set': User })
      return (await DBServer.getCollection('users').find({ username: username }).toArray())[0]
    }
  }
}