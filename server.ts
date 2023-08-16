const http = require("http");
const fs = require("fs-extra");
const { FlatfileClient } = require("@flatfile/api");
const Files = require('files.com/lib/Files').default;
// @ts-ignore
const File = require('files.com/lib/models/File').default;
require('dotenv').config();

const host = "localhost";
const port = 8080;

const api = new FlatfileClient({ token: process.env.FLATFILE_API_KEY ?? "" });

// 1 week trial, key is valid until 14 Aug
Files.setApiKey("b034df97dfbb0c0044deb244ae8288b0965b6df00b0540c8fca09c83d5dbee71");

const requestListener = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    const envId = process.env.FLATFILE_ENVIRONMENT ?? "";

    try {
      const json = JSON.parse(body);
      console.log("JSON:", json);

      if (json["action"] === "create") {
        const path = json["path"];
        // @ts-ignore
        const foundFile = await File.find(path);
        const downloadableFile = await foundFile.download();
        await downloadableFile.downloadToFile(`./${path}`);

        const reader = fs.createReadStream(`./${path}`);

        const { data: space } = await api.spaces.create({
          name: "Demo Space",
          environmentId: envId,
          autoConfigure: true,
        });

        await api.secrets.upsert({
          name: "customer_id",
          value: json["username"] ?? "unknown",
          environmentId: envId,
          spaceId: space.id,
        });

        await api.files.upload(reader, {
          spaceId: space.id,
          environmentId: envId,
          mode: "import",
        });

        reader.close();
      }
    } catch (error) {
      console.error("Error:", JSON.stringify(error, null, 2));
    }
  });

  res.setHeader("Content-Type", "application/json");
  res.writeHead(200);
  res.end(
    JSON.stringify({
      message: "got it",
    }),
  );
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
  console.log("\n");
  console.log("token:", process.env.FLATFILE_API_KEY);
  console.log("envId:", process.env.FLATFILE_ENVIRONMENT);
  console.log("\n");
});
