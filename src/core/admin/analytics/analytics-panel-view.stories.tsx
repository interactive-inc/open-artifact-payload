import type { Meta, StoryObj } from "@storybook/react-vite"

import { AnalyticsPanelView } from "@/core/admin/analytics/analytics-panel-view"
import {
  exampleAnalyticsPeriod,
  exampleAnalyticsTraffic,
  exampleInquiryCounts,
} from "@/core/test-support/example-analytics-traffic"
import "@/core/admin/dashboard/dashboard-view.css"

const meta: Meta<typeof AnalyticsPanelView> = {
  title: "Core/Admin/AnalyticsPanelView",
  component: AnalyticsPanelView,
  tags: ["autodocs"],
  args: {
    range: "28d",
    period: exampleAnalyticsPeriod,
    trafficState: { status: "ready", traffic: exampleAnalyticsTraffic },
    inquiries: exampleInquiryCounts,
    settingsHref: "/admin/globals/analytics-settings",
  },
}

export default meta

type Story = StoryObj<typeof AnalyticsPanelView>

export const Ready: Story = {}

export const NotConfigured: Story = {
  args: { trafficState: { status: "not-configured" } },
}

export const Stale: Story = {
  args: {
    trafficState: { status: "stale", traffic: exampleAnalyticsTraffic, errorKind: "unauthorized" },
  },
}

export const Failed: Story = {
  args: { trafficState: { status: "failed", errorKind: "unavailable" } },
}

export const Empty: Story = {
  args: {
    trafficState: {
      status: "ready",
      traffic: {
        ...exampleAnalyticsTraffic,
        dailyTrend: exampleAnalyticsTraffic.dailyTrend.map((point) => ({
          ...point,
          activeUsers: 0,
          screenPageViews: 0,
        })),
        previousDailyTrend: exampleAnalyticsTraffic.previousDailyTrend.map((point) => ({
          ...point,
          activeUsers: 0,
          screenPageViews: 0,
        })),
        totals: {
          current: { activeUsers: 0, screenPageViews: 0, sessions: 0 },
          previous: { activeUsers: 0, screenPageViews: 0, sessions: 0 },
        },
        topPages: [],
        channels: [],
      },
    },
    inquiries: { daily: [], currentTotal: 0, previousTotal: 0 },
  },
}
