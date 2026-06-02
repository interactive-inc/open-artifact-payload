import { describe, expect, it } from 'vite-plus/test'

import { withDatabaseId, withR2BucketName, withWorkerName } from '@/core/scripts/update-wrangler'

const sample = `{
  "name": "inta-cms",
  "d1_databases": [
    {
      "binding": "D1",
      "database_id": "DATABASE_ID",
      "database_name": "inta-cms"
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "inta-cms"
    }
  ]
}`

describe('update-wrangler', () => {
  it('database_id を書き換える', () => {
    const result = withDatabaseId(sample, 'abc-123')
    expect(result).toContain('"database_id": "abc-123"')
  })

  it('name と bucket_name を slug に揃える', () => {
    const withId = withDatabaseId(sample, 'abc-123')
    const withName = withWorkerName(withId, 'sakura-trip')
    const withBucket = withR2BucketName(withName, 'sakura-trip-cms')
    expect(withBucket).toContain('"name": "sakura-trip"')
    expect(withBucket).toContain('"bucket_name": "sakura-trip-cms"')
  })
})
