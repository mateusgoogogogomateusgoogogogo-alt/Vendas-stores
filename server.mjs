// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "mtgx-session";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Admin key required";
var NOT_ADMIN_ERR_MSG = "Admin key invalid";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(z.object({ timestamp: z.number().min(0) })).query(() => ({ ok: true, service: "mtgx-api" }))
});

// server/db.ts
import { createHash, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
var dataDir = path.resolve(process.cwd(), "data");
var dataFile = path.join(dataDir, "store.json");
var queue = Promise.resolve();
function hashAdminKey(key) {
  return createHash("sha256").update(key.trim()).digest("hex");
}
var now = () => (/* @__PURE__ */ new Date()).toISOString();
var defaultSettings = {
  id: 1,
  storeName: "MTGX Stores",
  tagline: "Experi\xEAncias digitais em outro n\xEDvel.",
  announcement: "NOVIDADES EXCLUSIVAS DISPON\xCDVEIS AGORA",
  logoUrl: "",
  backgroundUrl: "/hero-background.jpg",
  heroSlides: JSON.stringify(["/hero-background.jpg", "/1001254920.jpg"]),
  adminAvatarUrl: "/admin-profile.jpg",
  telegramUrl: "https://t.me/",
  whatsappUrl: "https://wa.me/558296084798",
  instagramUrl: "https://instagram.com/",
  supportMessage: "Ol\xE1! Se voc\xEA tem interesse em algum dos meus produtos da loja MTGX Stores, aguarde at\xE9 eu ficar online para conversarmos melhor. Assim consigo confirmar disponibilidade, quantidade e os pr\xF3ximos passos com voc\xEA.",
  purchaseMessage: "Ol\xE1! Me interessei pelo produto {product_name} da MTGX Stores. Gostaria de saber mais detalhes, disponibilidade, quantidade e como posso prosseguir pelo WhatsApp. Quantidade desejada: {quantity}.",
  musicUrl: "",
  bioLinks: "[]",
  portfolioIntro: "Projetos, refer\xEAncias e resultados reunidos em um s\xF3 lugar.",
  verifiedName: "Mtgz",
  verifiedBadge: true,
  adminKeyHash: hashAdminKey("MTGX-ADMIN-2026"),
  blurAmount: 7,
  glowEnabled: true,
  carouselSeconds: 10,
  supportMode: "both",
  updatedAt: now()
};
var seedState = () => ({ settings: { ...defaultSettings }, products: [{ id: 1, name: "Venda Inteligente com IA", category: "Ebooks", description: "Comece do zero e transforme conhecimento em vendas.", oldPrice: "R$ 29,90", price: "R$ 19,90", badge: "33% OFF", imageUrl: "/hero-background.jpg", detailImageUrl: "/hero-background.jpg", stock: 8, isFeatured: true, active: true, createdAt: now() }, { id: 2, name: "Manual de Tr\xE1fego Pago", category: "M\xE9todos", description: "Leve sua empresa ao pr\xF3ximo n\xEDvel com an\xFAncios.", oldPrice: "R$ 35,90", price: "R$ 19,90", badge: "44% OFF", imageUrl: "/1001254920.jpg", detailImageUrl: "/1001254920.jpg", stock: 3, isFeatured: true, active: true, createdAt: now() }], tickets: [], suggestions: [], announcements: [], stockRequests: [], leads: [], portfolio: [], users: [] });
async function ensureData() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, JSON.stringify(seedState(), null, 2));
  }
}
async function readState() {
  await ensureData();
  const parsed = JSON.parse(await readFile(dataFile, "utf8"));
  return { ...seedState(), ...parsed, settings: { ...defaultSettings, ...parsed.settings ?? {} } };
}
async function writeState(mutator) {
  let result;
  queue = queue.then(async () => {
    const state = await readState();
    const next = mutator(state) || state;
    await writeFile(`${dataFile}.tmp`, JSON.stringify(next, null, 2));
    await rename(`${dataFile}.tmp`, dataFile);
    result = next;
  });
  await queue;
  return result;
}
function latest(items) {
  return [...items].sort((a, b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
}
function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}
async function getStoreSettings() {
  return (await readState()).settings;
}
async function updateStoreSettings(values) {
  const { adminKey, ...rest } = values;
  const state = await writeState((current) => {
    current.settings = { ...current.settings, ...rest, ...adminKey ? { adminKeyHash: hashAdminKey(adminKey) } : {}, updatedAt: now() };
  });
  return state.settings;
}
async function verifyAdminKey(key) {
  const settings = await getStoreSettings();
  const expected = String(settings.adminKeyHash ?? "");
  const received = hashAdminKey(key);
  if (!/^[a-f0-9]{64}$/i.test(expected)) return false;
  return timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(expected, "hex"));
}
async function listProducts() {
  return (await readState()).products.filter((item) => item.active !== false).sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
}
async function listAllProducts() {
  return latest((await readState()).products);
}
async function createProduct(values) {
  const state = await writeState((current) => {
    current.products.push({ ...values, id: nextId(current.products), active: values.active !== false, createdAt: now() });
  });
  return state.products.at(-1);
}
async function updateProduct(id, values) {
  const state = await writeState((current) => {
    const item = current.products.find((product) => product.id === id);
    if (item) Object.assign(item, values, { updatedAt: now() });
  });
  return state.products.find((item) => item.id === id) ?? null;
}
async function deleteProduct(id) {
  await updateProduct(id, { active: false });
  return true;
}
async function createTicket(values) {
  const state = await writeState((current) => {
    current.tickets.push({ ...values, id: nextId(current.tickets), status: "open", createdAt: now(), updatedAt: now() });
  });
  return state.tickets.at(-1);
}
async function listTickets() {
  return latest((await readState()).tickets);
}
async function updateTicketStatus(id, status) {
  await updateCollection("tickets", id, { status, updatedAt: now() });
  return true;
}
async function createSuggestion(values) {
  const state = await writeState((current) => {
    current.suggestions.push({ ...values, id: nextId(current.suggestions), status: "new", createdAt: now() });
  });
  return state.suggestions.at(-1);
}
async function listSuggestions() {
  return latest((await readState()).suggestions);
}
async function updateSuggestionStatus(id, status) {
  await updateCollection("suggestions", id, { status });
  return true;
}
async function listAnnouncements(activeOnly = false) {
  const items = latest((await readState()).announcements);
  return activeOnly ? items.filter((item) => item.active !== false) : items;
}
async function createAnnouncement(values) {
  const state = await writeState((current) => {
    current.announcements.push({ ...values, id: nextId(current.announcements), createdAt: now() });
  });
  return state.announcements.at(-1);
}
async function deleteAnnouncement(id) {
  await deleteCollection("announcements", id);
  return true;
}
async function createStockRequest(values) {
  const state = await writeState((current) => {
    current.stockRequests.push({ ...values, id: nextId(current.stockRequests), status: "waiting", createdAt: now() });
  });
  return state.stockRequests.at(-1);
}
async function listStockRequests() {
  return latest((await readState()).stockRequests);
}
async function updateStockRequestStatus(id, status) {
  await updateCollection("stockRequests", id, { status });
  return true;
}
async function createPurchaseLead(values) {
  const state = await writeState((current) => {
    current.leads.push({ ...values, id: nextId(current.leads), status: "new", createdAt: now() });
  });
  return state.leads.at(-1);
}
async function listPurchaseLeads() {
  return latest((await readState()).leads);
}
async function updatePurchaseLeadStatus(id, status) {
  await updateCollection("leads", id, { status });
  return true;
}
async function listPortfolio(activeOnly = true) {
  const items = (await readState()).portfolio.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return activeOnly ? items.filter((item) => item.active !== false) : items;
}
async function createPortfolio(values) {
  const state = await writeState((current) => {
    current.portfolio.push({ ...values, id: nextId(current.portfolio), active: values.active !== false, createdAt: now() });
  });
  return state.portfolio.at(-1);
}
async function updatePortfolio(id, values) {
  await updateCollection("portfolio", id, values);
  return true;
}
async function deletePortfolio(id) {
  await updateCollection("portfolio", id, { active: false });
  return true;
}
async function updateCollection(collection, id, values) {
  return writeState((state) => {
    const item = state[collection].find((entry) => entry.id === id);
    if (item) Object.assign(item, values);
  });
}
async function deleteCollection(collection, id) {
  return writeState((state) => {
    state[collection] = state[collection].filter((item) => item.id !== id);
  });
}
function priceToNumber(price) {
  const normalized = String(price ?? "").replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
}
async function getDashboardStats() {
  const state = await readState();
  const today = /* @__PURE__ */ new Date();
  const series = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setHours(0, 0, 0, 0);
    day.setDate(today.getDate() - (6 - index));
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const items = state.leads.filter((lead) => new Date(lead.createdAt) >= day && new Date(lead.createdAt) < next);
    return { label: day.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), revenue: items.reduce((sum, lead) => sum + priceToNumber(state.products.find((product) => product.id === lead.productId)?.price) * Number(lead.quantity ?? 1), 0), orders: items.length };
  });
  return { products: state.products.filter((item) => item.active !== false).length, tickets: state.tickets.filter((item) => item.status !== "resolved").length, suggestions: state.suggestions.filter((item) => item.status === "new").length, leads: state.leads.filter((item) => item.status === "new").length, requests: state.stockRequests.filter((item) => item.status === "waiting").length, lowStock: state.products.filter((item) => item.active !== false && Number(item.stock) <= 2).length, series };
}
async function listAdmins() {
  return (await readState()).users.filter((user) => user.role === "admin");
}
async function addAdmin(openId) {
  return writeState((state) => {
    const existing = state.users.find((user) => user.openId === openId);
    if (existing) existing.role = "admin";
    else state.users.push({ id: nextId(state.users), openId, name: "Administrador", role: "admin", createdAt: now(), updatedAt: now(), lastSignedIn: now() });
  });
}

