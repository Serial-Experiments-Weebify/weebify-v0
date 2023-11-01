import { AllMedia, AWSScraper, serialize, SerializedMedia } from "./s3-scraper";
import { readFile, readdir } from "fs/promises";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import history from "connect-history-api-fallback";

const app = express();
app.use(morgan("dev"));
app.use(cors());

let allMedia: SerializedMedia;

app.get("/media", (req, res) => {
    res.send(allMedia);
});
app.use(history());
app.use("/", express.static("./frontend/dist"));

app.listen(8080);

async function main() {
    const config = JSON.parse(
        await readFile(process.env.CONF ?? "./conf.json", "utf8")
    );

    const s = new AWSScraper(config.s3);

    const update = async () => {
        const start = Date.now();
        allMedia = serialize(await s.scan());
        console.log(`Scanned in ${Date.now() - start}ms`);
    };

    await update();
    setInterval(update, 60_000);
}

main();
