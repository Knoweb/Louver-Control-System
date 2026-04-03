
const fs = require("fs");
let code = fs.readFileSync("e:/Louver-Control-System/app/page.tsx", "utf-8");

// 1. Remove generateMockData
const mockStart = code.indexOf(`const generateMockData = (): SensorReading[] => {`);
const mockEnd = code.indexOf(`return data\n}\n\n`, mockStart) + 14;
code = code.substring(0, mockStart) + code.substring(mockEnd);

// 2. Remove Toggle UI elements
code = code.replace(/<Button variant="outline" size="sm" onClick=\{toggleDataSource\} className="h-9 w-9 p-0 bg-transparent">\s*\{dataSource === "firebase" \? <Database className="h-4 w-4" \/> : <Wifi className="h-4 w-4" \/>\}\s*<\/Button>/, "");

code = code.replace(/<Badge\s*variant="outline"\s*className=\{\`text-sm px-3 py-2 \$\{dataSource === "firebase" \? "border-orange-500 text-orange-700 bg-orange-50" : "border-purple-500 text-purple-700 bg-purple-50"\}\`\}\s*>\s*\{dataSource === "firebase" \? "Firebase \(30s\)" : "Mock \(30s\)"\}\s*<\/Badge>/, `<Badge variant="outline" className="text-sm px-3 py-2 border-orange-500 text-orange-700 bg-orange-50">Firebase (30s)</Badge>`);

code = code.replace(/const \[dataSource, setDataSource\] = useState<"mock" \| "firebase">\("firebase"\)\n/, "");

// 3. Re-write updateSensorData to only check firebase and never mock
const reUpdateStart = code.indexOf(`  const updateSensorData = useCallback(async () => {`);
const reUpdateEnd = code.indexOf(`  }, [dataSource, currentReading])`) + 34;

const newUpdateCode = `  const updateSensorData = useCallback(async () => {
    console.log("[v0] Fetching new sensor reading...")
    setIsUpdating(true)
    const now = new Date()

    const firebaseReading = await fetchFirebaseData()
    if (firebaseReading) {
      const firebaseTimestamp = new Date(firebaseReading.timestamp)
      const dataAge = Math.abs(Date.now() - firebaseTimestamp.getTime())
      const isStale = dataAge > 5 * 60 * 1000 // 5 minutes

      if (isStale) {
        console.log("[v0] Firebase data is too stale, showing zero log")
        setFirebaseConnected(false)
        setCurrentReading(createZeroReading())
      } else {
        const isDuplicate = currentReading && 
          currentReading.timestamp === firebaseReading.timestamp &&
          currentReading.dryTemp === firebaseReading.dryTemp &&
          currentReading.rh === firebaseReading.rh

        if (isDuplicate) {
          console.log("[v0] WARNING: Received duplicate data from Firebase")
        } else {
          setFirebaseConnected(true)
          setLastValidFirebaseTime(firebaseTimestamp)
          
          setSensorData((prev) => {
            const newData = [...prev.slice(-19), firebaseReading]
            newData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            return newData
          })
          setHistoricalData((prev) => {
            const newHistorical = [...prev, firebaseReading]
            newHistorical.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            return newHistorical
          })
          setCurrentReading(firebaseReading)
        }
      }
    } else {
      setFirebaseConnected(false)
      console.log("[v0] Firebase failed, showing zero readings")
      setCurrentReading(createZeroReading())
    }

    setLastUpdate(now)
    setUpdateCount((prev) => prev + 1)
    setTimeout(() => setIsUpdating(false), 500)
  }, [currentReading])`;

code = code.substring(0, reUpdateStart) + newUpdateCode + code.substring(reUpdateEnd);

// 4. Update initializeData
code = code.replace(/if \(testData \&\& dataSource === "firebase"\) \{/, `if (testData) {`);

code = code.replace(/else \{\s*console\.log\("\[v0\] Firebase connection failed, using mock data"\)\s*setFirebaseConnected\(false\)\s*\}/, `else {
          console.log("[v0] Firebase connection failed, showing zero reading")
          setCurrentReading(createZeroReading())
          setFirebaseConnected(false)
        }`);

const initStaleStart = code.lastIndexOf(`if (dataAge > 5 * 60 * 1000) {`);
const initStaleEnd = code.indexOf(`setFirebaseConnected(false)\n            }`, initStaleStart);

code = code.replace(
`            if (dataAge > 5 * 60 * 1000) {
              console.log("[v0] Initial Firebase data is too stale")
              setFirebaseConnected(false)
            } else {
              console.log("[v0] Could not fetch array, using zero reading")
              const zeroData = createZeroReading()
              setCurrentReading(zeroData)
              setSensorData((prev) => [...prev.slice(-19), zeroData])
              setHistoricalData((prev) => [...prev, zeroData])
              setFirebaseConnected(false)
            }`,
`            if (dataAge > 5 * 60 * 1000) {
              console.log("[v0] Initial Firebase data is too stale")
              setFirebaseConnected(false)
              setCurrentReading(createZeroReading())
            } else {
              console.log("[v0] Could not fetch array, showing zero reading")
              setCurrentReading(createZeroReading())
              setFirebaseConnected(false)
            }`
);

// 5. Remove handleDataSourceChange useEffect completely
const handleDSStart = code.indexOf(`  useEffect(() => {
    const handleDataSourceChange`);
if(handleDSStart !== -1){
  const handleDSEnd = code.indexOf(`handleDataSourceChange()
  }, [dataSource])`) + 36;
  if(handleDSEnd !== -1 && handleDSEnd > handleDSStart){
    code = code.substring(0, handleDSStart) + code.substring(handleDSEnd);
  }
}

// 6. Remove toggleDataSource function
const toggleStart = code.indexOf(`  const toggleDataSource = async () =>`);
if (toggleStart !== -1) {
  const toggleEnd = code.indexOf(`  const downloadCSV = async () =>`);
  if (toggleEnd !== -1) {
    code = code.substring(0, toggleStart) + code.substring(toggleEnd);
  }
}

// 7. Fix up 24 hours CSV export block
code = code.replace(
`      // Filter data from last 24 hours
      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const filteredData = completeData.filter((reading) => {
        const readingTime = new Date(reading.timestamp)
        return readingTime >= twentyFourHoursAgo
      })`,
`      // Filter data for 4 PM to 4 PM
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

      const filteredData = completeData.filter((reading) => {
        const readingTime = new Date(reading.timestamp)
        return readingTime >= startTime && readingTime <= endTime
      })`
);

code = code.replace(
`      const headers = [
        "# Tea Factory Louver Control System - Last 24 Hours Data",
        \`# Export Date: \${new Date().toLocaleString()}\`,
        \`# Time Range: Last 24 hours (\${twentyFourHoursAgo.toLocaleString()} to \${now.toLocaleString()})\`,
        \`# Data Points: \${filteredData.length} readings\`,`,
`      const headers = [
        "# Tea Factory Louver Control System - Last 24 Hours Data",
        \`# Export Date: \${now.toLocaleString()}\`,
        \`# Time Range: 4 PM to 4 PM (\${startTime.toLocaleString()} to \${endTime.toLocaleString()})\`,
        \`# Data Points: \${filteredData.length} readings\`,`
);

fs.writeFileSync("e:/Louver-Control-System/app/page.tsx", code);
console.log("Refactor script complete");

