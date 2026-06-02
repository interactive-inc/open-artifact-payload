import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function run() {
  const payload = await getPayload({ config: await config })
  const result = await payload.find({ collection: 'news', limit: 10, draft: true })
  console.log('total (draft:true):', result.totalDocs)
  for (const d of result.docs) {
    console.log(' id:', d.id, 'slug:', d.slug, 'status:', d._status)
  }
  const result2 = await payload.find({ collection: 'news', limit: 10, draft: false })
  console.log('total (draft:false):', result2.totalDocs)
  process.exit(0)
}
run().catch((e) => {
  console.error(e)
  process.exit(1)
})
