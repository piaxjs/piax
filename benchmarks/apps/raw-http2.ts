import http2, { type Http2Server, type IncomingHttpHeaders, type ServerHttp2Stream } from "node:http2";
import fs from "node:fs";
import path from "node:path";

const server: Http2Server = http2.createSecureServer({
  key: fs.readFileSync(path.resolve("key.pem")),
  cert: fs.readFileSync(path.resolve("cert.pem")),
});

server.on("stream", (stream: ServerHttp2Stream, headers: IncomingHttpHeaders) => {
  const method = headers[":method"];
  const url = headers[":path"];

  // GET /
  if (method === "GET" && url === "/") {
    stream.respond({
      ":status": 200,
      "content-type": "application/json",
    });
    stream.end('{"message":"Hello HTTP/2"}');
    return;
  }

  // GET /api/users
  if (method === "GET" && url === "/api/users") {
    stream.respond({
      ":status": 200,
      "content-type": "application/json",
    });
    stream.end('[{"id":1,"name":"John"}]');
    return;
  }

  // GET /api/users/:id
  if (method === "GET" && url?.startsWith("/api/users/")) {
    const id = url.slice("/api/users/".length);

    stream.respond({
      ":status": 200,
      "content-type": "application/json",
    });
    stream.end(JSON.stringify({ id, name: "John" }));
    return;
  }

  // POST /api/users
  if (method === "POST" && url === "/api/users") {
    let body = "";

    stream.on("data", (chunk: Buffer) => {
      body += chunk.toString("utf8");
    });

    stream.on("end", () => {
      const data = JSON.parse(body);

      stream.respond({
        ":status": 200,
        "content-type": "application/json",
      });

      stream.end(JSON.stringify({ id: 123, ...data }));
    });

    return;
  }

  // 404
  stream.respond({ ":status": 404 });
  stream.end();
});

server.listen(3000, () => {
  console.log("HTTP/2 server running on https://localhost:3000");
  process.send?.("READY");
});
