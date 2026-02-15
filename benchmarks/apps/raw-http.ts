import http from "http";

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // Router simulation
  if (method === "GET" && url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello Raw HTTP" }));
    return;
  }

  if (method === "GET" && url === "/api/users") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify([{ id: 1, name: "John" }]));
    return;
  }

  if (method === "GET" && url?.startsWith("/api/users/")) {
    const id = url.split("/")[3];
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ id, name: "John" }));
    return;
  }

  if (method === "POST" && url === "/api/users") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const data = JSON.parse(body);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ id: 123, ...data }));
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(3000, () => {
  console.log("Raw HTTP server running on http://localhost:3000");
  process.send?.("READY");
});
