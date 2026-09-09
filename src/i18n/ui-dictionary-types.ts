export type UiDictionary = {
  nav: {
    contact: string
    menuOpen: string
    menuClose: string
  }
  footer: {
    menuHeading: string
    snsHeading: string
    defaultCopyright: string
  }
  common: {
    home: string
  }
  news: {
    title: string
    description: string
    empty: string
    categoryLabels: Record<string, string>
    backToList: string
  }
  works: {
    title: string
    empty: string
    category: string
    publishedAt: string
    backToList: string
  }
  faq: {
    title: string
    empty: string
    categoryLabels: Record<string, string>
    ctaText: string
    ctaButton: string
  }
  contact: {
    title: string
    description: string
    formHeading: string
    phoneHeading: string
    phoneHours: string
    addressHeading: string
    faqHeading: string
    faqDescription: string
    faqButton: string
    thanksTitle: string
    thanksDescription: string
    thanksBody: string
    backToHome: string
  }
  notFound: {
    title: string
    description: string
    backToHome: string
  }
  contactForm: {
    name: string
    companyName: string
    companyNameOptional: string
    email: string
    phone: string
    phoneOptional: string
    inquiryType: string
    inquiryTypePlaceholder: string
    message: string
    submit: string
    submitting: string
    turnstileFailed: string
    rateLimited: string
    serverError: string
  }
  home: {
    heroTitle: string
    whatWeDo: string
    stats: ReadonlyArray<{ value: string; label: string }>
    aboutLabel: string
    aboutBody: string
    stackLabel: string
    worksLabel: string
    worksHeading: string
    viewAll: string
    voiceLabel: string
    voices: ReadonlyArray<{ quote: string; name: string; role: string; avatarId: number }>
    newsLabel: string
    newsHeading: string
  }
}
