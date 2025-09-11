"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AnalyticsMetricsProps } from "@/types/analytics-types"
import { Target, DollarSign, Star, Users } from "lucide-react"

export function AnalyticsMetrics({ totalProjects, totalRevenue, avgRating, happyClients }: AnalyticsMetricsProps) {
  const metrics = [
    {
      title: "Total Projects",
      value: totalProjects.toString(),
      icon: Target,
      gradient: "from-blue-500 to-blue-600",
      textColor: "text-blue-100",
      iconColor: "text-blue-200",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-100",
      iconColor: "text-emerald-200",
    },
    {
      title: "Avg Rating",
      value: avgRating.toFixed(1),
      icon: Star,
      gradient: "from-amber-500 to-orange-500",
      textColor: "text-amber-100",
      iconColor: "text-amber-200",
      fillIcon: true,
    },
    {
      title: "Happy Clients",
      value: happyClients.toString(),
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      textColor: "text-purple-100",
      iconColor: "text-purple-200",
    },
  ]

  return (
    <section
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
      aria-label="Key Performance Metrics"
    >
      {metrics.map((metric) => {
        const IconComponent = metric.icon
        return (
          <Card key={metric.title} className={`bg-gradient-to-br ${metric.gradient} text-white shadow-xl border-0`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold" aria-label={`${metric.title}: ${metric.value}`}>
                    {metric.value}
                  </div>
                  <p className={`${metric.textColor} text-sm`}>{metric.title}</p>
                </div>
                <IconComponent
                  className={`h-8 w-8 ${metric.iconColor} ${metric.fillIcon ? "fill-current" : ""}`}
                  aria-hidden="true"
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
