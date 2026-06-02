import { describe, expect, it } from 'vite-plus/test'

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
})
