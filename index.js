const { ApolloServer, PubSub } = require('apollo-server')

const lifts = require('./data/lifts.json')
const trails = require('./data/trails.json')

const pubsub = new PubSub()

const context = { pubsub }

const typeDefs = `
  type Lift {
    id: ID
    name: String!
    status: LiftStatus!
    capacity: Int!
    night: Boolean!
    elevationGain: Int!
    trailAccess: [Trail!]!
  }

  type Trail {
    id: ID
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
    findLiftById(id: ID!): Lift!
    liftCount(status: LiftStatus!): Int!
    allTrails(status: TrailStatus): [Trail!]!
    findTrailById(id: ID!): Trail!
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
    allLifts: (parent, { status }) => {
      if (!status) {
        return lifts
      } else {
        let filteredLifts = lifts.filter(lift => lift.status === status)
        return filteredLifts
      }
    },
    findLiftById: (parent, { id }) => {
      let selectedLift = lifts.find(lift => id === lift.id)
      return selectedLift
    },
    liftCount: (parent, { status }) => {
      let i = 0
      lifts.map(lift => {
        lift.status === status ? i++ : null
      })
      return i
    },
    allTrails: (parent, { status }) => {
      if (!status) {
        return trails
      } else {
        let filteredTrails = trails.filter(trail => trail.status === status)
        return filteredTrails
      }
    },
    findTrailById: (parent, { id }) => {
      let selectedTrail = trails.filter(trail => id === trail.id)
      return selectedTrail[0]
    },
    trailCount: (parent, { status }) => {
      let i = 0
      trails.map(trail => {
        trail.status === status ? i++ : null
      })
      return i
    }
  },
  Mutation: {
    setLiftStatus: (parent, { id, status }, { pubsub }) => {
      let updatedLift = lifts.find(lift => id === lift.id)
      updatedLift.status = status
      pubsub.publish('lift-status-change', { liftStatusChange: updatedLift })
      return updatedLift
    },
    setTrailStatus: (parent, { id, status }, { pubsub }) => {
      let updatedTrail = trails.find(trail => id === trail.id)
      updatedTrail.status = status
      pubsub.publish('trail-status-change', { trailStatusChange: updatedTrail })
      return updatedTrail
    }
  },
  Subscription: {
    liftStatusChange: {
      subscribe: (parent, data, { pubsub }) =>
        pubsub.asyncIterator('lift-status-change')
    },
    trailStatusChange: {
      subscribe: (parent, data, { pubsub }) =>
        pubsub.asyncIterator('trail-status-change')
    }
  },
  Lift: {
    trailAccess: (parent, args) =>
      parent.trails.map(id => trails.find(t => id === t.id)).filter(x => x)
  },
  Trail: {
    accessedByLifts: (parent, args) =>
      parent.lift.map(id => lifts.find(l => id === l.id)).filter(x => x)
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
