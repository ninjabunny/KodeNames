import { WORD_BANK } from "./word-bank.js";

const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const DEFAULT_COUNT = 25;
const MAX_COUNT = 50;
const RULE_VERSION = "v5";
const THREAD_VERSION = "t1";

const HIDDEN_THREADS = [
	"coastal navigation",
	"mountain expedition",
	"urban transit",
	"home baking",
	"school life",
	"garden ecology",
	"theater production",
	"space exploration",
	"museum curation",
	"sports tournament",
	"winter weather",
	"summer travel",
	"construction site",
	"medical clinic",
	"music performance",
	"farm harvest",
	"camping trip",
	"airport operations",
	"ocean wildlife",
	"city architecture",
	"book publishing",
	"film production",
	"railway logistics",
	"wildlife rescue",
	"restaurant kitchen",
	"marathon training",
	"science laboratory",
	"courtroom process",
	"fire station response",
	"weather forecasting",
	"banking operations",
	"recycling center",
	"hotel management",
	"fashion design",
	"toy workshop",
	"aquarium exhibit",
	"software startup",
	"bridge engineering",
	"newspaper newsroom",
	"botanical research"
];

const STYLE_LENSES = [
	"everyday objects",
	"places and locations",
	"jobs and roles",
	"tools and equipment",
	"events and activities",
	"food and ingredients",
	"nature and weather",
	"travel and transport"
];

const NORMALIZED_WORD_BANK = Array.from(
	new Set(
		WORD_BANK
			.map((word) => String(word || "").trim().toLowerCase())
			.filter(Boolean)
	)
);

function jsonResponse(payload, status, extraHeaders) {
	return new Response(JSON.stringify(payload), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"access-control-allow-origin": "*",
			"access-control-allow-methods": "GET, OPTIONS",
			"access-control-allow-headers": "content-type",
			...extraHeaders
		}
	});
}

function sanitizeWords(input, count) {
	if (!Array.isArray(input)) {
		return null;
	}
	const seen = new Set();
	const words = [];

	for (const rawValue of input) {
		const word = String(rawValue || "").replace(/\s+/g, " ").trim();
		if (!word) {
			continue;
		}
		const lower = word.toLowerCase();
		if (seen.has(lower)) {
			continue;
		}
		seen.add(lower);
		words.push(word);
	}

	if (words.length < count) {
		return null;
	}

	return words.slice(0, count);
}

function extractWordsFromText(text, count) {
	if (!text || typeof text !== "string") {
		return null;
	}

	const trimmed = text.trim();

	try {
		const parsed = JSON.parse(trimmed);
		if (Array.isArray(parsed)) {
			return sanitizeWords(parsed, count);
		}
		if (Array.isArray(parsed.words)) {
			return sanitizeWords(parsed.words, count);
		}
	} catch (_error) {
		// Ignore and continue with line-based parsing.
	}

	const splitWords = trimmed
		.split(/\n|,/g)
		.map((line) => line.replace(/^\s*\d+[\.\)]\s*/, "").replace(/^[-*]\s*/, "").trim())
		.filter(Boolean);

	return sanitizeWords(splitWords, count);
}

function getAIOutputText(aiResult) {
	if (!aiResult || typeof aiResult !== "object") {
		return "";
	}
	if (typeof aiResult.response === "string") {
		return aiResult.response;
	}
	if (typeof aiResult.output_text === "string") {
		return aiResult.output_text;
	}
	if (Array.isArray(aiResult.output)) {
		return aiResult.output.map((item) => {
			if (typeof item === "string") {
				return item;
			}
			return item && typeof item.text === "string" ? item.text : "";
		}).join("\n");
	}
	return "";
}

