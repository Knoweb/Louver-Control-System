
const fs = require("fs");
let code = fs.readFileSync("e:/Louver-Control-System/app/page.tsx", "utf-8");

// update updateSensorData logic
const updateStart = code.indexOf(`const updateSensorData = useCallback(async () => {
    console.log("[v0] Generating new sensor reading...")
    setIsUpdating(true)
    const now = new Date()`);

if (updateStart !== -1) {
  const updateEnd = code.indexOf(", [dataSource, currentReading])") + 31;
  const newUpdateFn = `const updateSensorData = useCallback(async () => {
    console.log("[v0] Fetching new sensor reading...")
    setIsUpdating(true)
    const now = new Date()

    const firebaseReading = await fetchFirebaseData()
    if (firebaseReading) {
      // Check if data is stale (older than 5 minutes)
      const firebaseTimestamp = new Date(firebaseReading.timestamp)
      const dataAge = Math.abs(Date.now() - firebaseTimestamp.getTime())
      const isStale = dataAge > 5 * 60 * 1000 // 5 minutes

      if (isStale) {
        console.log("[v0] Firebase data is too stale")
        setFirebaseConnected(false)
        setCurrentReading(createZeroReading())
      } else {
        const isDuplicate =
          currentReading &&
          currentReading.timestamp === firebaseReading.timestamp &&
          currentReading.dryTemp === firebaseReading.dryTemp &&
          currentReading.rh === firebaseReading.rh

        if (isDuplicate) {
          console.log("[v0] WARNING: Received duplicate data")
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
      console.log("[v0] Firebase failed, using zero reading")
      setCurrentReading(createZeroReading())
    }

    setLastUpdate(now)
    setUpdateCount((prev) => prev + 1)
    setTimeout(() => setIsUpdating(false), 500)
  }, [currentReading])`;
  
  code = code.substring(0, updateStart) + newUpdateFn + code.substring(updateEnd);
}

// 2. Remove dataSource from initializeData
code = code.replace(/if \(testData && dataSource === "firebase"\)/, "if (testData)");
code = code.replace(/else \{\s*console\.log\("\[v0\] Firebase connection failed, using mock data"\)\s*setFirebaseConnected\(false\)\s*\}/, "");

// Replace the zero appending in initializeData
const oldStaleFallback = `console.log("[v0] Initial Firebase data is too stale")
              setFirebaseConnected(false)
            } else {
              console.log("[v0] Could not fetch array, using zero reading")
              const zeroData = createZeroReading()
              setCurrentReading(zeroData)
              setSensorData((prev) => [...prev.slice(-19), zeroData])
              setHistoricalData((prev) => [...prev, zeroData])
              setFirebaseConnected(false)
            }`;
const newStaleFallback = `console.log("[v0] Initial Firebase data is too stale")
              setFirebaseConnected(false)
              setCurrentReading(createZeroReading())
            } else {
              setCurrentReading(createZeroReading())
              setFirebaseConnected(false)
            }`;
code = code.replace(oldStaleFallback, newStaleFallback);

// In handleDataSourceChange (now just a generic data connection watcher), 
// wait, we can just delete handleDataSourceChange entirely since we removed dataSource
const dsChangeStart = code.indexOf(`const handleDataSourceChange = async () => {`);
if (dsChangeStart !== -1) {
  let dsEnd = code.indexOf(`handleDataSourceChange()
    }, [dataSource])`) + 41;
  code = code.substring(0, dsChangeStart) + code.substring(dsEnd);
}
// Remove the leftover useEffect wrapper for handleDataSourceChange
code = code.replace(/useEffect\(\(\) => \{\n\s+$/, "");

fs.writeFileSync("e:/Louver-Control-System/app/page.tsx", code);
console.log("Cleanup 2 script done");

