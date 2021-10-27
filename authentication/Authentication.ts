import { DBServer } from '../DBServer'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'

interface UserHashMap {
  username: string
  hash: string
  _id?: string
  createdOn?: string
  modifiedOn?: string
}

interface LoggedInUser {
  authToken?: string
  loggedIn: boolean,
  user?: any
}

interface UserCredentials {
  username: string
  password: string
}

const getAuthToken = (hash, username) => {
  return jwt.sign({
    data: `${hash}_${username}_${hash}`
    , exp: Math.floor(Date.now() / 1000) + (60 * 60)
  }, process.env.JWT_SECRET)
}

const updatePasswordHashAndAuthToken = async (credentials) => {
  const hashData = await DBServer.getCollection('hashtable').findOne({ username: credentials.username }) as UserHashMap
  let hash = hashData?.hash
    , authToken = null

  if (!hash) {
    hash = bcrypt.hashSync(credentials.password, Number(process.env.SALT_ROUNDS))
    authToken = getAuthToken(hash, credentials.username)
  }

  await DBServer.getCollection('hashtable').updateOne({
    username: credentials.username
  }, {
    '$set': {
      hash: hash
      , authToken: authToken
      , username: credentials.username
      , modifiedOn: new Date().toISOString()
    }
    , '$setOnInsert': {
      'createdOn': new Date().toISOString()
    }
  }, {
    upsert: true
  })

  return {
    hash: hash
    , authToken: authToken
  }
}

export const login = async (parent: never, { credentials }: { credentials: UserCredentials }):
  Promise<LoggedInUser> => {

  const hashData = await updatePasswordHashAndAuthToken(credentials)

  try {
    const isValidPassword = bcrypt.compareSync(credentials.password, hashData.hash)

    if (!isValidPassword) {
      // noinspection ExceptionCaughtLocallyJS
      throw new Error()
    }

    const authToken = getAuthToken(hashData.hash, credentials.username)

    await DBServer.getCollection('users').updateOne({ username: credentials.username }, {
      '$set': {
        loggedIn: true
      }
    })
    return {
      authToken: authToken
      , loggedIn: true
      , user: await DBServer.getDb().collection('users').findOne({ username: credentials.username })
    }
  } catch (err) {
    return {
      loggedIn: false
    }
  }
}

export const signup = async (parent: never, { user }: { user: UserCredentials }): Promise<LoggedInUser> => {

  const { authToken } = await updatePasswordHashAndAuthToken(user)

  user.password = null
  delete user.password

  await DBServer.getCollection('users').updateOne({
    username: user.username
  }, {
    '$set': {
      ...user
      , loggedIn: true
      , modifiedOn: new Date().toISOString()
    }
    , '$setOnInsert': {
      'createdOn': new Date().toISOString()
    }
  }, {
    upsert: true
  })

  return {
    authToken: authToken
    , loggedIn: true
    , user: await DBServer.getCollection('users').findOne({ username: user.username })
  }
}