import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import dotenv from "dotenv";

const envConfig = dotenv.config();
if (envConfig.error && envConfig.error.code !== "ENOENT") {
    throw envConfig.error;
}

const fileUrl = new URL("./data.json", import.meta.url);

// Helper: Read and parse DB
async function readDB() {
    const rawData = await readFile(fileUrl, "utf8");
    return JSON.parse(rawData);
}

// Helper: Write DB
async function writeDB(data) {
    await writeFile(fileUrl, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

// Helper: Parse incoming JSON body
async function parseBody(req) {
    let body = "";
    for await (const chunk of req) {
        body += chunk;
    }
    return JSON.parse(body);
}

// Helper: Send JSON response
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
    const method = req.method;
    const path = new URL(req.url, "http://localhost").pathname;

    try {
        // GET /users
        if (method === "GET" && path === "/users") {
            const data = await readDB();
            return sendJSON(res, 200, data.users);
        }

        // POST /users
        if (method === "POST" && path === "/users") {
            let userData;
            try {
                userData = await parseBody(req);
            } catch {
                return sendJSON(res, 400, { message: "Invalid JSON data" });
            }

            if (!userData?.name || typeof userData.name !== "string" || !userData.name.trim()) {
                return sendJSON(res, 400, { message: "Valid name is required" });
            }

            const data = await readDB();
            if (!Array.isArray(data.users)) throw new Error("Users collection must be an array");

            const highestId = data.users.reduce((max, u) => (Number.isSafeInteger(u.id) && u.id > max ? u.id : max), 0);
            const newUser = { id: highestId + 1, name: userData.name.trim() };

            data.users.push(newUser);
            await writeDB(data);

            return sendJSON(res, 201, { message: "User created successfully", user: newUser });
        }

        // Match routes like /users/:id (PUT or DELETE)
        const match = path.match(/^\/users\/(\d+)$/);
        if (match) {
            const id = Number(match[1]);

            // PUT /users/:id
            if (method === "PUT") {
                let userData;
                try {
                    userData = await parseBody(req);
                } catch {
                    return sendJSON(res, 400, { message: "Invalid JSON data" });
                }

                if (!userData?.name || typeof userData.name !== "string" || !userData.name.trim()) {
                    return sendJSON(res, 400, { message: "Valid name is required" });
                }

                const data = await readDB();
                const user = data.users.find((u) => u.id === id);
                if (!user) return sendJSON(res, 404, { message: "User not found" });

                user.name = userData.name.trim();
                await writeDB(data);

                return sendJSON(res, 200, { message: "User updated successfully", user });
            }

            // DELETE /users/:id
            if (method === "DELETE") {
                const data = await readDB();
                const userIndex = data.users.findIndex((u) => u.id === id);
                if (userIndex === -1) return sendJSON(res, 404, { message: "User not found" });

                data.users.splice(userIndex, 1);
                await writeDB(data);

                return sendJSON(res, 200, { message: "User deleted successfully" });
            }
        }

        // 404 Fallback
        return sendJSON(res, 404, { message: "Not Found" });

    } catch (error) {
        console.error("Server error:", error);
        if (!res.headersSent) {
            sendJSON(res, 500, { message: "Internal Server Error" });
        }
    }
});

const port = Number(process.env.PORT || 3454);
server.listen(port, () => {
    console.log(`REST API is running on http://localhost:${port}`);
});