"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
dotenv_1.config();
const express_1 = __importDefault(require("express"));
const DBServer_1 = require("./DBServer");
const fs = __importStar(require("fs"));
const events_1 = require("./events");
const apollo_server_1 = require("apollo-server");
const init_1 = require("./gql/init");
class ApplicationServer {
    constructor() {
        this._app = express_1.default();
        this._apollo = new apollo_server_1.ApolloServer({
            typeDefs: init_1.typeDefs,
            resolvers: init_1.resolvers,
            tracing: true
        });
        this._port = Number(process.env.APP_BASE_PORT);
        this._baseRoute = express_1.default.Router();
        this._baseRoute.get('/about', (req, res) => {
            const data = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
            res.send({
                name: data.name,
                version: data.version,
                repo: data.repository,
                author: data.author,
                license: data.license,
                db: DBServer_1.DBServer.getDBInfo()
            });
        });
        this._baseRoute.get('/site-map', (req, res) => {
            res.send({
                routes: this._baseRoute.stack.filter(r => !!r.path)
            });
        });
        this._app.use('/', this._baseRoute);
        this._app.use(express_1.default.json);
    }
    setPort(port) {
        this._port = port;
        return this;
    }
    configure() {
        // this._apollo.applyMiddleware({app: this._app})
        // this._app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: typeDefs }))
        return this;
    }
    run() {
        DBServer_1.DBServer.run().then(() => {
            this._app.listen(this._port, () => {
                console.log(`Server started at http://localhost:${this._port}`);
                events_1.APP_INIT.emit(null);
            });
            this._apollo.listen({ port: process.env.APP_GRAPHQL_PORT }).then(({ url }) => {
                console.log(`GraphQL server started on ${url}`);
                events_1.GRAPHQL_INIT.emit(null);
            });
        });
    }
}
new ApplicationServer().run();
//# sourceMappingURL=server.js.map