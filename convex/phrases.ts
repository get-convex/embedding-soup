import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import OpenAI from "openai";
import { Doc } from "./_generated/dataModel";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const add = action({
  args: { text: v.string() },
  returns: v.null(),
  handler: async (ctx, { text }) => {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    const embedding = response.data[0].embedding;

    await ctx.runMutation(internal.phrases.store, {
      text,
      embedding,
    });
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

export const search = action({
  args: { text: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("phrases"),
      text: v.string(),
    }),
  ),
  handler: async (ctx, { text }) => {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    const embedding = response.data[0].embedding;

    const results = await ctx.runQuery(internal.phrases.vectorSearch, {
      embedding,
    });

    return results.map((doc) => ({
      _id: doc._id,
      text: doc.text,
    }));
  },
});

export const vectorSearch = query({
  args: { embedding: v.array(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("phrases"),
      text: v.string(),
    }),
  ),
  handler: async (ctx, { embedding }) => {
    const results = await ctx.db
      .query("phrases")
      .withVectorIndex("by_embedding", { vector: embedding })
      .take(5);

    return results.map((doc) => ({
      _id: doc._id,
      text: doc.text,
    }));
  },
});
