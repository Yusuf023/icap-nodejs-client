import net from "net";
import dotenv from "dotenv";
import { textMimeTypes } from "./mimeTypes.js";
import { errorLog, log } from "./logger.js";
dotenv.config();

const SERVER = process.env.ICAP_SERVER_HOST;
const PORT = process.env.ICAP_SERVER_PORT;
const ENDPOINT = process.env.ICAP_ENDPOINT;
const TIMEOUT = Number(process.env.ICAP_SERVER_TIMEOUT || 30000);
const USER_AGENT = "NodeJS ICAP/1.0 Client";

const parseIcapResponse = (data) => {
  const response = data.toString();
  log(3, "Raw ICAP Response: \n", response);

  // Extract the status code from the first line
  const statusLine = response.split("\r\n")[0];
  const statusCode = parseInt(statusLine.split(" ")[1]);

  // Initialize the response object with status code
  const parsedResponse = {
    statusCode: statusCode,
  };

  // Split headers and body
  const headersAndBody = response.split("\r\n\r\n");
  const headers = headersAndBody[0].split("\r\n").slice(1); // Skip the first line (status line)

  // Parse headers into the object
  headers.forEach((header) => {
    const [key, value] = header.split(": ");
    if (key && value) {
      parsedResponse[key] = value;
    }
  });
  return parsedResponse;
};

const handleOptionsRequest = (client) => {
  return new Promise((resolve, reject) => {
    log(1, "Sending OPTIONS request");

    // Construct OPTIONS request
    const request =
      `OPTIONS icap://${SERVER}:${PORT}/${ENDPOINT} ICAP/1.0\r\n` +
      `Host: ${SERVER}\r\n` +
      `User-Agent: ${USER_AGENT}\r\n` +
      `Encapsulated: null-body=0\r\n` +
      `\r\n`;

    log(2, "Constructed OPTIONS request: \n", request);

    // Send request to server
    client.write(request);

    const onData = (data) => {
      clearTimeout(timeout);
      const body = parseIcapResponse(data);
      if (body.statusCode !== 200) {
        const error = new Error(
          `OPTIONS Error: Unrecognised status code ${body.statusCode} in response`
        );
        errorLog(error.message, error);
        reject(error);
      } else {
        resolve();
      }
      client.removeListener("data", onData);
    };

    const onError = (e) => {
      clearTimeout(timeout);
      errorLog("OPTIONS Error: ", e);
      client.removeListener("data", onData);
      reject(e);
    };

    client.on("data", onData);

    client.on("error", onError);

    const timeout = setTimeout(() => {
      client.removeListener("data", onData);
      const error = new Error("OPTIONS request timed out");
      errorLog(error.message);
      reject(error);
    }, TIMEOUT);
  });
};

const handleRespmodRequest = (
  client,
  { fileData, fileSize, fileName, fileContentType },
  isTextBased
) => {
  return new Promise((resolve, reject) => {
    log(1, "Sending RESPMOD request");

    // Construct RESPMOD request
    const resHeader =
      `GET /${encodeURIComponent(fileName)} HTTP/1.1\r\n` +
      `Host: ${SERVER}:${PORT}\r\n\r\n`;

    const resBody =
      resHeader +
      `HTTP/1.1 200 OK\r\n` +
      `Date: ${new Date().toUTCString()}\r\n` +
      `Content-Type: ${fileContentType}\r\n` +
      `Content-Length: ${fileSize}\r\n\r\n`;

    const request =
      `RESPMOD icap://${SERVER}:${PORT}/${ENDPOINT} ICAP/1.0\r\n` +
      `Host: ${SERVER}\r\n` +
      `Connection: close\r\n` +
      `User-Agent: ${USER_AGENT}\r\n` +
      `Allow: 204\r\n` +
      `Encapsulated: req-hdr=0, res-hdr=${resHeader.length}, res-body=${resBody.length}\r\n\r\n` +
      resBody +
      `${fileSize.toString(16)}\r\n`;

    log(2, "Constructed RESPMOD request: \n", request);

    // Send request to server
    client.write(request);

    if (isTextBased) {
      // If file is text based, send it as a text string
      client.write(fileData.toString("ascii"));
    } else {
      // Otherwise send it as an Array Buffer
      client.write(fileData);
    }
    client.write("\r\n");

    // Send end of file character to server
    client.write("0; ieof\r\n\r\n");

    const onData = (data) => {
      clearTimeout(timeout);
      const body = parseIcapResponse(data);
      if (body.statusCode === 204) {
        resolve({ fileClean: true });
      } else if (body.statusCode === 200 && "X-Infection-Found" in body) {
        resolve({ fileClean: false });
      } else {
        const error = new Error(
          `RESPMOD Error: Unrecognised status code ${body.statusCode} in response`
        );
        errorLog(error.message, error);
        reject(error);
      }
      client.removeListener("data", onData);
    };

    const onError = (e) => {
      clearTimeout(timeout);
      errorLog("RESPMOD Error: ", e);
      client.removeListener("data", onData);
      reject(e);
    };

    client.on("data", onData);

    client.on("error", onError);

    const timeout = setTimeout(() => {
      client.removeListener("data", onData);
      const error = new Error("OPTIONS request timed out");
      errorLog(error.message);
      reject(error);
    }, TIMEOUT);
  });
};

const scanFile = (fileObject) => {
  return new Promise((resolve, reject) => {
    log(
      2,
      `Scanning file ${fileObject.fileName} of size ${fileObject.fileSize}`
    );
    log(1, `Connecting to server: icap://${SERVER}:${PORT}/${ENDPOINT}`);
    const client = net
      .Socket()
      .connect({ host: SERVER, port: PORT, timeout: TIMEOUT });

    client.on("connect", async () => {
      try {
        const isTextBased = textMimeTypes.some((type) =>
          fileObject.fileContentType.startsWith(type)
        );
        log(3, `File text based: ${isTextBased}`);
        await handleOptionsRequest(client);
        const result = await handleRespmodRequest(
          client,
          fileObject,
          isTextBased
        );
        log(2, `File scan result: `, JSON.stringify(result));
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        client.destroy();
      }
    });

    client.on("close", () => {
      log(1, "Connection closed");
    });

    client.on("error", (err) => {
      errorLog("Connection Error: ", err);
      client.destroy();
      reject(err);
    });
  });
};

export default scanFile;
