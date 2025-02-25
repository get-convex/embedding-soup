import { v } from "convex/values";
import {
  action,
  mutation,
  query,
  internalQuery,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";
import { Id } from "./_generated/dataModel";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const add = mutation({
  args: { text: v.string() },
  returns: v.null(),
  handler: async (ctx, { text }) => {
    // First store the phrase without embedding
    const phraseId = await ctx.db.insert("phrases", {
      text,
      embedding: [], // Empty array as placeholder
    });

    await ctx.scheduler.runAfter(0, internal.phrases.updateEmbedding, {
      phraseId,
      text,
    });

    return null;
  },
});

export const updateEmbedding = internalAction({
  args: {
    phraseId: v.id("phrases"),
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { phraseId, text }) => {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    await ctx.runMutation(internal.phrases.saveEmbedding, {
      phraseId,
      embedding: response.data[0].embedding,
    });
    return null;
  },
});

export const saveEmbedding = internalMutation({
  args: {
    phraseId: v.id("phrases"),
    embedding: v.array(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, { phraseId, embedding }) => {
    await ctx.db.patch(phraseId, { embedding });
    return null;
  },
});

export const store = mutation({
  args: {
    text: v.string(),
    embedding: v.array(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, { text, embedding }) => {
    await ctx.db.insert("phrases", {
      text,
      embedding,
    });
    return null;
  },
});

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("phrases"),
      text: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const phrases = await ctx.db.query("phrases").collect();
    return phrases.map((doc) => ({
      _id: doc._id,
      text: doc.text,
    }));
  },
});

export const remove = mutation({
  args: { id: v.id("phrases") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return null;
  },
});

type PhraseResult = {
  _id: Id<"phrases">;
  text: string;
  score: number;
};

export const search = action({
  args: { text: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("phrases"),
      text: v.string(),
      score: v.number(),
    }),
  ),
  handler: async (ctx, { text }): Promise<PhraseResult[]> => {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    const embedding = response.data[0].embedding;

    const results = await ctx.vectorSearch("phrases", "by_embedding", {
      vector: embedding,
      limit: 5,
    });

    // Get phrases with scores in a single query
    return await ctx.runQuery(
      internal.phrases.getPhrasesFromVectorSearchResults,
      { results },
    );
  },
});

export const getPhrasesFromVectorSearchResults = internalQuery({
  args: {
    results: v.array(
      v.object({
        _id: v.id("phrases"),
        _score: v.number(),
      }),
    ),
  },
  handler: async (ctx, { results }) => {
    const docs = await Promise.all(
      results.map(async ({ _id, _score }) => {
        const doc = await ctx.db.get(_id);
        if (!doc) return null;
        return {
          _id,
          score: _score,
          text: doc.text,
        };
      }),
    );
    return docs.filter((b) => b != null);
  },
});
