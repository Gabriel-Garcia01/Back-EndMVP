const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  next();
});

const frontendDistPath = path.resolve(__dirname, "frontend", "dist");
const frontendPublicPath = path.resolve(__dirname, "frontend", "public");
const hasFrontendDist = fs.existsSync(frontendDistPath);
const hasFrontendPublic = fs.existsSync(frontendPublicPath);

if (hasFrontendDist) {
  app.use(express.static(frontendDistPath));
} else if (hasFrontendPublic) {
  app.use(express.static(frontendPublicPath));
}

app.use(express.static(path.join(__dirname, "public")));

// Se houver uma pasta pública aninhada (`public/public`) (ocorre em alguns commits), servir também como fallback
const nestedPublicPath = path.join(__dirname, "public", "public");
if (fs.existsSync(nestedPublicPath)) {
  app.use(express.static(nestedPublicPath));
}

const dbPath = path.resolve(__dirname, "database.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Erro no SQLite:", err.message);
  } else {
    console.log("Banco SQLite conectado!");
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, usuario TEXT UNIQUE, senha TEXT)`,
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS parks (
          id INTEGER PRIMARY KEY,
          slug TEXT UNIQUE,
          name TEXT,
          shortName TEXT,
          description TEXT,
          infolocation TEXT,
          area_km2 REAL,
          state TEXT,
          hq TEXT,
          images TEXT,
          features TEXT
        )`,
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS trails (
          id INTEGER PRIMARY KEY,
          parkId INTEGER,
          park TEXT,
          name TEXT,
          slug TEXT UNIQUE,
          mainImage TEXT,
          images TEXT,
          difficulty TEXT,
          duration TEXT,
          description TEXT
        )`,
      );

      db.run(
        `CREATE TABLE IF NOT EXISTS waterfalls (
          id INTEGER PRIMARY KEY,
          parkId INTEGER,
          park TEXT,
          name TEXT,
          slug TEXT UNIQUE,
          mainImage TEXT,
          images TEXT,
          difficulty TEXT,
          duration TEXT,
          description TEXT
        )`,
      );

      ensureAdminUser();

      // Insere os dados padrões apenas se o banco estiver vazio.
      // NOTA: evitamos chamar `syncJsonDataToDb()` automaticamente aqui porque
      // ele faz `INSERT OR REPLACE` com os dados de `frontend/data/db.json`,
      // sobrescrevendo quaisquer mudanças feitas via painel admin.
      insertDefaultDataIfEmpty();
    });
  }
});

const allowedCategories = ["trilhas", "cachoeiras"];

const tableMap = {
  trilhas: "trails",
  cachoeiras: "waterfalls",
};

function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function normalizeText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "")
    .toLowerCase();
}

function parseJsonField(value) {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return [];
  }
}

function stringifyJsonField(value) {
  if (!value) return JSON.stringify([]);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed);
    } catch {
      return JSON.stringify(value.split(",").map((item) => item.trim()).filter(Boolean));
    }
  }
  return JSON.stringify(value);
}

const parkNameAliases = {
  montanhasdeter: "montanhasdeteresopolis",
  montanhasdetere: "montanhasdeteresopolis",
  montanhasdeteresopolis: "montanhasdeteresopolis",
  serradosorgaos: "serradosorgaos",
  trespicos: "trespicos",
  trespicos: "trespicos",
};

function getParkByNameOrSlug(parque) {
  return new Promise((resolve, reject) => {
    let normalizedInput = normalizeText(parque);
    if (parkNameAliases[normalizedInput]) {
      normalizedInput = parkNameAliases[normalizedInput];
    }

    db.all("SELECT id, name, shortName, slug FROM parks", [], (err, rows) => {
      if (err) return reject(err);
      const match = rows.find((park) => {
        const fields = [park.name, park.shortName, park.slug];
        return fields.some((field) => normalizeText(field) === normalizedInput);
      });
      resolve(match || null);
    });
  });
}

function insertDefaultDataIfEmpty() {
  if (!jsonData || !jsonData.parks) return;

  db.get("SELECT COUNT(*) as total FROM parks", (err, row) => {
    if (!err && row && row.total === 0) {
      const stmt = db.prepare(
        "INSERT OR IGNORE INTO parks (id, slug, name, shortName, description, infolocation, area_km2, state, hq, images, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      );
      jsonData.parks.forEach((park) => {
        stmt.run(
          park.id,
          park.slug,
          park.name,
          park.shortName,
          park.description,
          park.infolocation,
          park.area_km2 || null,
          park.state || null,
          stringifyJsonField(park.hq),
          stringifyJsonField(park.images),
          stringifyJsonField(park.features),
        );
      });
      stmt.finalize();
    }
  });

  db.get("SELECT COUNT(*) as total FROM trails", (err, row) => {
    if (!err && row && row.total === 0) {
      const stmt = db.prepare(
        "INSERT OR IGNORE INTO trails (id, parkId, park, name, slug, mainImage, images, difficulty, duration, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      );
      jsonData.trails.forEach((trail) => {
        stmt.run(
          trail.id,
          trail.parkId,
          trail.park,
          trail.name,
          trail.slug,
          trail.mainImage,
          stringifyJsonField(trail.images),
          trail.difficulty,
          trail.duration,
          trail.description,
        );
      });
      stmt.finalize();
    }
  });

  db.get("SELECT COUNT(*) as total FROM waterfalls", (err, row) => {
    if (!err && row && row.total === 0) {
      const stmt = db.prepare(
        "INSERT OR IGNORE INTO waterfalls (id, parkId, park, name, slug, mainImage, images, difficulty, duration, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      );
      jsonData.waterfalls.forEach((waterfall) => {
        stmt.run(
          waterfall.id,
          waterfall.parkId,
          waterfall.park,
          waterfall.name,
          waterfall.slug,
          waterfall.mainImage,
          stringifyJsonField(waterfall.images),
          waterfall.difficulty,
          waterfall.duration,
          waterfall.description,
        );
      });
      stmt.finalize();
    }
  });
}

function syncJsonDataToDb() {
  if (!jsonData || !jsonData.parks) return;

  const parkStmt = db.prepare(
    `INSERT OR REPLACE INTO parks (id, slug, name, shortName, description, infolocation, area_km2, state, hq, images, features)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  jsonData.parks.forEach((park) => {
    parkStmt.run(
      park.id,
      park.slug,
      park.name,
      park.shortName,
      park.description,
      park.infolocation,
      park.area_km2 || null,
      park.state || null,
      stringifyJsonField(park.hq),
      stringifyJsonField(park.images),
      stringifyJsonField(park.features),
    );
  });
  parkStmt.finalize();

  const trailStmt = db.prepare(
    `INSERT OR REPLACE INTO trails (id, parkId, park, name, slug, mainImage, images, difficulty, duration, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  jsonData.trails.forEach((trail) => {
    trailStmt.run(
      trail.id,
      trail.parkId,
      trail.park,
      trail.name,
      trail.slug,
      trail.mainImage,
      stringifyJsonField(trail.images),
      trail.difficulty,
      trail.duration,
      trail.description,
    );
  });
  trailStmt.finalize();

  const waterfallStmt = db.prepare(
    `INSERT OR REPLACE INTO waterfalls (id, parkId, park, name, slug, mainImage, images, difficulty, duration, description)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  jsonData.waterfalls.forEach((waterfall) => {
    waterfallStmt.run(
      waterfall.id,
      waterfall.parkId,
      waterfall.park,
      waterfall.name,
      waterfall.slug,
      waterfall.mainImage,
      stringifyJsonField(waterfall.images),
      waterfall.difficulty,
      waterfall.duration,
      waterfall.description,
    );
  });
  waterfallStmt.finalize();
}