function hashSeed(seedText) {
	let hash = 2166136261;
	for (let i = 0; i < seedText.length; i += 1) {
		hash ^= seedText.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

function mulberry32(seed) {
	let value = seed >>> 0;
	return function random() {
		value += 0x6D2B79F5;
		let t = value;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function buildFallbackWords(seed, count) {
	const random = mulberry32(hashSeed(seed));
	const pool = NORMALIZED_WORD_BANK.slice();
	const output = [];

	while (output.length < count && pool.length > 0) {
		const index = Math.floor(random() * pool.length);
		output.push(pool.splice(index, 1)[0]);
	}

	if (output.length < count) {
		return null;
	}
	return output;
}

function buildPrompt(seed, count, ruleVersion) {
	const random = mulberry32(hashSeed(`${THREAD_VERSION}:${seed}`));
	const primaryThread = HIDDEN_THREADS[Math.floor(random() * HIDDEN_THREADS.length)];
	let secondaryThread = HIDDEN_THREADS[Math.floor(random() * HIDDEN_THREADS.length)];
	if (secondaryThread === primaryThread) {
		secondaryThread = HIDDEN_THREADS[(HIDDEN_THREADS.indexOf(primaryThread) + 7) % HIDDEN_THREADS.length];
	}
	const styleLens = STYLE_LENSES[Math.floor(random() * STYLE_LENSES.length)];
	const unrelatedTarget = 3 + Math.floor(random() * 3); // 3-5

	return [
		"You generate words for a family-friendly social word game.",
		`Return exactly ${count} unique entries.`,
		`Primary hidden thread: ${primaryThread}`,
		`Secondary hidden thread: ${secondaryThread}`,
		`Style lens to bias wording: ${styleLens}`,
		"Rules:",
		"- Most words should be subtly related to the primary hidden thread.",
		"- At least 8 words should also fit the secondary hidden thread.",
		"- Match the style lens where possible so sets vary across seeds.",
		`- Include exactly ${unrelatedTarget} words that are intentionally less related.`,
		"- Family-friendly only.",
		"- No duplicates.",
		"- Prefer single words (short noun phrases are allowed only when needed).",
		"- Avoid generic filler words like thing, item, object, stuff.",
		"- Use broad dictionary vocabulary; do not constrain to a predefined list.",
		"- Do not include numbering, bullets, or explanations.",
		"Output format:",
		"- Return JSON only in this exact format: {\"words\":[\"word1\",\"word2\",...]}",
		`Seed key: ${seed}`,
		`Rules version: ${ruleVersion}`
	].join("\n");
}

async function callCloudflareAI(env, seed, count, ruleVersion) {
	if (!env.CF_ACCOUNT_ID || !env.CF_API_TOKEN) {
		throw new Error("Missing Cloudflare AI credentials in environment.");
	}

	const model = env.CF_AI_MODEL || DEFAULT_MODEL;
	const endpoint = `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/${model}`;
	const prompt = buildPrompt(seed, count, ruleVersion);

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"authorization": `Bearer ${env.CF_API_TOKEN}`,
			"content-type": "application/json"
		},
		body: JSON.stringify({
			prompt,
			max_tokens: 700,
			temperature: 0.9
		})
	});

	const payload = await response.json().catch(() => ({}));
	if (!response.ok || payload.success === false) {
		throw new Error(`Cloudflare AI error: status ${response.status}`);
	}

	const text = getAIOutputText(payload.result || {});
	let words = extractWordsFromText(text, count);
	if (!words) {
		throw new Error("Could not parse valid words from AI output.");
	}
	return words;
}

export default {
	async fetch(request, env) {
		if (request.method === "OPTIONS") {
			return jsonResponse({}, 204, {});
		}

		const url = new URL(request.url);
		if (url.pathname !== "/api/words") {
			return jsonResponse({ error: "Not found" }, 404, {});
		}
		if (request.method !== "GET") {
			return jsonResponse({ error: "Method not allowed" }, 405, {});
		}

		const seed = (url.searchParams.get("seed") || "").trim().toLowerCase();
		const rawCount = Number.parseInt(url.searchParams.get("count") || `${DEFAULT_COUNT}`, 10);
		const count = Number.isFinite(rawCount)
			? Math.max(1, Math.min(MAX_COUNT, rawCount))
			: DEFAULT_COUNT;

		const ruleVersion = env.WORDS_RULE_VERSION || RULE_VERSION;
		const effectiveSeed = seed || "default";
		const cacheKey = `${ruleVersion}:${effectiveSeed}:${count}`;

		if (env.WORDS_KV) {
			const cached = await env.WORDS_KV.get(cacheKey, "json");
			if (cached && Array.isArray(cached.words)) {
				const words = sanitizeWords(cached.words, count);
				if (words) {
					return jsonResponse(
						{ words, source: "cache", ruleVersion },
						200,
						{ "cache-control": "public, max-age=300" }
					);
				}
			}
		}

		try {
			const words = await callCloudflareAI(env, effectiveSeed, count, ruleVersion);
			if (env.WORDS_KV) {
				await env.WORDS_KV.put(
					cacheKey,
					JSON.stringify({ words }),
					{ expirationTtl: 60 * 60 * 24 * 30 }
				);
			}
			return jsonResponse(
				{ words, source: "ai", ruleVersion },
				200,
				{ "cache-control": "public, max-age=60" }
			);
		} catch (_error) {
			const fallbackWords = buildFallbackWords(cacheKey, count);
			if (!fallbackWords) {
				return jsonResponse({ error: "Unable to generate words." }, 500, {});
			}
			return jsonResponse(
				{ words: fallbackWords, source: "fallback", ruleVersion },
				200,
				{ "cache-control": "no-store" }
			);
		}
	}
};
