import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { games, siteMeta, categories, evidenceMeta } from "../catalog-data.mjs";

const execFileAsync = promisify(execFile);
const outputPath = fileURLToPath(new URL("../catalog-generated.json", import.meta.url));
const imageDir = fileURLToPath(new URL("../images/games/", import.meta.url));

const USER_AGENT =
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchText(url) {
    const response = await fetch(url, {
        headers: {
            "user-agent": USER_AGENT,
            "accept-language": "en-US,en;q=0.9"
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return response.text();
}

async function fetchTextLoose(url) {
    const response = await fetch(url, {
        headers: {
            "user-agent": USER_AGENT,
            "accept-language": "en-US,en;q=0.9"
        }
    });

    return {
        ok: response.ok,
        status: response.status,
        text: await response.text()
    };
}

async function fetchBuffer(url) {
    const response = await fetch(url, {
        headers: {
            "user-agent": USER_AGENT,
            "accept-language": "en-US,en;q=0.9"
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch image ${url}: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    const buffer = Buffer.from(await response.arrayBuffer());
    return { buffer, contentType };
}

function slugify(value) {
    return value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/&/g, " and ")
        .replace(/['’]/g, "")
        .replace(/\+/g, " plus ")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");
}

async function resolveProductUrl(game) {
    if (game.productUrl) {
        return game.productUrl;
    }

    const cleaned = slugify(game.searchTitle);
    const withoutNintendoSwitch = cleaned.replace(/-nintendo-switch$/, "");
    const withoutSwitch = cleaned.replace(/-switch$/, "");
    const candidateSlugs = [
        game.productSlug,
        cleaned,
        withoutNintendoSwitch,
        withoutSwitch,
        `${cleaned}-switch`,
        `${withoutNintendoSwitch}-switch`,
        `${withoutSwitch}-switch`,
        `${cleaned}-for-nintendo-switch`,
        `${withoutSwitch}-for-nintendo-switch`
    ].filter(Boolean);

    const uniqueSlugs = [...new Set(candidateSlugs)];
    const baseUrls = [
        "https://www.nintendo.com/us/store/products/",
        "https://www.nintendo.com/store/products/"
    ];

    for (const baseUrl of baseUrls) {
        for (const slug of uniqueSlugs) {
            const url = `${baseUrl}${slug}/`;
            const response = await fetchTextLoose(url);

            if (!response.ok) {
                continue;
            }

            const html = response.text;

            if (!/<link rel="canonical" href="https:\/\/www\.nintendo\.com\/(?:us\/)?store\/products\//i.test(html)) {
                continue;
            }

            if (/<title>Whoops!/i.test(html)) {
                continue;
            }

            return extractCanonical(html) || url;
        }
    }

    throw new Error(`Could not resolve Nintendo product URL for "${game.title}"`);
}

function pickVideoGameJsonLd(html) {
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];

    for (const match of scripts) {
        try {
            const parsed = JSON.parse(match[1]);
            const graph = Array.isArray(parsed?.["@graph"]) ? parsed["@graph"] : [parsed];
            const node = graph.find((entry) => {
                const types = Array.isArray(entry?.["@type"]) ? entry["@type"] : [entry?.["@type"]];
                return types.includes("VideoGame") || types.includes("Product");
            });

            if (node) {
                return node;
            }
        } catch {
            // Ignore malformed blobs and keep searching.
        }
    }

    return null;
}

function extractReleaseDate(html, jsonLd) {
    if (typeof jsonLd?.releaseDate === "string") {
        return jsonLd.releaseDate;
    }

    const match = html.match(/Release date<\/h3><div[^>]*><p[^>]*>([^<]+)<\/p>/i);
    return match?.[1]?.trim() ?? "";
}

function extractReleaseYear(releaseDate) {
    const yearMatch = releaseDate.match(/\b(20\d{2})\b/);
    return yearMatch ? Number(yearMatch[1]) : null;
}

function extractCanonical(html) {
    return html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1] ?? "";
}

function extractOgImage(html) {
    return html.match(/<meta property="og:image"[^>]*content="([^"]+)"/i)?.[1] ?? "";
}

function extractMetaDescription(html, jsonLd) {
    if (typeof jsonLd?.description === "string" && jsonLd.description.trim()) {
        return jsonLd.description.trim();
    }

    return html.match(/<meta name="description" content="([^"]+)"/i)?.[1]?.trim() ?? "";
}

function attributionLabelFor(url) {
    if (url.includes("nintendo.com")) {
        return "Nintendo product page";
    }

    return "Official site";
}

async function writeNormalizedImage(game, imageUrl) {
    const { buffer, contentType } = await fetchBuffer(imageUrl);
    const tempExt =
        contentType.includes("png") ? ".png" : contentType.includes("webp") ? ".webp" : contentType.includes("avif") ? ".avif" : ".jpg";
    const tempInput = join(tmpdir(), `${game.id}${tempExt}`);
    const output = join(imageDir, `${game.id}.webp`);

    await writeFile(tempInput, buffer);
    await execFileAsync("magick", [
        tempInput,
        "-auto-orient",
        "-resize",
        "960x540^",
        "-gravity",
        "center",
        "-extent",
        "960x540",
        "-strip",
        "-quality",
        "84",
        output
    ]);

    return {
        path: `./images/games/${basename(output)}`,
        contentType
    };
}

async function main() {
    await mkdir(imageDir, { recursive: true });

    const generatedGames = [];

    for (const game of games) {
        process.stdout.write(`Resolving ${game.title}...\n`);
        const resolvedUrl = await resolveProductUrl(game);
        const html = await fetchText(resolvedUrl);
        const jsonLd = pickVideoGameJsonLd(html);
        const canonicalUrl = extractCanonical(html) || resolvedUrl;
        const imageUrl = game.imageUrl || extractOgImage(html);

        if (!imageUrl) {
            throw new Error(`No og:image found for "${game.title}"`);
        }

        const releaseDate = extractReleaseDate(html, jsonLd);
        const releaseYear = extractReleaseYear(releaseDate);
        const description = extractMetaDescription(html, jsonLd);
        const localImage = await writeNormalizedImage(game, imageUrl);

        generatedGames.push({
            ...game,
            productUrl: canonicalUrl,
            resolvedDescription: description,
            releaseDate,
            releaseYear: releaseYear ?? game.releaseYear ?? null,
            imageUrl,
            imagePath: localImage.path,
            imageAttributionLabel: attributionLabelFor(canonicalUrl),
            imageAttributionUrl: canonicalUrl
        });
    }

    const payload = {
        generatedAt: new Date().toISOString(),
        siteMeta,
        categories,
        evidenceMeta,
        games: generatedGames
    };

    await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
    process.stdout.write(`Wrote ${outputPath}\n`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
