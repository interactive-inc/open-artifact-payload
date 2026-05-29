// Any setup scripts you might need go here

// Load .env files
import 'dotenv/config'

// Prevent Payload from calling pushDevSchema during tests.
// pushDevSchema runs CREATE INDEX without IF NOT EXISTS, which fails when
// migrations have already been applied to the local D1 state.
// PAYLOAD_MIGRATING=true is the official flag checked in connect.js.
process.env.PAYLOAD_MIGRATING = 'true'
