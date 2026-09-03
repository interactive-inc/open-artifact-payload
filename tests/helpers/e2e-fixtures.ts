import type { Payload } from "payload"

/**
 * Cloudflare が公開しているテスト用キー。site key は常にウィジェットを解決し、
 * secret は siteverify が常に success を返す。本番と同じ経路のまま E2E を通せる。
 * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
export const e2eTurnstileKeys = {
  siteKey: "1x00000000000000000000AA",
  secretKey: "1x0000000000000000000000000000000AA",
} as const

/** E2E が前提にする固定データ。DB は毎回作り直すため値は変化しない。 */
export const e2eFixtures = {
  siteName: "E2E フィクスチャ株式会社",
  homeHeroTitle: "E2E フィクスチャのヒーロー見出し",
  aboutHeroTitle: "E2E フィクスチャの会社概要",
  serviceHeroTitle: "E2E フィクスチャのサービス",
  publishedNews: {
    title: "E2E 公開お知らせ インフォメーション",
    slug: "e2e-published-news-info",
  },
  publishedPressNews: {
    title: "E2E 公開お知らせ プレスリリース",
    slug: "e2e-published-news-press",
  },
  draftNews: {
    title: "E2E 下書きお知らせ",
    slug: "e2e-draft-news",
  },
  publishedWork: {
    title: "E2E 公開制作実績",
    slug: "e2e-published-work",
  },
  draftWork: {
    title: "E2E 下書き制作実績",
    slug: "e2e-draft-work",
  },
  faqQuestion: "E2E フィクスチャのよくある質問",
} as const

/** 段落 1 つだけの Lexical リッチテキストを組み立てる。 */
function richText(paragraph: string) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          textFormat: 0,
          children: [
            {
              type: "text",
              text: paragraph,
              format: 0,
              detail: 0,
              mode: "normal",
              style: "",
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

/**
 * E2E が参照するコンテンツを Local API で投入する。
 * 呼び出し側 (prepare-e2e.ts) が空の D1 を用意した直後に一度だけ実行する前提。
 */
export async function seedE2eFixtures(payload: Payload): Promise<void> {
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      siteName: e2eFixtures.siteName,
      footerText: "© E2E フィクスチャ株式会社",
      companyInfo: {
        address: "〒100-0000 東京都千代田区 E2E 1-1-1",
        tel: "03-0000-0000",
      },
      headerNav: [{ label: "お知らせ", href: "/news" }],
      footerNav: [{ label: "お知らせ", href: "/news" }],
      policyLinks: [{ label: "プライバシーポリシー", href: "/privacy" }],
      turnstileSiteKey: e2eTurnstileKeys.siteKey,
    },
  })

  await payload.updateGlobal({
    slug: "home-page",
    data: {
      hero: {
        enabled: true,
        title: e2eFixtures.homeHeroTitle,
        subtitle: "E2E フィクスチャのサブタイトル",
        ctaLabel: "サービスを見る",
        ctaHref: "/service",
      },
      featuredNews: { enabled: true, heading: "最新のお知らせ" },
    },
  })

  await payload.updateGlobal({
    slug: "about",
    data: {
      hero: {
        enabled: true,
        title: e2eFixtures.aboutHeroTitle,
        subtitle: "E2E フィクスチャの会社概要サブタイトル",
      },
    },
  })

  await payload.updateGlobal({
    slug: "service",
    data: {
      hero: {
        enabled: true,
        title: e2eFixtures.serviceHeroTitle,
        subtitle: "E2E フィクスチャのサービスサブタイトル",
      },
    },
  })

  await payload.create({
    collection: "news",
    data: {
      title: e2eFixtures.publishedNews.title,
      slug: e2eFixtures.publishedNews.slug,
      publishedAt: "2026-01-10T09:00:00.000Z",
      category: "info",
      body: richText("E2E で参照する公開済みのお知らせ本文です。"),
      _status: "published",
    },
  })

  await payload.create({
    collection: "news",
    data: {
      title: e2eFixtures.publishedPressNews.title,
      slug: e2eFixtures.publishedPressNews.slug,
      publishedAt: "2026-01-05T09:00:00.000Z",
      category: "press",
      body: richText("E2E で参照するカテゴリ違いの公開済みお知らせ本文です。"),
      _status: "published",
    },
  })

  await payload.create({
    collection: "news",
    data: {
      title: e2eFixtures.draftNews.title,
      slug: e2eFixtures.draftNews.slug,
      publishedAt: "2026-01-20T09:00:00.000Z",
      category: "info",
      body: richText("E2E で公開されないことを確かめる下書き本文です。"),
      _status: "draft",
    },
  })

  await payload.create({
    collection: "works",
    data: {
      title: e2eFixtures.publishedWork.title,
      slug: e2eFixtures.publishedWork.slug,
      category: "web",
      publishedAt: "2026-01-08",
      summary: "E2E で参照する公開済みの制作実績です。",
      body: richText("E2E で参照する公開済みの制作実績本文です。"),
      _status: "published",
    },
  })

  await payload.create({
    collection: "works",
    data: {
      title: e2eFixtures.draftWork.title,
      slug: e2eFixtures.draftWork.slug,
      category: "product",
      publishedAt: "2026-01-18",
      summary: "E2E で公開されないことを確かめる下書きの制作実績です。",
      body: richText("E2E で公開されないことを確かめる下書き本文です。"),
      _status: "draft",
    },
  })

  await payload.create({
    collection: "faq",
    data: {
      question: e2eFixtures.faqQuestion,
      answer: "E2E フィクスチャの回答です。",
      category: "general",
      order: 1,
    },
  })
}
