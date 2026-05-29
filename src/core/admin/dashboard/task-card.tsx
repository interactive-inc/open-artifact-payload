import Link from 'next/link'
import React from 'react'
import {
  FileText,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Mail,
  Map,
  Megaphone,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'

import type { DashboardTask, DashboardTaskIcon } from './types'

type Props = {
  task: DashboardTask
  size: 'large' | 'small'
}

const iconMap: Record<DashboardTaskIcon, LucideIcon> = {
  megaphone: Megaphone,
  home: Home,
  image: ImageIcon,
  map: Map,
  users: Users,
  fileText: FileText,
  mail: Mail,
  settings: Settings,
  helpCircle: HelpCircle,
}

export function TaskCard(props: Props) {
  const Icon = iconMap[props.task.icon]
  const className =
    props.size === 'large'
      ? 'ictms-dashboard__task ictms-dashboard__task--large'
      : 'ictms-dashboard__task ictms-dashboard__task--small'

  return (
    <Link className={className} href={props.task.href}>
      <span className="ictms-dashboard__task-icon">
        <Icon aria-hidden="true" size={props.size === 'large' ? 32 : 20} />
      </span>
      <span className="ictms-dashboard__task-label">{props.task.label}</span>
      {props.task.description ? (
        <span className="ictms-dashboard__task-description">{props.task.description}</span>
      ) : null}
    </Link>
  )
}