function ensureColumnExists(table, column, definition) {
  db.all(`PRAGMA table_info(${table})`, (err, rows) => {
    if (err) {
      console.error(`Erro ao verificar colunas da tabela ${table}:`, err.message);
      return;
    }

    const columnExists = rows.some((row) => row.name === column);
    if (!columnExists) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (alterErr) => {
        if (alterErr) {
          console.error(`Erro ao adicionar coluna ${column} em ${table}:`, alterErr.message);
        } else {
          console.log(`Coluna '${column}' adicionada à tabela ${table}.`);
        }
      });
    }
  });
}

function ensureAdminUser() {
  db.get("SELECT * FROM usuarios WHERE usuario = ?", ["admin"], async (err, row) => {
    if (err) {
      console.error("Erro ao verificar usuário admin:", err.message);
      return;
    }

    if (!row) {
      try {
        const senhaTextoPuro = "admin123";
        const saltos = 10;
        const senhaCriptografada = await bcrypt.hash(senhaTextoPuro, saltos);

        db.run("INSERT INTO usuarios (usuario, senha) VALUES (?, ?)", [
          "admin",
          senhaCriptografada,
        ], (insertErr) => {
          if (insertErr) {
            console.error("Erro ao criar usuário admin:", insertErr.message);
          } else {
            console.log("Usuário admin recriado com senha padrão admin123.");
          }
        });
      } catch (hashErr) {
        console.error("Erro ao criptografar a senha do admin:", hashErr.message);
      }
    }
  });
}

