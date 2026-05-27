/**
 * Load static JSON data and build lookup maps.
 */

let heroes = [];
let skills = [];
let effects = [];

const skillMap = new Map();
const effectMap = new Map();
const effectNameMap = new Map();

/** Resolve data JSON from module location (stable on Cloudflare Pages). */
const DATA_BASE = new URL('../../data/', import.meta.url);
const HERO_BASE = new URL('heroes/', DATA_BASE);

function dataUrl(filename) {
  return new URL(filename, DATA_BASE).href;
}

function heroDataUrl(filename) {
  return new URL(filename, HERO_BASE).href;
}

export async function loadData() {
  const [heroManifestRes, effectsRes] = await Promise.all([
    fetch(heroDataUrl('index.json')),
    fetch(dataUrl('effects.json')),
  ]);

  if (!heroManifestRes.ok || !effectsRes.ok) {
    throw new Error('Không thể tải dữ liệu JSON.');
  }

  const heroFiles = await heroManifestRes.json();
  const heroResponses = await Promise.all(heroFiles.map((filename) => fetch(heroDataUrl(filename))));

  if (heroResponses.some((res) => !res.ok)) {
    throw new Error('Không thể tải dữ liệu tướng.');
  }

  heroes = await Promise.all(heroResponses.map((res) => res.json()));
  skills = heroes.flatMap((hero) => hero.skills ?? []);
  effects = await effectsRes.json();

  skillMap.clear();
  effectMap.clear();
  effectNameMap.clear();

  for (const skill of skills) {
    skillMap.set(skill.id, skill);
  }
  for (const effect of effects) {
    effectMap.set(effect.id, effect);
    if (effect.name) effectNameMap.set(effect.name, effect);
  }

  return { heroes, skills, effects };
}

export function getHeroes() {
  return heroes;
}

export function getHeroById(id) {
  return heroes.find((h) => h.id === id) ?? null;
}

export function getSkillById(id) {
  return skillMap.get(id) ?? null;
}

export function getEffectById(id) {
  return effectMap.get(id) ?? null;
}

export function getEffectByName(name) {
  return effectNameMap.get(name?.trim()) ?? null;
}

export function getSkillsForHero(hero) {
  if (!hero?.skills) return [];
  return hero.skills
    .map((skill) => (typeof skill === 'string' ? skillMap.get(skill) : skill))
    .filter(Boolean);
}
