import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { requireInternalKey } from "./middleware/auth.middleware.js";
import customersRoutes from "./routes/customers.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import productsRoutes from "./routes/products.routes.js";
import documentsRoutes from "./routes/documents.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// público
app.get("/health", (req, res) => {
  res.json({ ok: true, status: "API a funcionar" });
});

// protegido
app.use(requireInternalKey);

app.use("/customers", customersRoutes);
app.use("/orders", ordersRoutes);
app.use("/products", productsRoutes);
app.use("/documents", documentsRoutes);

export default app;
