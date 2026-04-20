// ─── /api/leads — Captação + listagem de leads ──────────────────────────────
// POST /  → público, salva lead do formulário
// GET  /  → protegido (comercial|marketing), lista leads do dashboard
// PATCH /:id → protegido (comercial|marketing), atualiza estágio do lead

import { Router } from "express";
import { createSupabaseAdminClient } from "../lib/supabase";
import { DB_TABLES, TIPO_EVENTO_VALUES, LEAD_ESTAGIO_VALUES } from "../../shared/const";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

// ─── POST / — criar lead (público) ──────────────────────────────────────────
router.post("/", async (req, res) => {
  const { nome, email, telefone, tipo, mensagem } = req.body;

  if (!nome || !email || !telefone || !tipo) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  if (!TIPO_EVENTO_VALUES.includes(tipo)) {
    return res.status(400).json({ error: "Tipo de evento inválido." });
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from(DB_TABLES.LEADS).insert({
    nome,
    email,
    telefone,
    tipo_evento: tipo,
    mensagem:    mensagem ?? null,
    origem:      req.headers.referer ?? null,
    criado_em:   new Date().toISOString(),
  });

  if (error) {
    console.error("[leads] Erro Supabase:", error);
    return res.status(500).json({ error: "Erro ao salvar lead." });
  }

  return res.status(201).json({ ok: true });
});

// ─── GET / — listar leads (protegido: comercial + marketing) ─────────────────
router.get("/", requireAuth(["comercial", "marketing"]), async (req, res) => {
  const supabase = createSupabaseAdminClient();

  const tipoFilter = req.query.tipo as string | undefined;
  const estagioFilter = req.query.estagio as string | undefined;
  const dataInicio = req.query.data_inicio as string | undefined;
  const dataFim = req.query.data_fim as string | undefined;

  let query = supabase
    .from(DB_TABLES.LEADS)
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(500);

  // Filtro por tipo de evento
  if (tipoFilter && TIPO_EVENTO_VALUES.includes(tipoFilter as any)) {
    query = query.eq("tipo_evento", tipoFilter);
  }

  // Filtro por estágio
  if (estagioFilter && LEAD_ESTAGIO_VALUES.includes(estagioFilter as any)) {
    query = query.eq("estagio", estagioFilter);
  }

  // Filtro por período
  if (dataInicio) {
    query = query.gte("criado_em", new Date(dataInicio).toISOString());
  }
  if (dataFim) {
    // Add 1 day to include the entire end date
    const endDate = new Date(dataFim);
    endDate.setDate(endDate.getDate() + 1);
    query = query.lt("criado_em", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error("[leads] Erro ao listar:", error);
    return res.status(500).json({ error: "Erro ao buscar leads." });
  }

  return res.json({ leads: data ?? [] });
});

// ─── PATCH /:id — atualizar estágio do lead (protegido: comercial APENAS) ──
router.patch("/:id", requireAuth(["comercial"]), async (req, res) => {
  const { id } = req.params;
  const { estagio } = req.body;

  if (!estagio || !LEAD_ESTAGIO_VALUES.includes(estagio)) {
    return res.status(400).json({ error: "Estágio inválido." });
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from(DB_TABLES.LEADS)
    .update({ estagio })
    .eq("id", parseInt(id, 10))
    .select()
    .single();

  if (error) {
    console.error("[leads] Erro ao atualizar:", error);
    return res.status(500).json({ error: "Erro ao atualizar lead." });
  }

  if (!data) {
    return res.status(404).json({ error: "Lead não encontrado." });
  }

  return res.json(data);
});

export default router;
