import { describe, expect, it } from 'vitest'

import { dashboardTasks } from '@/project/admin/dashboard-tasks'

describe('dashboard tasks', () => {
  it('タスク id は重複しない', () => {
    const ids = dashboardTasks.map((task) => task.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('priority の値は primary または secondary', () => {
    for (const task of dashboardTasks) {
      if (task.priority) {
        expect(['primary', 'secondary']).toContain(task.priority)
      }
    }
  })

  it('全タスクが非空の id / label / href を持つ', () => {
    for (const task of dashboardTasks) {
      expect(task.id.length).toBeGreaterThan(0)
      expect(task.label.length).toBeGreaterThan(0)
      expect(task.href.length).toBeGreaterThan(0)
    }
  })

  it('href は管理画面内パス (/admin で始まる)', () => {
    for (const task of dashboardTasks) {
      expect(task.href.startsWith('/admin')).toBe(true)
    }
  })

  it('id は kebab-case', () => {
    for (const task of dashboardTasks) {
      expect(task.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })
})
