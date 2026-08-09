import type { UiDictionary } from "@/project/shared/lib/ui-dictionary-types"

export const uiDictionaryEn: UiDictionary = {
  nav: {
    contact: "Contact",
    menuOpen: "Open menu",
    menuClose: "Close menu",
  },
  footer: {
    menuHeading: "Menu",
    snsHeading: "Social",
    defaultCopyright: "All rights reserved.",
  },
  common: {
    home: "Home",
  },
  news: {
    title: "News",
    description: "Latest updates and press releases",
    empty: "No posts yet.",
    categoryLabels: {
      info: "News",
      press: "Press Release",
      event: "Event",
    },
    backToList: "Back to News",
  },
  works: {
    title: "Works",
    empty: "No works yet.",
    category: "Category",
    publishedAt: "Published",
    backToList: "Back to Works",
  },
  faq: {
    title: "FAQ",
    empty: "No FAQs yet.",
    categoryLabels: {
      general: "General",
      service: "Service",
      pricing: "Pricing",
      other: "Other",
    },
    ctaText: "If this did not resolve your question, feel free to contact us",
    ctaButton: "Contact Us",
  },
  contact: {
    title: "Contact",
    description: "Feel free to reach out for consultations or quotes",
    formHeading: "Contact Form",
    phoneHeading: "Contact by Phone",
    phoneHours: "Weekdays 9:00-18:00",
    addressHeading: "Address",
    faqHeading: "FAQ",
    faqDescription: "Please check our FAQ first if you have any questions.",
    faqButton: "View FAQ",
    thanksTitle: "Thank You",
    thanksDescription: "Your inquiry has been received",
    thanksBody: "Our staff will contact you within 3 business days.\nPlease wait for our response.",
    backToHome: "Back to Home",
  },
  notFound: {
    title: "Page Not Found",
    description: "The URL may have changed or the page may have been removed.",
    backToHome: "Back to Home",
  },
  contactForm: {
    name: "Name",
    companyName: "Company",
    companyNameOptional: "Company (optional)",
    email: "Email",
    phone: "Phone",
    phoneOptional: "Phone (optional)",
    inquiryType: "Inquiry Type",
    inquiryTypePlaceholder: "Please select",
    message: "Message",
    submit: "Submit",
    submitting: "Submitting...",
    turnstileFailed: "This submission was flagged as spam. Please try again.",
    serverError: "An error occurred while submitting. Please wait and try again.",
  },
  home: {
    heroTitle: "SAMPLE, then ship.",
    whatWeDo: "What we do",
    stats: [
      { value: "120+", label: "Projects" },
      { value: "15yrs", label: "In Business" },
      { value: "98%", label: "Retention" },
      { value: "40", label: "Members" },
    ],
    aboutLabel: "About",
    aboutBody:
      "We shape business challenges into reality through both engineering and design. From planning to implementation and operation, we walk alongside you to deliver products built to last.",
    stackLabel: "Stack",
    worksLabel: "Works",
    worksHeading: "Works",
    viewAll: "View All",
    voiceLabel: "Voice",
    voices: [
      {
        quote:
          "They partnered with us from the earliest, most ambiguous stage of requirements and delivered results beyond our expectations.",
        name: "Naoki Tamura",
        role: "Manufacturing / Head of Business Planning",
        avatarId: 1005,
      },
      {
        quote:
          "We trust them as a long-term partner, including their improvement proposals after launch.",
        name: "Misaki Kobayashi",
        role: "Retail / Marketing Manager",
        avatarId: 1011,
      },
    ],
    newsLabel: "News",
    newsHeading: "News",
  },
}