// ROTA DE LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM usuarios WHERE usuario = ?";

  if (!email || !password) {
    return res.status(400).json({ error: "Email e senha são obrigatórios." });
  }

  db.get(sql, [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      const senhaCorreta = await bcrypt.compare(password, row.senha);
      if (senhaCorreta)
        return res.json({
          message: "Login autorizado com sucesso!",
          user: { id: row.id, email: row.usuario },
        });
    }

    res.status(401).json({ error: "Usuário ou senha inválidos!" });
  });
});

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      "INSERT INTO usuarios (usuario, senha) VALUES (?, ?)",
      [email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(409).json({ error: "Esse email já está cadastrado." });
          }
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: "Cadastro realizado com sucesso!",
          user: { id: this.lastID, email },
        });
      },
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Parâmetro 'email' é obrigatório." });
  }
  const sql = "SELECT id, usuario as email FROM usuarios WHERE usuario = ?";
  db.get(sql, [email], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json([]);
    res.json([row]);
  });
});

const jsonDataFile = path.resolve(__dirname, "frontend", "data", "db.json");

let jsonData = { parks: [], trails: [], waterfalls: [] };
function loadJsonData() {
  try {
    const rawJson = fs.readFileSync(jsonDataFile, "utf-8");
    jsonData = JSON.parse(rawJson);
  } catch (error) {
    console.error("Erro ao carregar dados do front-end React:", error.message);
  }
}

loadJsonData();

app.get("/api/parks", (req, res) => {
  const { slug } = req.query;
  let sql = "SELECT * FROM parks";
  const params = [];
  if (slug) {
    sql += " WHERE slug = ?";
    params.push(slug);
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const parks = rows.map((park) => ({
      ...park,
      hq: parseJsonField(park.hq),
      images: parseJsonField(park.images),
      features: parseJsonField(park.features),
    }));
    res.json(parks);
  });
});

app.get("/api/trails", (req, res) => {
  const { parkId, slug } = req.query;
  let sql = "SELECT * FROM trails";
  const params = [];
  if (parkId || slug) {
    const conditions = [];
    if (parkId) {
      conditions.push("parkId = ?");
      params.push(parkId);
    }
    if (slug) {
      conditions.push("slug = ?");
      params.push(slug);
    }
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const trails = rows.map((trail) => ({
      ...trail,
      images: parseJsonField(trail.images),
    }));
    res.json(trails);
  });
});

app.get("/api/waterfalls", (req, res) => {
  const { parkId, slug } = req.query;
  let sql = "SELECT * FROM waterfalls";
  const params = [];
  if (parkId || slug) {
    const conditions = [];
    if (parkId) {
      conditions.push("parkId = ?");
      params.push(parkId);
    }
    if (slug) {
      conditions.push("slug = ?");
      params.push(slug);
    }
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const waterfalls = rows.map((waterfall) => ({
      ...waterfall,
      images: parseJsonField(waterfall.images),
    }));
    res.json(waterfalls);
  });
});

