// ======================================================
// BaseX - COMPLETE GOOGLE DRIVE CONNECTED BACKEND
// ======================================================

const express = require("express");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


// ======================================================
// 0. ROOT ROUTES (HTML PAGES)
// ======================================================

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/auth", (req, res) => {
  res.sendFile(path.join(__dirname, "auth.html"));
});

app.get("/console", (req, res) => {
  res.sendFile(path.join(__dirname, "console.html"));
});


// ======================================================
// 1. GOOGLE OAUTH CALLBACK  (MAIN PART)
// ======================================================

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send("❌ Google did not return any code.");

  const tokenURL = "https://oauth2.googleapis.com/token";

  const bodyData = {
    code: code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code"
  };

  try {
    const response = await fetch(tokenURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData)
    });

    const tokens = await response.json();

    if (tokens.error) {
      console.log("OAuth ERROR:", tokens);
      return res.send("❌ Google OAuth Failed: " + tokens.error_description);
    }

    console.log("\n====================================");
    console.log("🎉 GOOGLE DRIVE CONNECTED SUCCESSFULLY");
    console.log("ACCESS TOKEN:", tokens.access_token);
    console.log("REFRESH TOKEN:", tokens.refresh_token);
    console.log("====================================\n");

    return res.send(`
      <h1>🎉 BaseX Connected To Google Drive!</h1>
      <p>Your BaseX backend is now linked with your 2TB Google Drive.</p>
      <p>Refresh Token saved in logs (copy it safely).</p>
    `);

  } catch (err) {
    console.error(err);
    return res.send("❌ Something went wrong in callback.");
  }
});


// ======================================================
// 2. UPLOAD FILE → GOOGLE DRIVE
// ======================================================

app.post("/upload", async (req, res) => {
  const { filename, content } = req.body;

  if (!filename || !content) {
    return res.status(400).json({ error: "Missing filename or content" });
  }

  try {
    // Step 1 — Get Access Token using Refresh Token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        grant_type: "refresh_token"
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Step 2 — Upload File
    const uploadURL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=media";

    const uploadResponse = await fetch(uploadURL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "Authorization": `Bearer ${accessToken}`
      },
      body: content
    });

    const fileMeta = await uploadResponse.json();

    // Step 3 — Move file into BaseX folder
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileMeta.id}?addParents=${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    return res.json({ 
      status: "success",
      message: "File uploaded to Google Drive!",
      fileId: fileMeta.id
    });

  } catch (err) {
    console.error(err);
    res.json({ error: "UPLOAD FAILED", details: err });
  }
});


// ======================================================
// 3. START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log("🔥 BaseX Server running on port:", PORT);
});