// server/routers.ts
import { z as z2 } from "zod";
var productInput = z2.object({ name: z2.string().min(2), category: z2.string().min(1), description: z2.string().optional(), imageUrl: z2.string().optional(), detailImageUrl: z2.string().optional(), oldPrice: z2.string().optional(), price: z2.string().min(1), badge: z2.string().optional(), stock: z2.number().int().min(0).default(0), isFeatured: z2.boolean().default(false), active: z2.boolean().default(true) });
var settingsInput = z2.object({ storeName: z2.string().min(2), tagline: z2.string().min(2), announcement: z2.string().min(2), logoUrl: z2.string().optional(), backgroundUrl: z2.string().optional(), heroSlides: z2.string().optional(), adminAvatarUrl: z2.string().optional(), telegramUrl: z2.string().optional(), whatsappUrl: z2.string().optional(), instagramUrl: z2.string().optional(), supportMessage: z2.string().min(2), purchaseMessage: z2.string().min(2), musicUrl: z2.string().optional(), bioLinks: z2.string().optional(), portfolioIntro: z2.string().optional(), verifiedName: z2.string().min(2), verifiedBadge: z2.boolean(), adminKey: z2.string().min(8).optional(), blurAmount: z2.number().min(0).max(16), glowEnabled: z2.boolean(), carouselSeconds: z2.number().int().min(5).max(60), supportMode: z2.enum(["whatsapp", "ticket", "both"]) });
var idStatus = (statuses) => z2.object({ id: z2.number(), status: z2.enum(statuses) });
var adminAttempts = /* @__PURE__ */ new Map();
function allowAdminAttempt(ip) {
  const now2 = Date.now();
  const current = adminAttempts.get(ip);
  if (!current || current.resetAt <= now2) {
    adminAttempts.set(ip, { count: 1, resetAt: now2 + 10 * 60 * 1e3 });
    return true;
  }
  if (current.count >= 8) return false;
  current.count += 1;
  return true;
}
var appRouter = router({
  system: systemRouter,
  auth: router({ me: publicProcedure.query((opts) => opts.ctx.user), logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }) }),
  store: router({ settings: publicProcedure.query(() => getStoreSettings()), products: publicProcedure.query(() => listProducts()), announcements: publicProcedure.query(() => listAnnouncements(true)), portfolio: publicProcedure.query(() => listPortfolio(true)) }),
  adminAccess: router({ verifyKey: publicProcedure.input(z2.object({ key: z2.string().min(1) })).mutation(async ({ input, ctx }) => {
    const ip = ctx.req.ip || ctx.req.socket?.remoteAddress || "unknown";
    if (!allowAdminAttempt(ip)) return false;
    return verifyAdminKey(input.key);
  }) }),
  tickets: router({ create: publicProcedure.input(z2.object({ name: z2.string().min(2), contact: z2.string().optional(), subject: z2.string().min(3), message: z2.string().min(8), channel: z2.enum(["ticket", "whatsapp"]).default("ticket"), priority: z2.enum(["normal", "high"]).default("normal") })).mutation(({ input, ctx }) => createTicket({ ...input, userId: ctx.user?.id })) }),
  suggestions: router({ create: publicProcedure.input(z2.object({ name: z2.string().min(2), contact: z2.string().optional(), title: z2.string().min(3), message: z2.string().min(8) })).mutation(({ input, ctx }) => createSuggestion({ ...input, userId: ctx.user?.id })) }),
  stock: router({ request: publicProcedure.input(z2.object({ productId: z2.number().optional(), productName: z2.string().min(2), name: z2.string().min(2), contact: z2.string().min(3), quantity: z2.number().int().min(1).max(999).default(1) })).mutation(({ input }) => createStockRequest(input)) }),
  leads: router({ create: publicProcedure.input(z2.object({ productId: z2.number().optional(), productName: z2.string().min(2), name: z2.string().optional(), contact: z2.string().optional(), quantity: z2.number().int().min(1).max(999).default(1), channel: z2.enum(["whatsapp", "ticket"]).default("whatsapp"), message: z2.string().min(4) })).mutation(({ input }) => createPurchaseLead(input)) }),
  admin: router({
    settings: adminProcedure.query(() => getStoreSettings()),
    saveSettings: adminProcedure.input(settingsInput).mutation(({ input }) => updateStoreSettings(input)),
    products: adminProcedure.query(() => listAllProducts()),
    createProduct: adminProcedure.input(productInput).mutation(({ input }) => createProduct(input)),
    updateProduct: adminProcedure.input(productInput.extend({ id: z2.number() })).mutation(({ input }) => {
      const { id, ...values } = input;
      return updateProduct(id, values);
    }),
    deleteProduct: adminProcedure.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteProduct(input.id)),
    adjustStock: adminProcedure.input(z2.object({ id: z2.number(), amount: z2.number().int() })).mutation(({ input }) => updateProduct(input.id, { stock: input.amount })),
    stats: adminProcedure.query(() => getDashboardStats()),
    tickets: adminProcedure.query(() => listTickets()),
    updateTicket: adminProcedure.input(idStatus(["open", "in_progress", "resolved"])).mutation(({ input }) => updateTicketStatus(input.id, input.status)),
    suggestions: adminProcedure.query(() => listSuggestions()),
    updateSuggestion: adminProcedure.input(idStatus(["new", "reviewing", "implemented", "archived"])).mutation(({ input }) => updateSuggestionStatus(input.id, input.status)),
    announcements: adminProcedure.query(() => listAnnouncements(false)),
    createAnnouncement: adminProcedure.input(z2.object({ title: z2.string().min(2), body: z2.string().min(4), kind: z2.enum(["info", "restock", "launch"]).default("info"), active: z2.boolean().default(true) })).mutation(({ input }) => createAnnouncement(input)),
    deleteAnnouncement: adminProcedure.input(z2.object({ id: z2.number() })).mutation(({ input }) => deleteAnnouncement(input.id)),
    stockRequests: adminProcedure.query(() => listStockRequests()),
    updateStockRequest: adminProcedure.input(idStatus(["waiting", "notified", "closed"])).mutation(({ input }) => updateStockRequestStatus(input.id, input.status)),
    leads: adminProcedure.query(() => listPurchaseLeads()),
    updateLead: adminProcedure.input(idStatus(["new", "contacted", "converted", "closed"])).mutation(({ input }) => updatePurchaseLeadStatus(input.id, input.status)),
    portfolio: adminProcedure.query(() => listPortfolio(false)),
    createPortfolio: adminProcedure.input(z2.object({ title: z2.string().min(2), description: z2.string().optional(), mediaUrl: z2.string().optional(), mediaType: z2.enum(["image", "video", "link"]).default("image"), href: z2.string().optional(), sortOrder: z2.number().int().default(0), active: z2.boolean().default(true) })).mutation(({ input }) => createPortfolio(input)),
    updatePortfolio: adminProcedure.input(z2.object({ id: z2.number(), title: z2.string().optional(), description: z2.string().optional(), mediaUrl: z2.string().optional(), mediaType: z2.enum(["image", "video", "link"]).optional(), href: z2.string().optional(), sortOrder: z2.number().int().optional(), active: z2.boolean().optional() })).mutation(({ input }) => {
      const { id, ...values } = input;
      return updatePortfolio(id, values);
    }),
    deletePortfolio: adminProcedure.input(z2.object({ id: z2.number() })).mutation(({ input }) => deletePortfolio(input.id)),
    admins: adminProcedure.query(() => listAdmins()),
    addAdmin: adminProcedure.input(z2.object({ openId: z2.string().min(3) })).mutation(({ input }) => addAdmin(input.openId))
  })
});

