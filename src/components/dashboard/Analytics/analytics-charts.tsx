"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsChartsProps } from "@/types/analytics-types"
import { TrendingUp, BarChart3, Award, Star } from "lucide-react"

export function AnalyticsCharts({ monthlyPerformance, projectTypes, ratingDistribution }: AnalyticsChartsProps) {
  return (
    <>
      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" aria-label="Performance Charts">
        {/* Monthly Performance */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" aria-hidden="true" />
              Monthly Performance
            </CardTitle>
            <CardDescription>Projects and revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" role="list" aria-label="Monthly performance data">
              {monthlyPerformance.map((data, index) => (
                <div
                  key={data.month}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {data.month.slice(5)} {/* Show only month part */}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{data.projects} Projects</div>
                      <div className="text-sm text-slate-600">${data.revenue.toLocaleString()} Revenue</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${data.revenue.toLocaleString()}</div>
                    <div className="text-sm text-amber-600 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                      <span aria-label={`Average rating: ${data.avg_rating.toFixed(1)} stars`}>
                        {data.avg_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Types Distribution */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" aria-hidden="true" />
              Project Types
            </CardTitle>
            <CardDescription>Distribution of project types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" role="list" aria-label="Project type distribution">
              {projectTypes.map((type) => (
                <div key={type.type} className="space-y-2" role="listitem">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">{type.type}</span>
                    <span className="text-sm text-slate-600">{type.count} projects</span>
                  </div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-3"
                    role="progressbar"
                    aria-valuenow={type.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${type.type}: ${type.percentage}%`}
                  >
                    <div
                      className={`${type.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-sm text-slate-500">{type.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Client Satisfaction */}
      <section aria-label="Client Satisfaction">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" aria-hidden="true" />
              Client Satisfaction
            </CardTitle>
            <CardDescription>Rating distribution from client reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4" role="list" aria-label="Rating distribution">
              {ratingDistribution.map((item) => (
                <div key={item.rating} className="text-center" role="listitem">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="font-semibold">{item.rating}</span>
                    <Star className="h-4 w-4 fill-current text-amber-500" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mb-1">{item.count}</div>
                  <div className="text-sm text-slate-600">{item.percentage}%</div>
                  <div
                    className="w-full bg-gray-200 rounded-full h-2 mt-2"
                    role="progressbar"
                    aria-valuenow={item.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.rating} stars: ${item.percentage}%`}
                  >
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  )
}
