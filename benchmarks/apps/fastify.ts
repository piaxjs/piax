import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";

const fastify = Fastify({
  logger: false,
  disableRequestLogging: true,
});

// Routes
fastify.get("/", async (req, reply: FastifyReply) => {
  reply.send({ message: "Hello Fastify" });
});

fastify.get("/api/users", async (req, reply: FastifyReply) => {
  reply.send({ id: 1, name: "John" });
});

fastify.get("/api/users/:id", async (req: FastifyRequest<{ Params: { id: any } }>, reply: FastifyReply) => {
  reply.send({ id: req.params?.id, name: "John" });
});

fastify.post("/api/users", async (req: FastifyRequest<{ Body: { id: any } }>, reply: FastifyReply) => {
  const id = req.body;
  reply.send({ id });
});

// Start server
fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Fastify server running on http://localhost:3000");
  process.send?.("READY");
});
