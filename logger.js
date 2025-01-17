import process from "process";

export const log = (logLevel = 1, message, params) => {
  const debugLevel = process.env.DEBUG_LEVEL || 1;
  const date = new Date().toUTCString();
  if (logLevel <= debugLevel) {
    if (params) {
      console.log(`${date} ${process.pid} ${message}`, params);
    } else {
      console.log(`${date} ${process.pid} ${message}`);
    }
  }
};

export const errorLog = (message, params) => {
  const date = new Date().toUTCString();
  if (params) {
    console.error(`${date} ${process.pid} ${message}`, params);
  } else {
    console.error(`${date} ${process.pid} ${message}`);
  }
};
