"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSScraper = exports.serialize = void 0;
const AWS = __importStar(require("aws-sdk"));
var MediaType;
(function (MediaType) {
    MediaType["SINGLE"] = "single";
    MediaType["MULTIPLE"] = "multiple";
})(MediaType || (MediaType = {}));
function serialize(i) {
    const a = {
        seasoned: {},
        unseasoned: Object.fromEntries(i.unseasoned)
    };
    [...i.seasoned.entries()].forEach(([k, v]) => {
        a.seasoned[k] = {
            type: MediaType.MULTIPLE,
            name: v.name,
            seasons: Object.fromEntries(v.seasons),
            imageUrl: v.imageUrl
        };
    });
    return a;
}
exports.serialize = serialize;
const seasoned_regex = /^([a-z0-9\-]*?)-s\d{2}e\d{2}(e[a-z0-9]*?)?\.mp4$/;
const unseasoned_regex = /^([a-z0-9\-]*)\.mp4$/;
const cover_regex = /^([a-z0-9\-]*)\.(jpe?g|png|webp|avif)$/;
const ep_regex = /s(\d{2})e(\d{2})(?:e([a-z0-9]*))?/;
function getSeasonEpisode(key) {
    const m = key.match(ep_regex);
    const se = { season: 0, episode: 0, extra: false };
    if ((m === null || m === void 0 ? void 0 : m[1]) && (m === null || m === void 0 ? void 0 : m[2])) {
        se.season = parseInt(m[1]);
        se.episode = parseInt(m[2]);
    }
    if (m === null || m === void 0 ? void 0 : m[3]) {
        se.extra = m[3] ? true : false;
        se.extraName = m[3];
    }
    return se;
}
class AWSScraper {
    constructor(config) {
        const cfg = new AWS.Config(config.auth);
        this.s3 = new AWS.S3(cfg);
        this.bucket = config.general.bucket;
        this.prefix = config.general.prefix;
        this.baseUrl = config.general.baseUrl;
    }
    getCovers() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const prefix = `${this.prefix}metadata/covers/`;
            const prefixedObjects = yield this.s3.listObjectsV2({ Bucket: this.bucket, Prefix: prefix }).promise();
            const unfilteredObjects = (_a = prefixedObjects.Contents) === null || _a === void 0 ? void 0 : _a.map(obj => { var _a; return (Object.assign(Object.assign({}, obj), { nkey: (_a = obj.Key) === null || _a === void 0 ? void 0 : _a.substr(prefix.length) })); });
            const objects = unfilteredObjects === null || unfilteredObjects === void 0 ? void 0 : unfilteredObjects.filter(obj => { var _a; return (_a = obj.nkey) === null || _a === void 0 ? void 0 : _a.match(cover_regex); });
            const map = new Map();
            objects === null || objects === void 0 ? void 0 : objects.forEach((x) => __awaiter(this, void 0, void 0, function* () {
                var _b;
                const key = (_b = x.nkey) === null || _b === void 0 ? void 0 : _b.split('.')[0];
                if (!key)
                    return;
                map.set(key, `${this.baseUrl}${prefix}${x}`);
            }));
            return map;
        });
    }
    scan() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const seasoned_map = new Map();
            const single_map = new Map();
            const prefixedObjects = yield this.s3.listObjectsV2({ Bucket: this.bucket, Prefix: this.prefix }).promise();
            const unfilteredObjects = (_b = (_a = prefixedObjects.Contents) === null || _a === void 0 ? void 0 : _a.map(object => { var _a; return (_a = object.Key) === null || _a === void 0 ? void 0 : _a.substring(this.prefix.length); })) !== null && _b !== void 0 ? _b : [];
            const objects = unfilteredObjects.filter(obj => !(obj === null || obj === void 0 ? void 0 : obj.startsWith("metadata/")));
            const seasonedVideos = objects.filter(object => seasoned_regex.test(object !== null && object !== void 0 ? object : ''));
            const coverMap = yield this.getCovers();
            seasonedVideos.forEach(key => {
                if (!key)
                    return;
                const match = key.match(seasoned_regex);
                if (!match)
                    return;
                let root = seasoned_map.get(match[1]);
                if (!root) {
                    const cover = coverMap.get(match[1]);
                    root = {
                        type: MediaType.MULTIPLE,
                        name: match[1],
                        seasons: new Map()
                    };
                    if (cover) {
                        root.imageUrl = cover;
                    }
                    seasoned_map.set(match[1], root);
                }
                //get season and episode
                const se = getSeasonEpisode(key);
                let season = root.seasons.get(se.season);
                if (!season) {
                    season = {
                        season: se.season,
                        episodes: []
                    };
                    root.seasons.set(se.season, season);
                }
                season.episodes.push(Object.assign({ key: match[1], publicUrl: this.baseUrl + this.prefix + key }, se));
            });
            objects.filter(x => (x === null || x === void 0 ? void 0 : x.endsWith('mp4')) && !seasonedVideos.includes(x)).forEach((key) => {
                const match = key === null || key === void 0 ? void 0 : key.match(unseasoned_regex);
                if (!match || !key)
                    return;
                const cover = coverMap.get(match[1]);
                const media = { name: match[1], type: MediaType.SINGLE, video: { key, publicUrl: this.baseUrl + this.prefix + key } };
                if (cover) {
                    media.imageUrl = cover;
                }
                single_map.set(match[1], media);
            });
            return {
                seasoned: seasoned_map,
                unseasoned: single_map
            };
        });
    }
}
exports.AWSScraper = AWSScraper;
