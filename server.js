import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { APP_VERSION } from "./src/server/config.js";
import { handleAction, tickRoom } from "./src/server/actions.js";
import { makeRoom, joinExistingRoom, publicRoom } from "./src/server/state.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");
const PORT = process.env.PORT || 3001;

const rooms = new Map();

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    Connection: "close",
  });
  res.end(body);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function broadcast(room) {
  const payload = `data: ${JSON.stringify(publicRoom(room))}\n\n`;
  for (const [clientId, res] of room.clients.entries()) {
    try {
      res.write(payload);
    } catch {
      room.clients.delete(clientId);
    }
  }
}

function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".bin": "application/octet-stream",
    ".hdr": "application/octet-stream",
    ".fbx": "application/octet-stream",
  }[ext] || "application/octet-stream";

  if (req.method === "HEAD") {
    fs.stat(filePath, (error, stat) => {
      if (error || !stat.isFile()) {
        res.writeHead(404, { "Cache-Control": "no-store" });
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": type, "Content-Length": stat.size, "Cache-Control": "no-store" });
      res.end();
    });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/health") {
      if (req.method === "HEAD") {
        const payload = JSON.stringify({ ok: true, version: APP_VERSION });
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(payload),
          "Cache-Control": "no-store",
        });
        res.end();
        return;
      }
      return sendJson(res, 200, { ok: true, version: APP_VERSION });
    }

    if (req.method === "POST" && url.pathname === "/api/create") {
      const body = await readJson(req);
      const { room, playerId } = makeRoom(rooms, body.name);
      broadcast(room);
      return sendJson(res, 200, { ok: true, code: room.code, playerId, room: publicRoom(room) });
    }

    if (req.method === "POST" && url.pathname === "/api/join") {
      const body = await readJson(req);
      const result = joinExistingRoom(rooms, body.code, body.name);
      if (!result) return sendJson(res, 404, { ok: false, error: "Room not found. Check the code or create a new room." });
      broadcast(result.room);
      return sendJson(res, 200, { ok: true, code: result.room.code, playerId: result.playerId, room: publicRoom(result.room) });
    }

    if (req.method === "POST" && url.pathname === "/api/action") {
      const body = await readJson(req);
      const room = rooms.get(String(body.code || "").trim().toUpperCase());
      if (!room) return sendJson(res, 404, { ok: false, error: "Room not found." });
      const result = handleAction(room, body.playerId, body.type, body.payload);
      broadcast(room);
      return sendJson(res, result.ok ? 200 : 400, { ...result, room: publicRoom(room) });
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/events/")) {
      const code = url.pathname.split("/").pop()?.toUpperCase();
      const room = rooms.get(code);
      if (!room) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Room not found");
        return;
      }
      const clientId = crypto.randomUUID();
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      res.write(`data: ${JSON.stringify(publicRoom(room))}\n\n`);
      room.clients.set(clientId, res);
      req.on("close", () => room.clients.delete(clientId));
      return;
    }

    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { ok: false, error: "Server error." });
  }
});

setInterval(() => {
  for (const room of rooms.values()) {
    tickRoom(room);
    broadcast(room);
  }
}, 9000);

server.listen(PORT, () => {
  console.log(`Treasure Crew v${APP_VERSION} running at http://localhost:${PORT}`);
});
