"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wind } from "lucide-react"
import { LineChart } from "@mui/x-charts/LineChart"

interface SensorReading {
  timestamp: string
  louverStatus: string
}

interface LouverStatusChart24hProps {
  data: SensorReading[]
}

export function LouverStatusChart24h({ data }: LouverStatusChart24hProps) {
  // Filter data for last 24 hours
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const parsedData = data
    .map((reading) => {
      let parsedDate = new Date(reading.timestamp)
      if (isNaN(parsedDate.getTime()) && reading.timestamp.includes(",")) {
        parsedDate = new Date(reading.timestamp.replace(',', ''))
      }
      return {
        originalReading: reading,
        date: parsedDate,
      }
    })
    .filter((item) => !isNaN(item.date.getTime()) && item.date >= twentyFourHoursAgo)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const chartData = parsedData.map((item) => {
    let louverPercent = 0
    if (item.originalReading.louverStatus.includes("%")) {
      louverPercent = parseFloat(item.originalReading.louverStatus.match(/(\d+(?:\.\d+)?)/)?.[1] || "0")
    }
    return {
      time: item.date,
      louverPercent,
      status: item.originalReading.louverStatus,
    }
  })

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
          <CardTitle className="text-base sm:text-lg">Last 24 Hours Louver Control</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          {chartData.length} louver status readings from the past 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[200px] xs:h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">No data available for the last 24 hours</p>
          </div>
        ) : (
          <>
            <div className="h-[200px] xs:h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] w-full">
              <LineChart
                dataset={chartData}
                xAxis={[
                  {
                    id: 'time',
                    dataKey: 'time',
                    scaleType: 'time',
                    valueFormatter: (value) => value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    tickLabelStyle: {
                      angle: -45,
                      textAnchor: 'end',
                      fontSize: 10,
                    },
                  },
                ]}
                yAxis={[
                  {
                    min: 0,
                    max: 100,
                  }
                ]}
                series={[
                  {
                    curve: "stepAfter",
                    dataKey: 'louverPercent',
                    label: 'Louver Opening (%)',
                    color: '#0d9488', // teal-600
                    showMark: false,
                    valueFormatter: (v) => `${v?.toFixed(1)}%`,
                  },
                ]}
                margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                slotProps={{
                  legend: {
                    direction: 'row',
                    position: { vertical: 'top', horizontal: 'middle' },
                    padding: 0,
                    labelStyle: { fontSize: 12 },
                  }
                }}
              />
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-teal-50 rounded-lg border border-teal-200">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-teal-600 rounded-full flex-shrink-0"></div>
                <span className="text-teal-800">Controls airflow and ventilation</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-600 rounded-full flex-shrink-0"></div>
                <span className="text-emerald-800">0% = Closed, 100% = Fully Open</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
