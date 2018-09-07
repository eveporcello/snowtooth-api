const { ApolloServer, PubSub } = require('apollo-server')

const lifts = require('./data/lifts.json')
const trails = require('./data/trails.json')

const pubsub = new PubSub()

const context = { lifts, trails, pubsub }

const typeDefs = `
    type Lift {
        id: ID!
        name: String!
        status: LiftStatus!
        capacity: Int!
        night: Boolean!
        elevationGain: Int!
        trailAccess: [Trail!]!
    }

    type Trail {
        id: ID!
        name: String!
        status: TrailStatus
        difficulty: String!
        groomed: Boolean!
        trees: Boolean!
        night: Boolean!
        accessedByLifts: [Lift!]!
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

    type Subscription {
        liftStatusChange: Lift
        trailStatusChange: Trail
    }
`
const resolvers = {
    Query: {
        allLifts: (root, { status }, { lifts }) => {
            if (!status) {
                return lifts
            } else {
                var filteredLifts = lifts.filter(lift => lift.status === status)
                return filteredLifts
            }
        },
        Lift: (root, { id }, { lifts }) => {
            var selectedLift = lifts.filter(lift => id === lift.id)
            return selectedLift[0]
        },
        liftCount: (root, { status }, { lifts }) => {
            var i = 0
            lifts.map(lift => {
                lift.status === status ?
                    i++ :
                    null
            })
            return i
        },
        allTrails: (root, { status }, { trails }) => {
            if (!status) {
                return trails
            } else {
                var filteredTrails = trails.filter(trail => trail.status === status)
                return filteredTrails
            }
        },
        Trail: (root, { id }, { trails }) => {
            var selectedTrail = trails.filter(trail => id === trail.id)
            return selectedTrail[0]
        },
        trailCount: (root, { status }, { trails }) => {
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
        setLiftStatus: (root, { id, status }, { lifts, pubsub }) => {
            var updatedLift = lifts.find(lift => id === lift.id)
            updatedLift.status = status
            pubsub.publish('lift-status-change', { liftStatusChange: updatedLift })
            return updatedLift
        },
        setTrailStatus: (root, { id, status }, { trails, pubsub }) => {
            var updatedTrail = trails.find(trail => id === trail.id)
            updatedTrail.status = status
            pubsub.publish('trail-status-change', { trailStatusChange: updatedTrail })
            return updatedTrail
        }
    },
    Subscription: {
        liftStatusChange: {
            subscribe: (root, data, { pubsub }) => pubsub.asyncIterator('lift-status-change')
        },
        trailStatusChange: {
            subscribe: (root, data, { pubsub }) => pubsub.asyncIterator('trail-status-change')
        }
    },
    Lift: {
        trailAccess: (root, args, { trails }) => root.trails
            .map(id => trails.find(t => id === t.id))
            .filter(x => x)
    },
    Trail: {
        accessedByLifts: (root, args, { lifts }) => root.lift
            .map(id => lifts.find(l => id === l.id))
            .filter(x => x)
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context
})

server.listen().then(({ url }) => {
    console.log(`Server running at ${url}`)
})