app.get("/api/locais-divididos", (req, res) => {
  db.all(
    "SELECT id, name as nome, park as parque, difficulty as dificuldade, duration as duracao, description as descricao, mainImage as imagem, slug, parkId, images FROM trails",
    [],
    (err, trilhas) => {
      if (err) return res.status(500).json({ error: err.message });
      db.all(
        "SELECT id, name as nome, park as parque, difficulty as dificuldade, duration as duracao, description as descricao, mainImage as imagem, slug, parkId, images FROM waterfalls",
        [],
        (err, cachoeiras) => {
          if (err) return res.status(500).json({ error: err.message });
          const trilhasComParse = trilhas.map((item) => ({
            ...item,
            parque: String(item.parque || "").trim(),
            images: parseJsonField(item.images),
          }));
          const cachoeirasComParse = cachoeiras.map((item) => ({
            ...item,
            parque: String(item.parque || "").trim(),
            images: parseJsonField(item.images),
          }));
          res.json({ trilhas: trilhasComParse, cachoeiras: cachoeirasComParse });
        },
      );
    },
  );
});

app.post("/api/locais", async (req, res) => {
  const {
    nome,
    categoria,
    parque,
    slug,
    mainImage,
    images,
    dificuldade,
    duracao,
    descricao,
  } = req.body;

  if (!allowedCategories.includes(categoria)) {
    return res.status(400).json({ error: "Categoria inválida" });
  }

  try {
    const parkRow = await getParkByNameOrSlug(parque);
    if (!parkRow) {
      return res.status(400).json({ error: "Parque inválido" });
    }

    const table = tableMap[categoria];
    const trailSlug = slug?.trim() || slugify(nome);
    const imagesJson = stringifyJsonField(images);
    const parkShortName = parkRow.shortName || parkRow.name;

    const sql = `INSERT INTO ${table} (parkId, park, name, slug, mainImage, images, difficulty, duration, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(
      sql,
      [parkRow.id, parkShortName, nome, trailSlug, mainImage || null, imagesJson, dificuldade, duracao, descricao],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Sucesso", id: this.lastID, slug: trailSlug });
      },
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/locais/:categoria/:id", async (req, res) => {
  const { categoria, id } = req.params;
  const {
    nome,
    parque,
    slug,
    mainImage,
    images,
    dificuldade,
    duracao,
    descricao,
  } = req.body;

  if (!allowedCategories.includes(categoria)) {
    return res.status(400).json({ error: "Categoria inválida" });
  }

  try {
    const parkRow = await getParkByNameOrSlug(parque);
    if (!parkRow) {
      return res.status(400).json({ error: "Parque inválido" });
    }

    const table = tableMap[categoria];
    const trailSlug = slug?.trim() || slugify(nome);
    const imagesJson = stringifyJsonField(images);
    const parkShortName = parkRow.shortName || parkRow.name;

    const sql = `UPDATE ${table} SET parkId = ?, park = ?, name = ?, slug = ?, mainImage = ?, images = ?, difficulty = ?, duration = ?, description = ? WHERE id = ?`;
    db.run(
      sql,
      [parkRow.id, parkShortName, nome, trailSlug, mainImage || null, imagesJson, dificuldade, duracao, descricao, id],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0)
          return res.status(404).json({ error: "Local não encontrado" });
        res.json({ message: "Atualizado com sucesso!" });
      },
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/locais/:categoria/:id", (req, res) => {
  const { categoria, id } = req.params;

  if (!allowedCategories.includes(categoria)) {
    return res.status(400).json({ error: "Categoria inválida" });
  }

  const table = tableMap[categoria];
  const sql = `DELETE FROM ${table} WHERE id = ?`;
  db.run(sql, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0)
      return res.status(404).json({ error: "Local não encontrado" });
    res.json({ message: "Excluído com sucesso!" });
  });
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Rota de API não encontrada" });
  }

  if (hasFrontendDist) {
    return res.sendFile(path.join(frontendDistPath, "index.html"));
  }

  if (hasFrontendPublic) {
    return res.sendFile(path.join(frontendPublicPath, "index.html"));
  }

  const fallbackIndex = path.join(__dirname, "public", "index.html");
  if (fs.existsSync(fallbackIndex)) {
    return res.sendFile(fallbackIndex);
  }

  res.status(404).send("Not found");
});

const server = app.listen(PORT, () => {
  console.log(`Rodando com segurança em http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Porta ${PORT} já está em uso. Defina a variável de ambiente PORT ou finalize o processo que usa a porta.`);
    process.exit(1);
  }
  console.error('Erro no servidor:', err);
  process.exit(1);
});
