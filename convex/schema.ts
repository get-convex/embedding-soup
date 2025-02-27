import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  phrases: defineTable({
    text: v.string(),
    embedding: v.array(v.number()),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536, // OpenAI's text-embedding-3-small model dimensions
  }),
});
