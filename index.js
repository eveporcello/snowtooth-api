const { ApolloServer } = require('apollo-server')

const lifts = require('./data/lifts.json')
const trails = require('./data/trails.json')

const typeDefs = `
    type Lift {
        id: ID!
        name: String!
        status: LiftStatus!
        capacity: Int!
        night: Boolean!
        elevationGain: Int!
    }

    type Trail {
        id: ID!
        name: String!
        status: TrailStatus
        difficulty: String!
        groomed: Boolean!
        trees: Boolean!
        night: Boolean!
    }

    enum LiftStatus {
        OPEN
        HOLD
        CLOSED
    }

    enum TrailStatus {
        OPEN
        CLOSED
    }

    type Query {
        allLifts(status: LiftStatus): [Lift!]!
        Lift(id: ID!): Lift!
        liftCount(status: LiftStatus!): Int!
        allTrails(status: TrailStatus): [Trail!]!
        Trail(id: ID!): Trail!
        trailCount(status: TrailStatus!): Int!
    }

    type Mutation {
        setLiftStatus(id: ID!, status: LiftStatus!): Lift!
        setTrailStatus(id: ID!, status: TrailStatus!): Trail!
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
        },
        allTrails: (root, { status }) => {
            if (!status) {
                return trails
            } else {
                var filteredTrails = trails.filter(trail => trail.status === status)
                return filteredTrails
            }
        },
        Trail: (root, { id }) => {
            var selectedTrail = trails.filter(trail => id === trail.id)
            return selectedTrail[0]
        },
        trailCount: (root, { status }) => {
            var i = 0
            trails.map(trail => {
                trail.status === status ?
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
        },
        setTrailStatus: (root, { id, status }) => {
            var updatedTrail = trails.find(trail => id === trail.id)
            updatedTrail.status = status
            return updatedTrail
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