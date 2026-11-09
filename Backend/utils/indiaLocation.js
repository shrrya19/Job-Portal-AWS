import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const locations = JSON.parse(
  readFileSync(
    fileURLToPath(new URL("../../Frontend/src/data/indiaLocations.json", import.meta.url)),
    "utf8"
  )
);
const locationByKey = new Map(locations.map((location) => [location.toLowerCase(), location]));
const aliases = new Map([
  ["bangalore", "Bengaluru"],
  ["banglore", "Bengaluru"],
  ["bangalore urban", "Bengaluru"],
  ["bangalore rural", "Bengaluru"],
  ["gurgaon", "Gurugram"],
  ["bombay", "Mumbai"],
  ["calcutta", "Kolkata"],
  ["madras", "Chennai"],
  ["trivandrum", "Thiruvananthapuram"],
  ["panaji", "Panaji"],
  ["goa (panaji)", "Panaji"],
]);

const normalizeKey = (value) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .trim()
  .toLowerCase();

export const canonicalizeIndiaLocation = (value) => {
  if (typeof value !== "string" || !value.trim()) return null;

  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length > 1) {
    const validSuffix = parts.slice(1).every((part) => {
      const key = normalizeKey(part);
      return key === "india" || locationByKey.has(key);
    });
    if (!validSuffix) return null;
  }

  const key = normalizeKey(parts[0]);
  return aliases.get(key) || locationByKey.get(key) || null;
};

export const hasIndianCountry = (country) => (
  country === undefined ||
  country === null ||
  country === "" ||
  ["india", "in"].includes(String(country).trim().toLowerCase())
);

export const isIndianLocation = (location, country, { allowRemote = true } = {}) => {
  const canonicalLocation = canonicalizeIndiaLocation(location);
  return Boolean(
    canonicalLocation &&
    hasIndianCountry(country) &&
    (allowRemote || canonicalLocation !== "Remote")
  );
};

export const isEligibleIndianJob = (job) => {
  if (!isIndianLocation(job.location, job.country)) return false;
  const company = job.company;
  return Boolean(
    company &&
    isIndianLocation(company.location, company.country, { allowRemote: false })
  );
};
