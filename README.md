# Node.js ICAP Client

This repository contains a simple Node.js ICAP client implementation that supports OPTIONS and RESPMOD ICAP requests. It leverages Node.js's built-in `net` module to establish a TCP connection and send ICAP requests to an ICAP server. This client was designed to demonstrate antivirus file scanning capabilities and is part of a larger project available at [antivirus-scan.mohammadyusuf.co.uk](https://antivirus-scan.mohammadyusuf.co.uk).

## Features

- **OPTIONS Request**: Sends an OPTIONS request to query the capabilities of the ICAP server.
- **RESPMOD Request**: Scans a file by sending a RESPMOD request to the ICAP server.
- **Efficient File Handling**: Handles both text-based and binary files for scanning.
- **Customisable Configurations**: Reads server details and timeouts from environment variables.
- **Error Handling**: Comprehensive logging and error reporting for seamless debugging.

## How It Works

### Key Files

1. **`icapClient.js`**: Contains the main logic for creating and sending OPTIONS and RESPMOD requests to the ICAP server.
2. **`test.js`**: A simple test script to demonstrate scanning a file using the ICAP client.

### Dependencies

- `net` (built-in): Used to create a TCP client and communicate with the ICAP server.
- `dotenv`: For managing environment variables.
- `fs`: (built-in) For file handling in the test script.

### Environment Variables

The following environment variables are required to configure the ICAP client:

- `ICAP_SERVER_HOST`: Hostname or IP address of the ICAP server.
- `ICAP_SERVER_PORT`: Port number of the ICAP server.
- `ICAP_ENDPOINT`: ICAP endpoint (e.g., `avscan`).
- `ICAP_SERVER_TIMEOUT`: Optional. Timeout value for requests in milliseconds (default: 30000).

## Usage

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up the `.env` file:

   ```plaintext
   ICAP_SERVER_HOST=your-icap-server-host
   ICAP_SERVER_PORT=your-icap-server-port
   ICAP_ENDPOINT=your-icap-endpoint
   ICAP_SERVER_TIMEOUT=30000
   ```

3. Create a test file

Create a test file in the repository, and update `test.js` with the name and mime type.

3. Run the test script:

   ```bash
   npm start
   ```

## Demo

Visit the live demo of the antivirus scanning application: [antivirus-scan.mohammadyusuf.co.uk](https://antivirus-scan.mohammadyusuf.co.uk).

## Contribution

Contributions are welcome! Feel free to submit issues or pull requests to enhance the functionality of this ICAP client.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

For more details, contact me via my portfolio website: [mohammadyusuf.co.uk](https://mohammadyusuf.co.uk).
