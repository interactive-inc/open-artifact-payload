// Any setup scripts you might need go here

// Load .env files (optional locally; tests must not depend on a real .env)
import 'dotenv/config'

// Payload は secret 未設定で起動できないため、テスト専用のフォールバックを与える。
// .env / CI シークレットが設定されていればそちらを優先する。
process.env.PAYLOAD_SECRET ||= 'test-secret-do-not-use-in-production'

// Prevent Payload from calling pushDevSchema during tests.
// pushDevSchema runs CREATE INDEX without IF NOT EXISTS, which fails when
// migrations have already been applied to the local D1 state.
// PAYLOAD_MIGRATING=true is the official flag checked in connect.js.
process.env.PAYLOAD_MIGRATING = 'true'
