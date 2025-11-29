// ========================================================
// BaseX FULL AUTH + UID GENERATION + GOOGLE DRIVE SAVE
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
// 0. HTML ROUTES
// ========================================================

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/auth", (req, res) => res.sendFile(path.join(__dirname, "auth.html")));
app.get("/console", (req, res) => res.sendFile(path.join(__dirname, "console.html")));


// ========================================================
// 1. UID GENERATOR
// ========================================================

function generateUID(projectName) {
  const prefix = projectName.substring(0, 3).toUpperCase();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${random}`;
}


// ========================================================
// 2. GET ACCESS TOKEN from Google using refresh token
// ========================================================

async function getAccessToken() {
  const tokenURL = "https://oauth2.googleapis.com/token";

  const response = await fetch(tokenURL, {
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
// 3. CHECK OR CREATE FOLDER IN DRIVE
// ========================================================

async function getOrCreateFolder(name, parent, token) {
  // Search folder
  const searchURL =
    `https://www.googleapis.com/drive/v3/files?q=name='${name}' and mimeType='application/vnd.google-apps.folder'&fields=files(id)`;

  const searchRes = await fetch(searchURL, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const searchData = await searchRes.json();

  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder
  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parent]
    })
  });

  const createData = await createRes.json();
  return createData.id;
}


// ========================================================
// 4. SIGNUP ROUTE
// ========================================================

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, project } = req.body;

    if (!name || !email || !password || !project) {
      return res.json({ error: "Missing fields" });
    }

    const uid = generateUID(project);
    const createdAt = new Date().toISOString();

    const userData = {
      uid,
      name,
      email,
      password,
      project,
      createdAt
    };

    const accessToken = await getAccessToken();

    // MAIN BaseX/Auth folder
    const mainAuthFolder = await getOrCreateFolder("Auth", process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID, accessToken);

    // Project specific folder
    const projectFolder = await getOrCreateFolder(project, mainAuthFolder, accessToken);

    // User file upload
    const uploadURL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=media";

    const uploadRes = await fetch(uploadURL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const fileMeta = await uploadRes.json();

    // Move file inside project folder
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileMeta.id}?addParents=${projectFolder}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    return res.json({
      status: "success",
      msg: "User created",
      uid,
      project,
      fileId: fileMeta.id
    });

  } catch (err) {
    console.error(err);
    res.json({ error: "Signup failed", details: err });
  }
});


// ========================================================
// 5. START SERVER
// ========================================================

app.listen(PORT, () => {
  console.log("🔥 BaseX Server running on port:", PORT);
});
