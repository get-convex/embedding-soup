# Embedding Soup

This project demonstrates how to use Convex's vector search capabilities in a simple web application. It provides a practical example of semantic search using vector embeddings.

## Features

- Add words/phrases to a collection that will be vectorized
- View all added words/phrases in a list
- Remove words/phrases from the collection
- Perform semantic searches using vector similarity
- Real-time updates of search results

## How it Works

1. Users can input words or phrases into a text area
2. Each entry is stored in Convex and converted into a vector embedding
3. Users can view and manage their collection of entries
4. A separate search input allows users to find semantically similar entries
5. Results are displayed in real-time, ordered by similarity

## Technical Stack

- Frontend: React + TypeScript
- Backend: Convex
- Vector Embeddings: Convex built-in embeddings

## Getting Started

1. Clone this repository
2. Install dependencies with `bun install`
3. Start the development server with `bun run dev`
4. Open your browser to the displayed URL

## Project Structure

- `/convex` - Backend Convex functions and schema
- `/src` - Frontend React application
- `/components` - React components
