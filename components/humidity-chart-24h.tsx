"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets } from "lucide-react"
import { LineChart } from "@mui/x-charts/LineChart"

interface SensorReading {
  timestamp: string
  humidity: string
  depression: string
}

interface HumidityChart24hProps {
  data: SensorReading[]
}

export function HumidityChart24h({ data }: HumidityChart24hProps) {
  // Filter data for 4 PM to 4 PM
  const now = new Date()
  const current4PM = new Date(now)
  current4PM.setHours(16, 0, 0, 0)
  
  let startTime, endTime
  if (now.getTime() < current4PM.getTime()) {
    startTime = new Date(current4PM)
    startTime.setDate(startTime.getDate() - 1)
    endTime = new Date(current4PM)
  } else {
    startTime = new Date(current4PM)
    endTime = new Date(current4PM)
    endTime.setDate(endTime.getDate() + 1)
  }

  const parsedData = data
    .map((reading) => {
      let parsedDate = new Date(reading.timestamp)
      // Check for invalid date and attempt to parse custom format "12/28/2024, 1:20:17 PM"
      if (isNaN(parsedDate.getTime()) && reading.timestamp.includes(",")) {
        parsedDate = new Date(reading.timestamp.replace(',', ''))
      }
      return {
        originalReading: reading,
        date: parsedDate,
      }
    })
    .filter((item) => !isNaN(item.date.getTime()) && item.date >= startTime && item.date <= endTime)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const chartData = parsedData.map((item) => ({
    time: item.date,
    humidity: parseFloat(item.originalReading.humidity) || 0,
    depression: parseFloat(item.originalReading.depression) || 0,
  }))

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          <CardTitle className="text-base sm:text-lg">Last 24 Hours Moisture</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          {chartData.length} readings from the past 24 hours
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
                series={[
                  {
                    dataKey: 'humidity',
                    label: 'Humidity (%)',
                    color: '#3b82f6', // blue-500
                    showMark: false,
                    valueFormatter: (v) => `${v?.toFixed(1)}%`,
                  },
                  {
                    dataKey: 'depression',
                    label: 'Depression (°C)',
                    color: '#6366f1', // indigo-500
                    showMark: false,
                    valueFormatter: (v) => `${v?.toFixed(1)}°C`,
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
