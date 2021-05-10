import { login, signup } from '../../authentication/Authentication'

export const resolvers = {
  Mutation: {
    Login: login
    , Signup: signup
  }
}