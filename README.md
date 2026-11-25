# Node.js examples

This workspace is a small collection of standalone Node.js examples, not one
combined web application. The main data-backed example is the REST API in
`dotenv\`; it stores user records in a JSON file rather than using a database
server.

## Application structure

```text
node_project\
|-- Homepage.js          # Basic HTTP server (/, /about)
|-- server.js            # TCP server used with client.js
|-- client.js            # TCP client
|-- math.js              # Empty placeholder
|-- package.json         # Root package metadata; no run scripts or dependencies
|-- dotenv\
    |-- app.js           # REST API and JSON-file persistence
    |-- data.json        # User records (file-based "database")
    |-- package.json     # API start script and dotenv dependency
```

## Architecture and request flow

```text
API client (browser, curl, or PowerShell)
        |
        | HTTP: GET/POST/PUT/DELETE /users
        v
dotenv\app.js (Node.js HTTP server, default port 3454)
        |
        | validate request / select route
        v
read or update dotenv\data.json
        |
        | JSON response and status code
        v
API client
```

`GET /users` reads and returns the users array. `POST /users` validates a
name, assigns the next ID, and adds a user. `PUT /users/:id` updates a name,
and `DELETE /users/:id` removes a user. Writes replace the JSON file with the
updated contents.

## Technologies

- Node.js and JavaScript ES modules (`"type": "module"`)
- Node built-in `http` module for the REST API and basic web server
- Node built-in `fs/promises` for reading and writing the JSON data file
- Node built-in `net` module for the TCP server/client example
- `dotenv` package in `dotenv\` to optionally load configuration from a `.env`
  file

The API does not use a SQL or NoSQL database service, ORM, or database
connection. `dotenv\data.json` is its persistent storage. It is suitable for
learning and local demonstrations, but does not provide database transactions
or safe concurrent writes.

## Run the REST API

Prerequisites: install Node.js (which includes npm).

1. Open PowerShell in the project folder:

   ```powershell
   cd C:\Users\user\Desktop\node_project\dotenv
   ```

2. Install this subproject's dependencies (first run or after dependency
   changes):

   ```powershell
   npm install
   ```

3. Start the API:

   ```powershell
   npm start
   ```

   It listens at `http://localhost:3454` by default. Keep this terminal open.
   To use another port, set `PORT` before starting, for example:

   ```powershell
   $env:PORT = "4000"
   npm start
   ```

4. In a second PowerShell terminal, call the API:

   ```powershell
   Invoke-RestMethod -Method Get -Uri http://localhost:3454/users
   Invoke-RestMethod -Method Post -Uri http://localhost:3454/users `
     -ContentType "application/json" -Body '{"name":"Ada"}'
   Invoke-RestMethod -Method Put -Uri http://localhost:3454/users/1 `
     -ContentType "application/json" -Body '{"name":"Ada Lovelace"}'
   Invoke-RestMethod -Method Delete -Uri http://localhost:3454/users/1
   ```

   Use the ID returned by `POST` (or listed by `GET`) for the update/delete
   examples. The initial records are in `data.json`; API changes are written
   back to that file.

5. Stop the server with `Ctrl+C`.

The API's `.env` file is optional. If present in the `dotenv\` working
directory, it can contain a port such as `PORT=4000`.

## Run the other examples

Run these commands from the project root; each starts a separate process:

- Basic HTTP server:

  ```powershell
  node .\Homepage.js
  ```

  Visit `http://localhost:3000/` or `http://localhost:3000/about`. Stop with
  `Ctrl+C`.

- TCP server/client: in one terminal start `node .\server.js`; in a second
  terminal run `node .\client.js`. The server listens on port `50042`, and the
  client connects to that port.

The root `package.json` has no start script. Use the commands above rather
than `npm start` from the root directory.
