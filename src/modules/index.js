// /src/modules/plugin-registry.js
// Centralized registry for modular task plugins in Klerity.ai

// Import modules
import recipes from './recipes.js';
import finance from './finance.js';
import science from './science.js';
import math from './math.js';
import philosophy from './philosophy.js';
import tech from './tech.js';
import history from './history.js';
import language from './language.js';
import literature from './literature.js';
import mythology from './mythology.js';
import life from './life.js';
import homework from './homework.js';
import news from './news.js';
import meta from './meta.js';
import defaultModule from './default.js';
import computerScience from './computerScience.js';
import aerospace from './aerospace.js';

// Export unified task module registry
export const taskModules = {
  recipes,
  finance,
  science,
  math,
  philosophy,
  tech,
  history,
  language,
  literature,
  mythology,
  life,
  homework,
  news,
  meta,
  computerScience,
  aerospace,
  default: defaultModule
};