// server/_core/context.ts
async function createContext(opts) {
  const header = opts.req.headers["x-admin-key"];
  const key = Array.isArray(header) ? header[0] : header;
  const authenticated = typeof key === "string" && await verifyAdminKey(key);
  return {
    req: opts.req,
    res: opts.res,
    user: authenticated ? { id: 1, openId: "admin", name: "Administrador", email: null, loginMethod: "admin-key", role: "admin", createdAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date(), lastSignedIn: /* @__PURE__ */ new Date() } : null
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path3 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path2 from "node:path";
import { defineConfig } from "vite";
var vite_config_default = defineConfig({
  plugins: [react(), tailwindcss()],
  root: path2.resolve(import.meta.dirname, "client"),
  resolve: { alias: { "@": path2.resolve(import.meta.dirname, "client", "src"), "@shared": path2.resolve(import.meta.dirname, "shared") } },
  build: { outDir: path2.resolve(import.meta.dirname, "dist/public"), emptyOutDir: true },
  server: { host: "0.0.0.0", port: 3e3 }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path3.resolve(import.meta.dirname, "../..", "dist", "public") : path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.listen(port, () => probe.close(() => resolve(true)));
    probe.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) if (await isPortAvailable(port)) return port;
  throw new Error("No available port found");
}
function body(req) {
  return req.body ?? {};
}
async function adminOnly(req, res, next) {
  const key = req.header("x-admin-key");
  if (!key || !await verifyAdminKey(key)) return res.status(403).json({ error: "Admin key inv\xE1lida" });
  next();
}
var verifyAttempts = /* @__PURE__ */ new Map();
function canTryVerification(ip) {
  const current = verifyAttempts.get(ip);
  const now2 = Date.now();
  if (!current || current.resetAt <= now2) {
    verifyAttempts.set(ip, { count: 1, resetAt: now2 + 10 * 60 * 1e3 });
    return true;
  }
  if (current.count >= 8) return false;
  current.count += 1;
  return true;
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "20mb" }));
  app.use(express2.urlencoded({ limit: "20mb", extended: true }));
  app.use((req, res, next) => {
    const allowedOrigin = process.env.CORS_ORIGIN?.trim();
    if (allowedOrigin && req.headers.origin === allowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-key");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.get("/api/health", (_req, res) => res.json({ ok: true, service: "mtgx-api", database: "json" }));
  app.get("/api/store", async (_req, res) => res.json({ settings: await getStoreSettings(), products: await listProducts(), announcements: await listAnnouncements(true), portfolio: await listPortfolio(true) }));
  app.get("/api/products", async (_req, res) => res.json(await listProducts()));
  app.get("/api/announcements", async (_req, res) => res.json(await listAnnouncements(true)));
  app.get("/api/portfolio", async (_req, res) => res.json(await listPortfolio(true)));
  app.post("/api/admin/key/verify", async (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    if (!canTryVerification(ip)) return res.status(429).json({ valid: false, error: "Muitas tentativas. Aguarde alguns minutos." });
    const valid = await verifyAdminKey(String(body(req).key ?? ""));
    return res.json({ valid });
  });
  app.get("/api/admin/stats", adminOnly, async (_req, res) => res.json(await getDashboardStats()));
  app.get("/api/admin/inbox", adminOnly, async (_req, res) => res.json({ tickets: await listTickets(), leads: await listPurchaseLeads(), suggestions: await listSuggestions(), stockRequests: await listStockRequests() }));
  app.post("/api/tickets", async (req, res) => res.status(201).json(await createTicket(body(req))));
  app.post("/api/leads", async (req, res) => res.status(201).json(await createPurchaseLead(body(req))));
  app.post("/api/suggestions", async (req, res) => res.status(201).json(await createSuggestion(body(req))));
  app.post("/api/stock-requests", async (req, res) => res.status(201).json(await createStockRequest(body(req))));
  app.post("/api/admin/products", adminOnly, async (req, res) => res.status(201).json(await createProduct(body(req))));
  app.patch("/api/admin/products/:id", adminOnly, async (req, res) => res.json(await updateProduct(Number(req.params.id), body(req))));
  app.delete("/api/admin/products/:id", adminOnly, async (req, res) => res.json(await deleteProduct(Number(req.params.id))));
  app.post("/api/admin/announcements", adminOnly, async (req, res) => res.status(201).json(await createAnnouncement(body(req))));
  app.delete("/api/admin/announcements/:id", adminOnly, async (req, res) => res.json(await deleteAnnouncement(Number(req.params.id))));
  app.post("/api/admin/portfolio", adminOnly, async (req, res) => res.status(201).json(await createPortfolio(body(req))));
  app.delete("/api/admin/portfolio/:id", adminOnly, async (req, res) => res.json(await deletePortfolio(Number(req.params.id))));
  app.patch("/api/admin/tickets/:id", adminOnly, async (req, res) => res.json(await updateTicketStatus(Number(req.params.id), String(body(req).status))));
  app.patch("/api/admin/suggestions/:id", adminOnly, async (req, res) => res.json(await updateSuggestionStatus(Number(req.params.id), String(body(req).status))));
  app.patch("/api/admin/stock-requests/:id", adminOnly, async (req, res) => res.json(await updateStockRequestStatus(Number(req.params.id), String(body(req).status))));
  app.patch("/api/admin/leads/:id", adminOnly, async (req, res) => res.json(await updatePurchaseLeadStatus(Number(req.params.id), String(body(req).status))));
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  if (process.env.NODE_ENV === "development") await setupVite(app, server);
  else serveStatic(app);
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  server.listen(port, () => console.log(`MTGX API listening on port ${port}`));
}
startServer().catch(console.error);
