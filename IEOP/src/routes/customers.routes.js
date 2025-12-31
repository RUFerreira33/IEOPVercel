import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

/**
 * POST /customers
 * Cria cliente se não existir e devolve customerId
 */
router.post("/", async (req, res) => {
  try {
    const { nome, email, telefone, nif } = req.body;

    if (!nome || !telefone) {
      return res.status(400).json({
        ok: false,
        error: "Nome e telefone são obrigatórios."
      });
    }

    const baseUrl = process.env.VENDUS_BASE_URL?.replace(/\/+$/, "");
    const token = process.env.VENDUS_API_KEY;

    if (!baseUrl || !token) {
      return res.status(500).json({
        ok: false,
        error: "Configuração inválida do servidor."
      });
    }

    /* 1️⃣ Listar clientes */
    const listResponse = await fetch(`${baseUrl}/customers/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!listResponse.ok) {
      throw new Error("Erro ao consultar clientes no Vendus");
    }

    const listData = await listResponse.json();

    const existingCustomer = listData?.data?.find(c =>
      (telefone && c.phone === telefone) ||
      (nif && c.fiscal_id === nif)
    );

    if (existingCustomer) {
      return res.json({
        ok: true,
        customerId: existingCustomer.id,
        created: false
      });
    }

    /* 2️⃣ Criar cliente */
    const createResponse = await fetch(`${baseUrl}/customers/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: nome,
        email: email || "",
        phone: telefone,
        fiscal_id: nif && nif.length === 9 ? nif : ""
      })
    });

    if (!createResponse.ok) {
      const err = await createResponse.text();
      throw new Error(err);
    }

    const createdCustomer = await createResponse.json();

    return res.json({
      ok: true,
      customerId: createdCustomer.data.id,
      created: true
    });

  } catch (error) {
    console.error("Erro POST /customers:", error);

    res.status(500).json({
      ok: false,
      error: "Erro ao processar cliente"
    });
  }
});

/**
 * GET /customers
 * Devolve todos os clientes (uso administrativo / UiPath)
 */
router.get("/", async (req, res) => {
  try {
    const baseUrl = process.env.VENDUS_BASE_URL?.replace(/\/+$/, "");
    const token = process.env.VENDUS_API_KEY;

    if (!baseUrl || !token) {
      return res.status(500).json({
        ok: false,
        error: "Configuração inválida do servidor."
      });
    }

    const response = await fetch(`${baseUrl}/customers/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({
        ok: false,
        error: "Erro ao listar clientes no Vendus",
        details: err
      });
    }

    const data = await response.json();
    const rows = Array.isArray(data?.data) ? data.data : [];

    const customers = rows.map(c => ({
      id: c.id,
      name: c.name ?? "",
      email: c.email ?? ""
    }));

    return res.json({
      ok: true,
      customers
    });

  } catch (error) {
    console.error("Erro GET /customers:", error);
    return res.status(500).json({
      ok: false,
      error: "Erro ao listar clientes"
    });
  }
});


/**
 * GET /customers/:id
 * Devolve nome e email do cliente (para o UiPath)
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const baseUrl = process.env.VENDUS_BASE_URL?.replace(/\/+$/, "");
    const token = process.env.VENDUS_API_KEY;

    if (!baseUrl || !token) {
      return res.status(500).json({
        ok: false,
        error: "Configuração inválida do servidor."
      });
    }

    const response = await fetch(`${baseUrl}/customers/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({
        ok: false,
        error: "Erro ao obter cliente no Vendus",
        details: err
      });
    }

    const data = await response.json();
    const customer = data?.data ?? data;

    return res.json({
      ok: true,
      customer: {
        id: customer.id,
        name: customer.name ?? "",
        email: customer.email ?? ""
      }
    });

  } catch (error) {
    console.error("Erro GET /customers/:id:", error);

    res.status(500).json({
      ok: false,
      error: "Erro ao obter cliente"
    });
  }
});

export default router;
