import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildCollectionRevalidateAfterChange } from '@/core/lib/revalidate/build-collection-revalidate-after-change'
import { buildCollectionRevalidateAfterDelete } from '@/core/lib/revalidate/build-collection-revalidate-after-delete'
import { buildGlobalRevalidateAfterChange } from '@/core/lib/revalidate/build-global-revalidate-after-change'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

type FakeDoc = { slug: string }

function createWarn() {
  return vi.fn()
}

function createCollectionArgs(warn: ReturnType<typeof createWarn>) {
  const doc: FakeDoc = { slug: 'x' }
  return {
    doc,
    previousDoc: undefined,
    req: { payload: { logger: { warn } } },
  }
}

beforeEach(() => {
  vi.mocked(revalidatePath).mockReset()
})

describe('buildCollectionRevalidateAfterChange', () => {
  it('resolver が返した各パスを revalidate して doc を返す', () => {
    const warn = createWarn()
    const args = createCollectionArgs(warn)
    const hook = buildCollectionRevalidateAfterChange<FakeDoc>((props) => [
      '/news',
      `/news/${props.doc.slug}`,
    ])

    const returned = hook(args as unknown as Parameters<typeof hook>[0])

    expect(revalidatePath).toHaveBeenCalledWith('/news', undefined)
    expect(revalidatePath).toHaveBeenCalledWith('/news/x', undefined)
    expect(revalidatePath).toHaveBeenCalledTimes(2)
    expect(returned).toBe(args.doc)
    expect(warn).not.toHaveBeenCalled()
  })

  it('revalidatePath が throw しても doc を返し warn でログする', () => {
    const warn = createWarn()
    const args = createCollectionArgs(warn)
    vi.mocked(revalidatePath).mockImplementationOnce(() => {
      throw new Error('outside request scope')
    })
    const hook = buildCollectionRevalidateAfterChange<FakeDoc>((props) => [
      '/news',
      `/news/${props.doc.slug}`,
    ])

    const returned = hook(args as unknown as Parameters<typeof hook>[0])

    expect(returned).toBe(args.doc)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('/news')
    // 2 番目のパスは throw せず通常通り revalidate される
    expect(revalidatePath).toHaveBeenCalledWith('/news/x', undefined)
  })
})

describe('buildCollectionRevalidateAfterDelete', () => {
  it('resolver が返した各パスを revalidate して doc を返す', () => {
    const warn = createWarn()
    const args = createCollectionArgs(warn)
    const hook = buildCollectionRevalidateAfterDelete<FakeDoc>((props) => [
      '/news',
      `/news/${props.doc.slug}`,
    ])

    const returned = hook(args as unknown as Parameters<typeof hook>[0])

    expect(revalidatePath).toHaveBeenCalledWith('/news', undefined)
    expect(revalidatePath).toHaveBeenCalledWith('/news/x', undefined)
    expect(returned).toBe(args.doc)
    expect(warn).not.toHaveBeenCalled()
  })

  it('revalidatePath が throw しても doc を返し warn でログする', () => {
    const warn = createWarn()
    const args = createCollectionArgs(warn)
    vi.mocked(revalidatePath).mockImplementationOnce(() => {
      throw new Error('outside request scope')
    })
    const hook = buildCollectionRevalidateAfterDelete<FakeDoc>(() => ['/news'])

    const returned = hook(args as unknown as Parameters<typeof hook>[0])

    expect(returned).toBe(args.doc)
    expect(warn).toHaveBeenCalledTimes(1)
  })
})

describe('buildGlobalRevalidateAfterChange', () => {
  it('resolver が返したパスを revalidate して doc を返す', () => {
    const warn = createWarn()
    const args = createCollectionArgs(warn)
    const hook = buildGlobalRevalidateAfterChange(() => ['/'])

    const returned = hook(args as unknown as Parameters<typeof hook>[0])

    expect(revalidatePath).toHaveBeenCalledWith('/', undefined)
    expect(revalidatePath).toHaveBeenCalledTimes(1)
    expect(returned).toBe(args.doc)
    expect(warn).not.toHaveBeenCalled()
  })

  it('revalidatePath が throw しても doc を返し warn でログする', () => {
    const warn = createWarn()
    const args = createCollectionArgs(warn)
    vi.mocked(revalidatePath).mockImplementationOnce(() => {
      throw new Error('outside request scope')
    })
    const hook = buildGlobalRevalidateAfterChange(() => ['/'])

    const returned = hook(args as unknown as Parameters<typeof hook>[0])

    expect(returned).toBe(args.doc)
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
