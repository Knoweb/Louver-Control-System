
const fs = require("fs");
let code = fs.readFileSync("e:/Louver-Control-System/app/page.tsx", "utf-8");

// Remove mock function
const mockFnStart = code.indexOf("const generateMockData =");
if(mockFnStart !== -1) {
  const mockFnEnd = code.indexOf("return data\n}\n", mockFnStart) + 14;
  code = code.substring(0, mockFnStart) + code.substring(mockFnEnd);
}

// Remove data source state
code = code.replace(/const \[dataSource, setDataSource\] = useState<"mock" \| "firebase">\("firebase"\)\n\s*/, "");

// Remove toggle data source
const toggleSrcStart = code.indexOf("const toggleDataSource = async");
if(toggleSrcStart !== -1) {
  let end = code.indexOf("const downloadCSV =", toggleSrcStart);
  code = code.substring(0, toggleSrcStart) + code.substring(end);
}

fs.writeFileSync("e:/Louver-Control-System/app/page.tsx", code);
console.log("Cleanup script done");

