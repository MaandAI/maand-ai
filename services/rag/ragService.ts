/**
 * RAG Service — Retrieval-Augmented Generation for Maand AI Therapy
 *
 * Provides embedding-based retrieval from a local knowledge base.
 * Uses HuggingFace sentence-transformers/all-MiniLM-L6-v2 for embeddings.
 * Caches document embeddings to disk to avoid recomputing on every request.
 */

import { HfInference } from "@huggingface/inference";
import * as fs from "fs";
import * as path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KnowledgeChunk {
  id: string;
  category: string;
  title: string;
  content: string;
}

export interface KnowledgeBase {
  version: string;
  description: string;
  documents: KnowledgeChunk[];
}

export interface RetrievedChunk extends KnowledgeChunk {
  similarity: number;
}

export interface RAGResult {
  chunks: RetrievedChunk[];
  totalDocsSearched: number;
  queryEmbeddingMs: number;
}

// ─── Paths ────────────────────────────────────────────────────────────────────

const RAG_DIR = path.join(process.cwd(), "services", "rag");
const KB_PATH = path.join(RAG_DIR, "knowledge-base.json");
const CACHE_PATH = path.join(RAG_DIR, "embeddings-cache.json");

// ─── In-memory singletons (survive across requests in the same process) ───────

let knowledgeBaseCache: KnowledgeChunk[] | null = null;
let embeddingsCacheMap: Record<string, number[]> = {};
let embeddingsCacheLoaded = false;

// ─── HuggingFace Client ───────────────────────────────────────────────────────

function getHfClient(): HfInference {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("[RAG] HUGGINGFACE_API_KEY is not set in environment");
  }
  return new HfInference(apiKey);
}

// ─── Knowledge Base Loader ────────────────────────────────────────────────────

function loadKnowledgeBase(): KnowledgeChunk[] {
  if (knowledgeBaseCache) return knowledgeBaseCache;

  if (!fs.existsSync(KB_PATH)) {
    throw new Error(`[RAG] Knowledge base not found at: ${KB_PATH}`);
  }

  const raw = fs.readFileSync(KB_PATH, "utf-8");
  const parsed: KnowledgeBase = JSON.parse(raw);
  knowledgeBaseCache = parsed.documents;
  console.log(
    `[RAG] Knowledge base loaded: ${knowledgeBaseCache.length} documents`
  );
  return knowledgeBaseCache;
}

// ─── Embedding Cache (disk-backed) ───────────────────────────────────────────

function loadEmbeddingsCache(): Record<string, number[]> {
  if (embeddingsCacheLoaded) return embeddingsCacheMap;

  if (fs.existsSync(CACHE_PATH)) {
    try {
      const raw = fs.readFileSync(CACHE_PATH, "utf-8");
      embeddingsCacheMap = JSON.parse(raw);
      console.log(
        `[RAG] Embeddings cache loaded: ${Object.keys(embeddingsCacheMap).length} entries`
      );
    } catch (e) {
      console.warn("[RAG] Failed to parse embeddings cache, starting fresh:", e);
      embeddingsCacheMap = {};
    }
  }

  embeddingsCacheLoaded = true;
  return embeddingsCacheMap;
}

function saveEmbeddingsCache(cacheMap: Record<string, number[]>): void {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cacheMap, null, 2), "utf-8");
  } catch (e) {
    console.warn("[RAG] Failed to persist embeddings cache:", e);
  }
}

// ─── Embedding Generation ─────────────────────────────────────────────────────

/**
 * Generate a single embedding vector for a text string using
 * sentence-transformers/all-MiniLM-L6-v2 via HuggingFace Inference API.
 * Returns a flat number[] (384-dim for MiniLM-L6-v2).
 */
async function getEmbedding(text: string): Promise<number[]> {
  const hf = getHfClient();

  const response = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });

  // The API may return a nested array (batch) or flat array (single input).
  // For a single string input, it typically returns number[][] with one row.
  if (Array.isArray(response)) {
    const first = (response as any)[0];
    if (typeof first === "number") {
      // Already a flat number[]
      return response as number[];
    } else if (Array.isArray(first) && typeof first[0] === "number") {
      // Nested: [[...values...]]
      return first as number[];
    }
  }

  throw new Error("[RAG] Unexpected embedding response format from HuggingFace");
}

// ─── Cosine Similarity ────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `[RAG] Vector dimension mismatch: ${a.length} vs ${b.length}`
    );
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}

// ─── Pre-warm Document Embeddings ────────────────────────────────────────────

/**
 * Ensures all knowledge base documents have embeddings computed and cached.
 * Newly discovered documents are embedded and the cache is updated on disk.
 */
async function ensureDocumentEmbeddings(
  docs: KnowledgeChunk[],
  cacheMap: Record<string, number[]>
): Promise<Record<string, number[]>> {
  const missing = docs.filter((doc) => !cacheMap[doc.id]);

  if (missing.length === 0) {
    return cacheMap;
  }

  console.log(
    `[RAG] Computing embeddings for ${missing.length} new document(s)...`
  );

  for (const doc of missing) {
    try {
      // Combine title and content for a richer embedding
      const textToEmbed = `${doc.title}. ${doc.content}`;
      cacheMap[doc.id] = await getEmbedding(textToEmbed);
    } catch (e) {
      console.warn(`[RAG] Failed to embed document "${doc.id}":`, e);
    }
  }

  saveEmbeddingsCache(cacheMap);
  console.log(
    `[RAG] Embeddings cache updated. Total entries: ${Object.keys(cacheMap).length}`
  );
  return cacheMap;
}

// ─── Main Export: getRelevantContext ─────────────────────────────────────────

/**
 * Retrieves the most relevant knowledge base chunks for a given query.
 *
 * @param query     - The user's message / question
 * @param topK      - Maximum number of chunks to return (default: 3)
 * @param threshold - Minimum cosine similarity score to include a chunk (default: 0.3)
 * @returns RAGResult containing matched chunks with similarity scores
 */
export async function getRelevantContext(
  query: string,
  topK = 3,
  threshold = 0.3
): Promise<RAGResult> {
  const embeddingStart = Date.now();

  // 1. Load knowledge base docs
  const docs = loadKnowledgeBase();

  // 2. Load / prime the embedding cache
  const cacheMap = loadEmbeddingsCache();

  // 3. Ensure all docs are embedded (uses cache if already computed)
  const updatedCache = await ensureDocumentEmbeddings(docs, cacheMap);

  // 4. Embed the user query
  const queryEmbedding = await getEmbedding(query);
  const queryEmbeddingMs = Date.now() - embeddingStart;

  // 5. Score each document against the query
  const scored: RetrievedChunk[] = [];

  for (const doc of docs) {
    const docEmbedding = updatedCache[doc.id];
    if (!docEmbedding) continue; // skip if embedding failed

    const similarity = cosineSimilarity(queryEmbedding, docEmbedding);

    if (similarity >= threshold) {
      scored.push({ ...doc, similarity });
    }
  }

  // 6. Sort by similarity descending and take top-K
  scored.sort((a, b) => b.similarity - a.similarity);
  const topChunks = scored.slice(0, topK);

  return {
    chunks: topChunks,
    totalDocsSearched: docs.length,
    queryEmbeddingMs,
  };
}
