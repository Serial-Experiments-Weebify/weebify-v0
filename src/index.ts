import { AllMedia, AWSScraper, serialize, SerializedMedia } from "./s3-scraper"
import { readFile, readdir } from "fs/promises"
import * as AWS from "aws-sdk"
import express from "express";
import cors from "cors"
import morgan from "morgan"
import history from 'connect-history-api-fallback';


const app = express();
app.use(morgan("dev"))
app.use(cors())

let allMedia: SerializedMedia;

app.get('/media', (req, res) => {
    res.send(allMedia);
})
app.use(history());
app.use('/', express.static('./frontend/dist'));

async function main() {
    const config = JSON.parse(await readFile(process.env.CONF ?? './conf.json', 'utf8'))
    const s = new AWSScraper(config.s3);
1
    allMedia = serialize(await s.scan());

    setInterval(async () => {
        allMedia = serialize(await s.scan());
    }, 60 * 1000)

    app.listen(8080, () => {
        console.log('Server online')
    });
}

main();