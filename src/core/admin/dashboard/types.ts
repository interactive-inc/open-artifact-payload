export type DashboardTaskIcon =
  | 'megaphone'
  | 'home'
  | 'image'
  | 'map'
  | 'users'
  | 'fileText'
  | 'mail'
  | 'settings'
  | 'helpCircle'

export type DashboardTaskPriority = 'primary' | 'secondary'

export type DashboardTask = {
  id: string
  icon: DashboardTaskIcon
  label: string
  description?: string
  href: string
  priority?: DashboardTaskPriority
}
