
const fs = require("fs");
let code = fs.readFileSync("e:/Louver-Control-System/app/page.tsx", "utf-8");

const mockFnStart = code.indexOf(`const generateMockData = (): SensorReading[] => {`);
if(mockFnStart !== -1) {
  const mockFnEnd = code.indexOf(`  return data
}

const createZeroReading`, mockFnStart);
  if(mockFnEnd !== -1) {
    code = code.substring(0, mockFnStart) + code.substring(mockFnEnd + 14);
  }
}

// Remove stray handleDataSourceChange
const handleDSStart = code.indexOf(`useEffect(() => {
    const handleDataSourceChange = async () => {`);
if (handleDSStart !== -1) {
  const handleDSEnd = code.indexOf(`handleDataSourceChange()
  }, [dataSource])`) + 36;
  code = code.substring(0, handleDSStart) + code.substring(handleDSEnd);
}

// Ensure toggleDataSource is totally gone
const toggleDataSourceStart = code.indexOf("const toggleDataSource = async () => {");
if (toggleDataSourceStart !== -1) {
  const toggleDataSourceEnd = code.indexOf("const downloadCSV = async () => {", toggleDataSourceStart);
  if(toggleDataSourceEnd !== -1){
    code = code.substring(0, toggleDataSourceStart) + code.substring(toggleDataSourceEnd);
  }
}

fs.writeFileSync("e:/Louver-Control-System/app/page.tsx", code);
console.log("Cleanup 3 script done");

