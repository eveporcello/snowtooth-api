const { ApolloServer } = require('apollo-server')

const lifts = require('./data/lifts.json')

const typeDefs = `
    type Lift {
        id: ID!
        name: String!
        status: LiftStatus!
        capacity: Int!
        night: Boolean!
        elevationGain: Int!
    }
    
    enum LiftStatus {
        OPEN
        HOLD
        CLOSED
    }

    type Query {
        allLifts: [Lift!]!
    }
`
const resolvers = {
    Query: {
        allLifts: () => lifts
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({ url }) => {
    console.log(`Server running at ${url}`)
})