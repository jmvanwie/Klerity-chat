// ✅ utils/searchTool.js — Custom search simulation
export const performSearch = async (query) => {
  console.log(`🔍 Mock search triggered for: ${query}`);
  if (query.toLowerCase().includes("uap")) {
    return `
**Source: Sarasota Herald-Tribune, July 2025**\n"Silent lights seen over Naples and Fort Myers in triangular formation..."

**Source: UFOsOverFlorida.com**\n"User 'skywatcher88' posted a blurry video of lights over Naples."

**Source: AARO Press Briefing**\n"We are collecting data; please report unusual phenomena."
    `;
  }
  return "No relevant info found (mock data).";
};
