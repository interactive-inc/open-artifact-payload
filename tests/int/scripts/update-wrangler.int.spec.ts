import { describe, expect, it } from 'vitest'

import { withDatabaseId } from '@/core/scripts/with-database-id'
import { withR2BucketName } from '@/core/scripts/with-r2-bucket-name'
import { withWorkerName } from '@/core/scripts/with-worker-name'

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
  ],
  "env": {
    "staging": {
      "name": "inta-cms-staging",
      "d1_databases": [
        {
          "binding": "D1",
          "database_id": "STAGING_DATABASE_ID",
          "database_name": "inta-cms-staging"
        }
      ],
      "r2_buckets": [
        {
          "binding": "R2",
          "bucket_name": "inta-cms-staging"
        }
      ]
    }
  }
}`

describe('update-wrangler', () => {
  it('database_id を書き換える (本番のみ)', () => {
    const result = withDatabaseId({ source: sample, databaseId: 'abc-123' })
    expect(result).toContain('"database_id": "abc-123"')
    expect(result).toContain('"database_id": "STAGING_DATABASE_ID"')
  })

  it('name と bucket_name を slug に揃える', () => {
    const withId = withDatabaseId({ source: sample, databaseId: 'abc-123' })
    const withName = withWorkerName({ source: withId, name: 'sakura-trip' })
    const withBucket = withR2BucketName({ source: withName, bucketName: 'sakura-trip-cms' })
    expect(withBucket).toContain('"name": "sakura-trip"')
    expect(withBucket).toContain('"bucket_name": "sakura-trip-cms"')
  })

  it('staging の name / bucket_name / database_id は上書きしない', () => {
    const withId = withDatabaseId({ source: sample, databaseId: 'abc-123' })
    const withName = withWorkerName({ source: withId, name: 'sakura-trip' })
    const withBucket = withR2BucketName({ source: withName, bucketName: 'sakura-trip-cms' })
    // 本番値の置換は通っている一方で、staging のリテラルが残ること
    expect(withBucket).toContain('"name": "inta-cms-staging"')
    expect(withBucket).toContain('"bucket_name": "inta-cms-staging"')
    expect(withBucket).toContain('"database_id": "STAGING_DATABASE_ID"')
  })
})
