import * as path from 'path'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge'

const typesArray = loadFilesSync(path.join(__dirname, './types'), { extensions: [ 'graphql' ] })
const resolversArray = loadFilesSync(path.join(__dirname, './resolvers'), { extensions: [ 'ts' ] })

export const typeDefs = mergeTypeDefs(typesArray)
export const resolvers = mergeResolvers(resolversArray)