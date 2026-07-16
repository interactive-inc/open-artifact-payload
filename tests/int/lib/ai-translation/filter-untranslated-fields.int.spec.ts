import { describe, expect, it } from 'vite-plus/test'

import { filterUntranslatedFields } from '@/core/lib/ai-translation/filter-untranslated-fields'
import type { TranslatableField } from '@/core/lib/ai-translation/translation-types'

const fields: TranslatableField[] = [
  { path: ['title'], kind: 'plain', texts: ['タイトル'] },
  { path: ['companyInfo', 'address'], kind: 'plain', texts: ['住所'] },
  { path: ['headerNav', 0, 'label'], kind: 'plain', texts: ['ホーム'] },
]

describe('filterUntranslatedFields', () => {
  it('翻訳先が未入力のフィールドだけ残す', () => {
    const targetDoc = {
      title: 'Already translated',
      companyInfo: { address: null },
      headerNav: [{ label: '' }],
    }

    const filtered = filterUntranslatedFields({ fields, targetDoc })

    expect(filtered.map((field) => field.path.join('.'))).toEqual([
      'companyInfo.address',
      'headerNav.0.label',
    ])
  })

  it('すべて入力済みなら空になる', () => {
    const targetDoc = {
      title: 'A',
      companyInfo: { address: 'B' },
      headerNav: [{ label: 'C' }],
    }

    expect(filterUntranslatedFields({ fields, targetDoc })).toEqual([])
  })
})
