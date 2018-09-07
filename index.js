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
        allLifts(status: LiftStatus): [Lift!]!
        Lift(id: ID!): Lift!
        liftCount(status: LiftStatus!): Int!
    }

    type Mutation {
        setLiftStatus(id: ID!, status: LiftStatus!): Lift!
    }
`
const resolvers = {
    Query: {
        allLifts: (root, { status }) => {
            if (!status) {
                return lifts
            } else {
                var filteredLifts = lifts.filter(lift => lift.status === status)
                return filteredLifts
            }
        },
        Lift: (root, { id }) => {
            var selectedLift = lifts.filter(lift => id === lift.id)
            return selectedLift[0]
        },
        liftCount: (root, { status }) => {
            var i = 0
            lifts.map(lift => {
                lift.status === status ?
                    i++ :
                    null
            })
            return i
        }
    },
    Mutation: {
        setLiftStatus: (root, { id, status }) => {
            var updatedLift = lifts.find(lift => id === lift.id)
            updatedLift.status = status
            return updatedLift
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