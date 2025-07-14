// ✅ searchTool.js — Utility for real-time search injection
import axios from 'axios';

const GOOGLE_CSE_ID = process.env.CSE_ID;          
const GOOGLE_API_KEY = process.env.GOOGLE_KEY;     

/**
 * Performs a live search using Google Programmable Search.
 * Falls back to static message if keys aren't set.
 */
export async function performSearch(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
    return "⚠️ Live search is not configured (missing GOOGLE_KEY or CSE_ID).";
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&num=3`;

    const { data } = await axios.get(url);

    if (!data.items || data.items.length === 0) {
      return "No relevant search results found.";
    }

   
    return data.items
      .map(
        (item, index) =>
          `(${index + 1}) **${item.title}**\n${item.snippet}\n${item.link}`
      )
      .join("\n\n");
  } catch (error) {
    console.error("🔍 Search error:", error.response?.data || error.message);
    return "Failed to retrieve live search results.";
  }
}
