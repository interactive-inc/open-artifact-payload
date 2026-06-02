import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function seed() {
  const payload = await getPayload({ config: await config })

  console.log('Seeding site settings...')
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'インタラクティブ株式会社',
      footerText: '© 2024 インタラクティブ株式会社. All rights reserved.',
      companyInfo: {
        address: '〒100-0005 東京都千代田区丸の内1丁目1番1号\nインタラクティブビル 8F',
        tel: '03-1234-5678',
        fax: '03-1234-5679',
      },
      headerNav: [
        { label: 'サービス', href: '/service' },
        { label: '会社概要', href: '/about' },
        { label: 'お知らせ', href: '/news' },
        { label: 'FAQ', href: '/faq' },
      ],
      footerNav: [
        { label: 'トップ', href: '/' },
        { label: 'サービス', href: '/service' },
        { label: '会社概要', href: '/about' },
        { label: 'お知らせ', href: '/news' },
        { label: 'FAQ', href: '/faq' },
        { label: 'お問い合わせ', href: '/contact' },
      ],
      policyLinks: [
        { label: 'プライバシーポリシー', href: '/privacy' },
        { label: '特定商取引法に基づく表記', href: '/legal' },
        { label: 'サイトマップ', href: '/sitemap' },
      ],
    },
  })

  console.log('Seeding home page...')
  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      hero: {
        enabled: true,
        title: 'プログラミングと、\nデザインと。',
        subtitle:
          'インタラクティブは、Webシステム開発・クラウドインフラ・DX推進支援を通じて、企業のデジタル変革を力強くサポートします。',
        ctaLabel: 'サービスを見る',
        ctaHref: '/service',
      },
      services: {
        enabled: true,
        heading: '私たちが提供するサービス',
        subheading:
          '企画・設計から開発・運用まで一貫してサポート。お客様のビジネス成長に貢献します。',
        items: [
          {
            icon: '🌐',
            title: 'Webシステム開発',
            description:
              '業務効率化・顧客体験向上を目的としたWebアプリケーションをフルスタックで開発。スケーラブルで保守性の高いシステムを提供します。',
          },
          {
            icon: '☁️',
            title: 'クラウドインフラ構築',
            description:
              'AWS・GCP・Cloudflareを活用したモダンなインフラ設計・構築・運用。コスト最適化と高可用性を両立します。',
          },
          {
            icon: '🚀',
            title: 'DX推進支援',
            description:
              'デジタル変革の戦略立案から実行まで伴走支援。業務プロセスの自動化・データ活用で競争力を高めます。',
          },
        ],
      },
      aboutPreview: {
        enabled: true,
        heading: 'テクノロジーで、\n未来をともに創る',
        description:
          'インタラクティブは2010年の創業以来、「技術で人と企業の可能性を広げる」という理念のもと、100社以上のデジタル変革を支援してきました。エンジニアリングの力で、お客様のビジネスに新たな価値を創出します。',
        ctaLabel: '会社概要を見る',
        ctaHref: '/about',
      },
      featuredNews: {
        enabled: true,
        heading: '最新のお知らせ',
      },
      cta: {
        enabled: true,
        heading: 'まずはお気軽にご相談ください',
        description: 'ご要望やお悩みをお聞かせください。最適なソリューションをご提案します。',
        ctaLabel: 'お問い合わせする',
        ctaHref: '/contact',
      },
    },
  })

  console.log('Seeding about page...')
  await payload.updateGlobal({
    slug: 'about',
    data: {
      hero: {
        enabled: true,
        title: '会社概要',
        subtitle: 'インタラクティブ株式会社について',
      },
      mission: {
        enabled: true,
        heading: 'ミッション・バリュー',
        description:
          '「技術で人と企業の可能性を広げる」——この理念を軸に、私たちはお客様と共に考え、共に挑戦し続けます。',
        values: [
          {
            title: 'Technology First',
            description:
              '最新技術を積極的に取り入れ、常にベストな選択をします。技術的負債を最小化し、長期的な価値を創造します。',
          },
          {
            title: 'Customer Success',
            description:
              'お客様の成功が私たちの成功。プロジェクト完了後も継続的なサポートで長期的なパートナーシップを築きます。',
          },
          {
            title: 'Transparency',
            description:
              '進捗・課題・コストをオープンに共有します。誠実なコミュニケーションが信頼の基盤です。',
          },
          {
            title: 'Continuous Growth',
            description:
              '社員一人ひとりの成長がチームと会社の成長につながります。学習機会の提供と自律的なキャリア形成を支援します。',
          },
        ],
      },
      companyProfile: {
        enabled: true,
        heading: '会社情報',
        rows: [
          { label: '会社名', value: 'インタラクティブ株式会社' },
          { label: '英語名', value: 'Interactive Inc.' },
          { label: '設立', value: '2010年4月1日' },
          { label: '代表取締役', value: '田中 誠一郎' },
          { label: '資本金', value: '5,000万円' },
          { label: '従業員数', value: '87名（2024年4月現在）' },
          {
            label: '所在地',
            value: '〒100-0005\n東京都千代田区丸の内1丁目1番1号\nインタラクティブビル 8F',
          },
          { label: '電話番号', value: '03-1234-5678' },
          {
            label: '事業内容',
            value:
              'Webシステム開発\nクラウドインフラ構築・運用\nDX推進コンサルティング\nUI/UXデザイン',
          },
          { label: '取引銀行', value: '三菱UFJ銀行 丸の内支店\n三井住友銀行 東京営業部' },
        ],
      },
      members: {
        enabled: true,
        heading: 'リーダーシップチーム',
        items: [
          {
            name: '田中 誠一郎',
            position: '代表取締役 CEO',
            bio: '早稲田大学理工学部卒業後、大手SIerでエンタープライズシステムの設計・開発に従事。2010年にインタラクティブを創業。テクノロジーで日本企業のDXを加速させることを使命とする。',
          },
          {
            name: '鈴木 美咲',
            position: '取締役 CTO',
            bio: '東京大学情報科学科修士課程修了。外資系コンサルファームを経て2013年に入社。クラウドアーキテクチャとDevOpsの専門家。AWS Certified Solutions Architect Professional。',
          },
          {
            name: '佐藤 健太',
            position: '執行役員 プロダクト本部長',
            bio: 'プロダクトマネジメントの経験15年。大手ECサービスのPMを経て2016年に入社。ユーザー中心設計とアジャイル開発でプロダクトの価値最大化を推進。',
          },
          {
            name: '山田 有希',
            position: '執行役員 デザイン本部長',
            bio: '武蔵野美術大学視覚伝達デザイン学科卒業。UI/UXデザイン専門会社を経て2018年に入社。デザインシステムの構築とサービスのブランド戦略を担当。',
          },
        ],
      },
    },
  })

  console.log('Seeding service page...')
  await payload.updateGlobal({
    slug: 'service',
    data: {
      hero: {
        enabled: true,
        title: 'サービス',
        subtitle: '企画・設計から開発・運用まで、ビジネスの成長を支援するサービスを提供します',
      },
      services: {
        enabled: true,
        heading: 'サービス一覧',
        items: [
          {
            icon: '🌐',
            title: 'Webシステム開発',
            description:
              '業務システム・顧客向けWebサービス・APIの設計・開発を行います。React/Next.js・TypeScript・Cloudflareなど最新技術スタックを活用し、高品質なプロダクトを短期間で提供します。',
            features: [
              { text: 'フロントエンド開発（React / Next.js）' },
              { text: 'バックエンド開発（Node.js / Python）' },
              { text: 'API設計・開発（REST / GraphQL）' },
              { text: 'データベース設計・最適化' },
              { text: '既存システムのリニューアル・移行' },
            ],
          },
          {
            icon: '☁️',
            title: 'クラウドインフラ構築',
            description:
              'AWSやCloudflareを活用した安定・スケーラブルなインフラを構築します。Infrastructure as Code（Terraform / CDK）による自動化と、コスト最適化を実現します。',
            features: [
              { text: 'AWS / GCP / Cloudflare 構築・運用' },
              { text: 'Infrastructure as Code（Terraform）' },
              { text: 'CI/CD パイプライン構築' },
              { text: 'セキュリティ強化・コンプライアンス対応' },
              { text: '24時間365日の監視・障害対応' },
            ],
          },
          {
            icon: '🚀',
            title: 'DX推進コンサルティング',
            description:
              '業務プロセスの分析からデジタル化戦略の策定、実行支援まで一貫して伴走します。RPAや生成AIの活用で業務効率を大幅に改善します。',
            features: [
              { text: '業務プロセス分析・改善提案' },
              { text: 'RPA / 業務自動化の設計・導入' },
              { text: '生成AI活用コンサルティング' },
              { text: 'データ分析基盤の構築' },
              { text: 'デジタル人材育成研修' },
            ],
          },
          {
            icon: '🎨',
            title: 'UI/UXデザイン',
            description:
              'ユーザーリサーチからプロトタイプ検証、デザインシステム構築まで対応。ビジネス目標とユーザー体験を両立する使いやすいUIを提供します。',
            features: [
              { text: 'ユーザーリサーチ・ペルソナ設計' },
              { text: 'ワイヤーフレーム・プロトタイプ作成' },
              { text: 'デザインシステム構築' },
              { text: 'Webサイト・アプリのUIデザイン' },
              { text: 'アクセシビリティ対応（WCAG準拠）' },
            ],
          },
        ],
      },
      process: {
        enabled: true,
        heading: 'ご支援の流れ',
        steps: [
          {
            title: 'ヒアリング・要件定義',
            description:
              'お客様の課題・目標・現状をヒアリングし、解決策を共に整理します。初回相談は無料です。',
          },
          {
            title: '提案・お見積もり',
            description:
              'ヒアリング内容をもとに、最適なソリューションと費用・スケジュールをご提案します。',
          },
          {
            title: '設計・開発',
            description:
              '2週間スプリントのアジャイル開発で進捗を見える化。定期デモで方向性を確認しながら進めます。',
          },
          {
            title: 'テスト・リリース',
            description:
              '品質保証テスト実施後、本番環境へリリース。移行計画から本番稼働まで丁寧にサポートします。',
          },
          {
            title: '運用・保守',
            description:
              'リリース後も継続的な改善・機能追加・障害対応を行います。月次レポートで改善状況を共有します。',
          },
        ],
      },
      cta: {
        enabled: true,
        heading: 'プロジェクトのご相談はお気軽に',
        description: 'まずは課題をお聞かせください。最適な解決策をご提案します。',
        ctaLabel: '無料相談を申し込む',
        ctaHref: '/contact',
      },
    },
  })

  console.log('Seeding FAQ...')
  const existingFaq = await payload.find({ collection: 'faq', limit: 1 })
  if (existingFaq.totalDocs === 0) {
    const faqItems = [
      {
        question: 'どのような規模の企業に対応していますか？',
        answer:
          'スタートアップから上場企業まで幅広く対応しています。プロジェクトの規模や予算に合わせて最適なチーム編成をご提案します。',
        category: 'general' as const,
        order: 1,
      },
      {
        question: '開発にかかる期間はどのくらいですか？',
        answer:
          'プロジェクトの規模・複雑さによって異なります。小規模なWebサイトで1〜2ヶ月、中規模Webシステムで3〜6ヶ月、大規模システムは6ヶ月以上が目安です。',
        category: 'service' as const,
        order: 2,
      },
      {
        question: '開発途中で要件が変わっても対応できますか？',
        answer:
          'はい。アジャイル開発を採用しており、2週間ごとのスプリントで柔軟に要件変更に対応します。変更内容に応じて都度スコープ調整をご相談します。',
        category: 'service' as const,
        order: 3,
      },
      {
        question: '料金体系を教えてください',
        answer:
          '主に月額制の準委任契約（ラボ型）と、固定額の請負契約の2種類をご用意しています。プロジェクトの性質や期間に応じてご提案します。',
        category: 'pricing' as const,
        order: 4,
      },
      {
        question: '最低発注金額はありますか？',
        answer:
          '明確な最低金額は設けていませんが、品質を担保するため月額50万円以上のプロジェクトを推奨しています。スポット相談は別途ご相談ください。',
        category: 'pricing' as const,
        order: 5,
      },
      {
        question: 'リリース後のサポートはありますか？',
        answer:
          'はい。リリース後の運用保守・障害対応・機能追加に対応しています。月額の保守契約プランをご用意していますのでご相談ください。',
        category: 'service' as const,
        order: 6,
      },
      {
        question: 'NDA（秘密保持契約）の締結は可能ですか？',
        answer:
          'はい。プロジェクト開始前にNDAを締結します。お客様の機密情報は厳格に管理いたします。',
        category: 'general' as const,
        order: 7,
      },
      {
        question: 'リモートでの開発も可能ですか？',
        answer:
          'はい。フルリモートでの開発に対応しています。オンラインミーティング・Slack・GitHubを活用してスムーズにプロジェクトを進めます。対面での打ち合わせも承ります。',
        category: 'general' as const,
        order: 8,
      },
    ]

    for (const item of faqItems) {
      await payload.create({ collection: 'faq', data: item })
    }
  }

  console.log('Seeding news...')
  const existingNews = await payload.find({ collection: 'news', limit: 1, draft: true })
  if (existingNews.totalDocs === 0) {
    await payload.create({
      collection: 'news',
      data: {
        title: 'インタラクティブ株式会社のWebサイトをリニューアルしました',
        slug: 'website-renewal-2024',
        publishedAt: '2024-04-01',
        category: 'info',
        _status: 'published',
      },
    })
    await payload.create({
      collection: 'news',
      data: {
        title: 'Cloudflare Workers対応のCMSテンプレート「Inta CMS」をオープンソースとして公開',
        slug: 'inta-cms-open-source',
        publishedAt: '2024-03-15',
        category: 'press',
        _status: 'published',
      },
    })
    await payload.create({
      collection: 'news',
      data: {
        title: '東京オフィスを千代田区丸の内に移転しました',
        slug: 'office-relocation-2024',
        publishedAt: '2024-02-01',
        category: 'info',
        _status: 'published',
      },
    })
  }

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})
