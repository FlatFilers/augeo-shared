const http = require("http");
const fs = require("fs-extra");
const api = require("@flatfile/api").default;
const Files = require('files.com/lib/Files').default;
const File = require('files.com/lib/models/File').default;

const host = "localhost";
const port = 8080;

// 1 week trial, key is valid until 14 Aug
Files.setApiKey("4296161e98b428fb0c16f6ba765bcf6053cce979bc5588bb489afac7f8ad68d3");

const requestListener = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    const envId = process.env.FF_ENV_ID ?? "DEFAULT_ENV_ID";

    try {
      const json = JSON.parse(body);

      if (json["action"] === "create") {
        const path = json["path"];
        const foundFile = await File.find(path);
        const downloadableFile = await foundFile.download();
        await downloadableFile.downloadToFile(`./${path}`);

        const reader = fs.createReadStream(`./${path}`);

        const { data: space } = await api.spaces.create({
          name: "Some Space",
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
      console.error(JSON.stringify(error, null, 2));
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
});
