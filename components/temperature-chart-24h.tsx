"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer } from "lucide-react"
import { LineChart } from "@mui/x-charts/LineChart"

interface SensorReading {
  timestamp: string
  dryTemp: number
  wetTemp: number
  depression: number
}

interface TemperatureChart24hProps {
  data: SensorReading[]
}

export function TemperatureChart24h({ data }: TemperatureChart24hProps) {
  // Filter data for last 24 hours
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const last24hData = data.filter((reading) => {
    const readingTime = new Date(reading.timestamp)
    return readingTime >= twentyFourHoursAgo
  })

  const sortedData = [...last24hData].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const chartData = sortedData.map((reading) => ({
    time: new Date(reading.timestamp),
    dryTemp: Number.isFinite(reading.dryTemp) ? Number(reading.dryTemp) : null,
    wetTemp: Number.isFinite(reading.wetTemp) ? Number(reading.wetTemp) : null,
    depression: Number.isFinite(reading.depression) ? Number(reading.depression) : null,
  }))

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
          <CardTitle className="text-base sm:text-lg">Last 24 Hours Temperature Trends</CardTitle>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          {chartData.length} temperature readings from the past 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {chartData.length === 0 ? (
          <div className="h-[200px] xs:h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-muted-foreground">No data available for the last 24 hours</p>
          </div>
        ) : (
          <>
            <div className="h-[200px] xs:h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px] w-full">
              <LineChart
                dataset={chartData}
                xAxis={[{
                  dataKey: "time",
                  scaleType: "time",
                  tickLabelStyle: {
                    angle: -45,
                    textAnchor: "end",
                    fontSize: 10,
                  },
                  valueFormatter: (date: Date) => date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                }]}
                series={[
                  {
                    dataKey: "dryTemp",
                    label: "Dry Temp",
                    color: "#dc2626",
                    showMark: false,
                    valueFormatter: (value) => value ? `${value.toFixed(1)}°F` : "",
                  },
                  {
                    dataKey: "wetTemp",
                    label: "Wet Temp",
                    color: "#2563eb",
                    showMark: false,
                    valueFormatter: (value) => value ? `${value.toFixed(1)}°F` : "",
                  },
                  {
                    dataKey: "depression",
                    label: "Depression",
                    color: "#16a34a",
                    showMark: false,
                    valueFormatter: (value) => value ? `${value.toFixed(1)}°F` : "",
                  },
                ]}
                margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
                grid={{ vertical: true, horizontal: true }}
                slotProps={{
                  legend: {
                    direction: "row",
                    position: { vertical: "top", horizontal: "middle" },
                    padding: -5,
                  }
                }}
              />
            </div>
            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-600 rounded-full flex-shrink-0"></div>
                <span className="text-red-800">Optimal dry temp: 75-85°F</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span className="text-blue-800">Wet temp: moisture level</span>
              </div>
              <div className="flex items-center gap-2 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-600 rounded-full flex-shrink-0"></div>
                <span className="text-green-800">Depression: drying potential</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
