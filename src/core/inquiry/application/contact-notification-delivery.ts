export type ContactNotificationDelivery =
  | { status: "sent" }
  | { status: "alreadySent" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string }
