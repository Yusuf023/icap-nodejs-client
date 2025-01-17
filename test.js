import fs from "fs";
import scanFile from "./icapClient.js";

const test = async () => {
  const fileName = "testFile.txt";
  const fileStats = fs.statSync(fileName);
  const fileData = fs.readFileSync(fileName);
  const result = await scanFile({
    fileData,
    fileSize: fileStats.size,
    fileName,
    fileContentType: "text/plain",
  });
  console.log(result);
};

test();
