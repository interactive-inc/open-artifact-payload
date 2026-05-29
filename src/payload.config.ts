import path from 'path'
import { fileURLToPath } from 'url'

import { buildCoreConfig } from '@/core/payload/config-base'
import { projectFeatures } from '@/project/project-features'
import { homeGlobal } from '@/project/pages/home/global'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildCoreConfig({
  dirname,
  features: projectFeatures,
  projectGlobals: [homeGlobal],
})
