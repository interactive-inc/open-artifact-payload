import type { Endpoint } from 'payload'

import { isUserAccount } from '@/core/lib/access/is-user-account'
import { parseAiTranslateRequest } from '@/core/lib/ai-translation/parse-ai-translate-request'
import { runAiTranslation } from '@/core/lib/ai-translation/run-ai-translation'

/**
 * POST /api/ai-translate
 * 受け付けるのは対象ドキュメントの参照と翻訳先言語のみ。原稿はサーバー側で CMS から
 * 取得するため、任意の文章を AI へ送る手段にはならない（チャット用途への流用防止）。
 */
export const aiTranslateEndpoint: Endpoint = {
  path: '/ai-translate',
  method: 'post',
  handler: async (req) => {
    if (!isUserAccount(req.user)) {
      return Response.json({ message: 'ログインが必要です' }, { status: 401 })
    }

    // 不正な JSON ボディで 500 にならないよう、パース失敗も 400 に寄せる
    const body: unknown = req.json ? await req.json().catch(() => null) : null
    const request = parseAiTranslateRequest(body)

    if (request instanceof Error) {
      return Response.json({ message: request.message }, { status: 400 })
    }

    const summary = await runAiTranslation({ payload: req.payload, user: req.user, request })

    if (summary instanceof Error) {
      return Response.json({ message: summary.message }, { status: 422 })
    }

    return Response.json(summary)
  },
}
