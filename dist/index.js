"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const s3_scraper_1 = require("./s3-scraper");
const promises_1 = require("fs/promises");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const connect_history_api_fallback_1 = __importDefault(require("connect-history-api-fallback"));
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)());
let allMedia;
app.get('/media', (req, res) => {
    res.send(allMedia);
});
app.use((0, connect_history_api_fallback_1.default)());
app.use('/', express_1.default.static('./frontend/dist'));
function main() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const config = JSON.parse(yield (0, promises_1.readFile)((_a = process.env.CONF) !== null && _a !== void 0 ? _a : './conf.json', 'utf8'));
        const s = new s3_scraper_1.AWSScraper(config.s3);
        1;
        allMedia = (0, s3_scraper_1.serialize)(yield s.scan());
        setInterval(() => __awaiter(this, void 0, void 0, function* () {
            allMedia = (0, s3_scraper_1.serialize)(yield s.scan());
        }), 60 * 1000);
        app.listen(8080, () => {
            console.log('Server online');
        });
    });
}
main();
