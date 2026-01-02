import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { requireInternalKey } from "./middleware/auth.middleware.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import documentsRoutes from "./routes/documents.routes.js";
import customersRoutes from "./routes/customers.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key", "Authorization"]
  })
);

// Público
app.get("/api/health", (req, res) => {
  res.json({ ok: true, status: "API a funcionar" });
});

// Protegido (PowerApps/cliente interno)
app.use("/api", requireInternalKey);

app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/customers", customersRoutes);

if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Local: http://localhost:${PORT}`));
}

export default app;
