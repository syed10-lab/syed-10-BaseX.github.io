// ========================================================
// BaseX - FINAL GOOGLE AUTH + REFRESH TOKEN + UID SYSTEM
// ========================================================

const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 10000;


// ========================================================
// 0. PAGES
// ========================================================

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/auth", (req, res) => res.sendFile(path.join(__dirname, "auth.html")));
app.get("/console", (req, res) => res.sendFile(path.join(__dirname, "console.html")));


// ========================================================
// 1. GOOGLE CALLBACK - GENERATE REFRESH TOKEN
// ========================================================

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  const error = req.query.error;

  if (error) return res.send("❌ Google error: " + error);
  if (!code) return res.send("❌ No code returned. Try again!");

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      })
    });

    const data = await tokenRes.json();

    console.log("🔵 GOOGLE TOKEN RESPONSE:", data);

    if (!data.refresh_token) {
      return res.send(`
        ❌ STILL NO REFRESH TOKEN <br><br>
        FIX IT BY DOING THIS:<br>
        1️⃣ Open https://myaccount.google.com/permissions<br>
        2️⃣ Remove "BaseX Auth" App<br>
        3️⃣ Close browser<br>
        4️⃣ Try again using <b>prompt=consent</b><br><br>
        <small>No refresh token returned by Google.</small>
      `);
    }

    console.log("====================================");
    console.log("⭐ NEW REFRESH TOKEN:", data.refresh_token);
    console.log("====================================");

    return res.send(`
      <h1>🎉 SUCCESS! REFRESH TOKEN GENERATED</h1>
      <p>Refresh token printed in Render Logs.</p>
      <code>${data.refresh_token}</code>
    `);

  } catch (err) {
    console.error(err);
    res.send("❌ Callback failed. Check logs.");
  }
});


// ========================================================
// 2. UID GENERATOR
// ========================================================

function generateUID(projectName) {
  const prefix = projectName.substring(0, 3).toUpperCase();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${num}`;
}


// ========================================================
// 3. GET ACCESS TOKEN USING REFRESH TOKEN
// ========================================================

async function getAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token"
    })
  });

  const data = await response.json();
  return data.access_token;
}


// ========================================================
// 4. CREATE / FIND FOLDER IN GOOGLE DRIVE
// ========================================================

async function getOrCreateFolder(name, parent, token) {
  const searchURL =
    `https://www.googleapis.com/drive/v3/files?q=name='${name}' and mimeType='application/vnd.google-apps.folder'&fields=files(id)`;

  const search = await fetch(searchURL, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const found = await search.json();

  if (found.files.length > 0) return found.files[0].id;

  const create = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parent]
    })
  });

  const created = await create.json();
  return created.id;
}


// ========================================================
// 5. SIGNUP → SAVE JSON FILE IN GOOGLE DRIVE
// ========================================================

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, project } = req.body;

    if (!name || !email || !password || !project)
      return res.json({ error: "Missing fields." });

    const uid = generateUID(project);
    const createdAt = new Date().toISOString();

    const userData = { uid, name, email, password, project, createdAt };

    const token = await getAccessToken();

    const mainFolder = await getOrCreateFolder(
      "Auth",
      process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
      token
    );

    const projectFolder = await getOrCreateFolder(project, mainFolder, token);

    const upload = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=media",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      }
    );

    const fileInfo = await upload.json();

    await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileInfo.id}?addParents=${projectFolder}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({
      success: true,
      uid,
      project,
      msg: "User saved successfully!"
    });

  } catch (err) {
    console.error(err);
    res.json({ error: "Signup failed.", details: err });
  }
});


// ========================================================
// 6. START SERVER
// ========================================================

app.listen(PORT, () => {
  console.log("🔥 SERVER RUNNING ON PORT:", PORT);
});
