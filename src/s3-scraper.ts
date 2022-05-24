import * as AWS from "aws-sdk"

interface Video {
    key: string;
    publicUrl: string;
}

enum MediaType {
    SINGLE = 'single',
    MULTIPLE = 'multiple'
}

interface MediaRoot {
    name: string;
    imageUrl?: string;
    type: MediaType;
}

interface Episode extends Video {
    season: number;
    episode: number;
    extra: boolean;
    extraName?: string;
}

interface Season {
    season: number;
    episodes: Episode[];
}

interface SeasonedMediaRoot extends MediaRoot {
    type: MediaType.MULTIPLE;
    seasons: Map<number, Season>;
}

interface SingleMedia extends MediaRoot {
    type: MediaType.SINGLE;
    video: Video;
}


export interface AllMedia {
    seasoned: Map<string, SeasonedMediaRoot>,
    unseasoned: Map<string, SingleMedia>;
}

export interface SerializedMedia {
    seasoned: {
        [index: string]: {
            type: MediaType.MULTIPLE;
            name: string,
            imageUrl?: string,
            seasons: {
                [index: number]: Season
            }
        }
    }
    unseasoned: {
        [index: string]: SingleMedia
    }
}

export function serialize(i: AllMedia): SerializedMedia {
    const a: SerializedMedia = {
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
    })

    return a
}


const seasoned_regex = /^([a-z0-9\-]*?)-s\d{2}e\d{2}(e[a-z0-9]*?)?\.mp4$/;
const unseasoned_regex = /^([a-z0-9\-]*)\.mp4$/;
const cover_regex = /^([a-z0-9\-]*)\.(jpe?g|png|webp|avif)$/;
const ep_regex = /s(\d{2})e(\d{2})(?:e([a-z0-9]*))?/;

function getSeasonEpisode(key: string): { season: number, episode: number, extra: boolean, extraName?: string } {
    const m = key.match(ep_regex);
    const se: any = { season: 0, episode: 0, extra: false };

    if (m?.[1] && m?.[2]) {
        se.season = parseInt(m[1]);
        se.episode = parseInt(m[2]);
    }

    if (m?.[3]) {
        se.extra = m[3] ? true : false;
        se.extraName = m[3];
    }

    return se;
}


export class AWSScraper {
    private s3: AWS.S3;
    private bucket: string;
    private prefix: string;
    private baseUrl: string;

    public constructor(config: { auth: any, general: { bucket: string, prefix: string, baseUrl: string } }) {

        const cfg = new AWS.Config(config.auth)

        this.s3 = new AWS.S3(cfg);
        this.bucket = config.general.bucket;
        this.prefix = config.general.prefix;
        this.baseUrl = config.general.baseUrl;
    }


    private async getCovers() {
        const prefix = `${this.prefix}metadata/covers/`;
        const prefixedObjects = await this.s3.listObjectsV2({ Bucket: this.bucket, Prefix: prefix }).promise();

        const unfilteredObjects = prefixedObjects.Contents?.map(obj => ({...obj,nkey:obj.Key?.substr(prefix.length)}))

        const objects = unfilteredObjects?.filter(obj => obj.nkey?.match(cover_regex));
        const map = new Map<string, string>();

        objects?.forEach(async x => {
            const key = x.nkey?.split('.')[0];
            if (!key) return;
            map.set(key, `${this.baseUrl}${prefix}${x}`);
        })

        return map;
    }

    public async scan(): Promise<AllMedia> {
        const seasoned_map = new Map<string, SeasonedMediaRoot>();
        const single_map = new Map<string, SingleMedia>();

        const prefixedObjects = await this.s3.listObjectsV2({ Bucket: this.bucket, Prefix: this.prefix }).promise();

        const unfilteredObjects = prefixedObjects.Contents?.map(object => object.Key?.substring(this.prefix.length)) ?? [];

        const objects = unfilteredObjects.filter(obj => !obj?.startsWith("metadata/"));

        const seasonedVideos = objects.filter(object => seasoned_regex.test(object ?? ''));

        const coverMap = await this.getCovers();

        seasonedVideos.forEach(key => {
            if (!key) return;
            const match = key.match(seasoned_regex);

            if (!match) return;

            let root = seasoned_map.get(match[1]);
            if (!root) {
                const cover = coverMap.get(match[1]);
                root = {
                    type: MediaType.MULTIPLE,
                    name: match[1],
                    seasons: new Map<number, Season>()
                }
                if (cover) {
                    root.imageUrl = cover
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
                }
                root.seasons.set(se.season, season);
            }
            season.episodes.push({ key: match[1], publicUrl: this.baseUrl + this.prefix + key, ...se });

        })

        objects.filter(x => x?.endsWith('mp4') && !seasonedVideos.includes(x)).forEach((key) => {
            const match = key?.match(unseasoned_regex);
            if (!match || !key) return;

            const cover = coverMap.get(match[1]);
            const media: SingleMedia = { name: match[1], type: MediaType.SINGLE, video: { key, publicUrl: this.baseUrl + this.prefix + key } };
            if (cover) {
                media.imageUrl = cover;
            }
            single_map.set(match[1], media);
        })

        return {
            seasoned: seasoned_map,
            unseasoned: single_map
        }
    }
}