const { google } = require("googleapis");
const fs = require("fs");

// Service Account JSON file
const KEYFILE_PATH = "credentials.json";

// Scope for Google Drive
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILE_PATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: "v3", auth });


// Create folder if not exists
async function getOrCreateFolder(name, parent = null) {
    const query = `'${parent || "root"}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const res = await drive.files.list({ q: query });
    if (res.data.files.length > 0) return res.data.files[0].id;

    const folder = await drive.files.create({
        resource: {
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: parent ? [parent] : [],
        },
    });

    return folder.data.id;
}


// Upload user JSON file
async function uploadUserFile(project, uid, data) {
    const baseX = await getOrCreateFolder("BaseX");
    const auth = await getOrCreateFolder("Auth", baseX);
    const projectFolder = await getOrCreateFolder(project, auth);

    const fileName = `${uid}.json`;

    const fileMetadata = {
        name: fileName,
        parents: [projectFolder]
    };

    const media = {
        mimeType: "application/json",
        body: JSON.stringify(data, null, 2)
    };

    await drive.files.create({
        resource: fileMetadata,
        media: media
    });

    return true;
}

module.exports = { uploadUserFile };
