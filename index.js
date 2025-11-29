// ========================================================
// BaseX - FULL GOOGLE AUTH + REFRESH TOKEN + UID SYSTEM
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
// 0. BASIC ROUTES
// ========================================================

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/auth", (req, res) => res.sendFile(path.join(__dirname, "auth.html")));
app.get("/console", (req, res) => res.sendFile(path.join(__dirname, "console.html")));


// ========================================================
// 1. GOOGLE CALLBACK - GET REFRESH TOKEN
// ========================================================

app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) return res.send("❌ No code received from Google.");

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

    if (!data.refresh_token) {
      return res.send("❌ NO REFRESH TOKEN. Go to Google → Remove App → Try again.");
    }

    console.log("====================================");
    console.log("REFRESH TOKEN GENERATED:");
    console.log(data.refresh_token);
    console.log("====================================");

    return res.send(`
      <h1>🎉 GOOGLE DRIVE CONNECTED SUCCESSFULLY</h1>
      <p>Refresh Token has been printed inside Render Logs.</p>
      <p>Copy it & paste into GOOGLE_REFRESH_TOKEN env variable.</p>
      <br>
      <code>${data.refresh_token}</code>
    `);

  } catch (err) {
    console.error(err);
    res.send("❌ Callback failed.");
  }
});


// ========================================================
// 2. UID GENERATOR
// ========================================================

function generateUID(projectName) {
  const prefix = projectName.substring(0, 3).toUpperCase();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${random}`;
}


// ========================================================
// 3. GET ACCESS TOKEN FROM REFRESH TOKEN
// ========================================================

async function getAccessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token"
    })
  });

  const data = await res.json();
  return data.access_token;
}


// ========================================================
// 4. CREATE OR CHECK FOLDER IN DRIVE
// ========================================================

async function getOrCreateFolder(name, parent, token) {
  const findURL =
    `https://www.googleapis.com/drive/v3/files?q=name='${name}' and mimeType='application/vnd.google-apps.folder'&fields=files(id)`;

  const search = await fetch(findURL, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const found = await search.json();

  if (found.files.length > 0) {
    return found.files[0].id;
  }

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
// 5. USER SIGNUP → SAVE JSON IN GOOGLE DRIVE
// ========================================================

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, project } = req.body;

    if (!name || !email || !password || !project) {
      return res.json({ error: "Missing fields." });
    }

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

    // Upload JSON
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

    // Move file into project folder
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
      msg: "User saved in Google Drive!"
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
  console.log("🔥 SERVER RUNNING on PORT:", PORT);
});
