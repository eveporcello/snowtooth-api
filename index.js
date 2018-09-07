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
        Lift(id: ID!): Lift!
    }
`
const resolvers = {
    Query: {
        allLifts: () => lifts,
        Lift: (root, { id }) => {
            var selectedLift = lifts.filter(lift => id === lift.id)
            return selectedLift[0]
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then(({ url }) => {
    console.log(`Server running at ${url}`)
})