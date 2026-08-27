#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const [catalogPath, schemaPath] = process.argv.slice(2);
if (!catalogPath || !schemaPath) {
  console.error('Usage: node scripts/validate-catalog.mjs <catalog.json> <schema.json>');
  process.exit(2);
}

const errors = [];
const readJson = (path, label) => {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) { errors.push(`${label}: ${error.message}`); return null; }
};
const catalog = readJson(catalogPath, 'catalog');
const schema = readJson(schemaPath, 'schema');
const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;
const idPattern = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,126}[A-Za-z0-9])?$/;
const shaPattern = /^[0-9a-f]{64}$/;
const maxBytes = 512 * 1024 * 1024;
const canonicalSchemaDigest = '1047ccdba7ad52250f0e705efce94c6f80b3ddcd263294a061297b5f09e89929';

function normalizedSchemaBytes(path) {
  return Buffer.from(readFileSync(path, 'utf8').replace(/\r\n/g, '\n'), 'utf8');
}

function semver(value) {
  const match = typeof value === 'string' && value.match(semverPattern);
  if (!match) return null;
  const core = match[0].split(/[+-]/, 1)[0].split('.');
  const prerelease = match[4] ? match[4].split('.') : [];
  return { core, prerelease };
}

function compareSemver(left, right) {
  for (let i = 0; i < 3; i += 1) {
    if (left.core[i] !== right.core[i]) return left.core[i].length - right.core[i].length || (left.core[i] < right.core[i] ? -1 : 1);
  }
  if (!left.prerelease.length && right.prerelease.length) return 1;
  if (left.prerelease.length && !right.prerelease.length) return -1;
  for (let i = 0; i < Math.max(left.prerelease.length, right.prerelease.length); i += 1) {
    if (i >= left.prerelease.length) return -1;
    if (i >= right.prerelease.length) return 1;
    const a = left.prerelease[i]; const b = right.prerelease[i];
    if (a === b) continue;
    if (/^\d+$/.test(a) && /^\d+$/.test(b)) return a.length - b.length || (a < b ? -1 : 1);
    if (/^\d+$/.test(a)) return -1;
    if (/^\d+$/.test(b)) return 1;
    return a < b ? -1 : 1;
  }
  return 0;
}

function checkUrl(value, path) {
  if (typeof value !== 'string' || !/^https:\/\//.test(value)) errors.push(`${path} must be an HTTPS URL`);
  else {
    try { if (new URL(value).username || new URL(value).password) errors.push(`${path} must not contain credentials`); }
    catch { errors.push(`${path} must be a valid URL`); }
  }
}

function checkNetworkHostPermissions(value, path) {
  if (!Array.isArray(value)) return;
  const normalized = new Set();
  for (const [index, item] of value.entries()) {
    const itemPath = `${path}[${index}]`;
    const match = typeof item === 'string' && item.match(/^https:\/\/([^/?#]+)$/);
    if (!match || item.includes('*')) {
      errors.push(`${itemPath} must be an exact public HTTPS origin`);
      continue;
    }
    let parsed;
    try { parsed = new URL(item); }
    catch {
      errors.push(`${itemPath} must be an exact public HTTPS origin`);
      continue;
    }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
      errors.push(`${itemPath} must be an exact public HTTPS origin`);
      continue;
    }
    const authority = match[1];
    let hostname = authority;
    let explicitPort = null;
    const colon = authority.lastIndexOf(':');
    if (colon >= 0) {
      if (authority.indexOf(':') !== colon) {
        errors.push(`${itemPath} must use a public DNS hostname`);
        continue;
      }
      const portText = authority.slice(colon + 1);
      hostname = authority.slice(0, colon);
      if (portText) {
        explicitPort = Number(portText);
        if (!/^\d+$/.test(portText) || !Number.isInteger(explicitPort) || explicitPort < 1 || explicitPort > 65535) {
          errors.push(`${itemPath} has an invalid port`);
          continue;
        }
      }
    }
    const labels = hostname.split('.');
    const isIpv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
    if (
      !hostname
      || hostname.toLowerCase() === 'localhost'
      || hostname.includes(':')
      || hostname.includes('[')
      || hostname.includes(']')
      || isIpv4
      || labels.length < 2
      || !labels.every((label) => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label))
    ) {
      errors.push(`${itemPath} must use a public DNS hostname`);
      continue;
    }
    const canonical = `https://${hostname.toLowerCase()}${explicitPort === null ? '' : `:${explicitPort}`}`;
    if (normalized.has(canonical)) errors.push(`${path} contains a duplicate origin`);
    normalized.add(canonical);
  }
}

if (schema) {
  if (schema.$id !== 'asteria.extension.catalog.v1' || schema.properties?.entries?.type !== 'array') errors.push('schema is not the catalog v1 schema');
  if (createHash('sha256').update(normalizedSchemaBytes(schemaPath)).digest('hex') !== canonicalSchemaDigest) errors.push('schema is not the canonical catalog v1 schema copy');
  if (catalog) {
    try {
      const ajv = new Ajv2020({ allErrors: true, strict: true, unicodeRegExp: false });
      addFormats(ajv);
      if (!ajv.compile(schema)(catalog)) errors.push('catalog does not match the canonical schema');
    } catch {
      errors.push('catalog schema could not be compiled');
    }
  }
}
if (catalog) {
  if (catalog.schema_version !== 'asteria.extension.catalog.v1') errors.push('schema_version must be asteria.extension.catalog.v1');
  if (!Array.isArray(catalog.entries)) errors.push('entries must be an array');
  else {
    const ids = catalog.entries.map((entry) => String(entry?.id ?? ''));
    const folded = ids.map((id) => id.toLowerCase());
    if (new Set(folded).size !== folded.length) errors.push('entry IDs must be unique case-insensitively');
    if (ids.some((id, index) => index && folded[index - 1] > folded[index])) errors.push('entries must be sorted by case-insensitive ID');
    for (const [index, entry] of catalog.entries.entries()) {
      const path = `entries[${index}]`;
      if (!entry || typeof entry !== 'object') { errors.push(`${path} must be an object`); continue; }
      if (!idPattern.test(entry.id ?? '')) errors.push(`${path}.id is invalid`);
      for (const key of ['name', 'summary', 'version']) if (typeof entry[key] !== 'string' || !entry[key].length) errors.push(`${path}.${key} is required`);
      if (!semver(entry.version)) errors.push(`${path}.version is not semantic version`);
      if (!Object.hasOwn(entry, 'execution_level')) errors.push(`${path}.execution_level is required`);
      if (!Object.hasOwn(entry, 'permissions')) errors.push(`${path}.permissions is required`);
      const permissions = entry.permissions ?? { asteria: [], network_hosts: [], localhost: [] };
      const standardPermissionCount = (permissions.asteria?.length ?? 0)
        + (permissions.network_hosts?.length ?? 0)
        + (permissions.localhost?.length ?? 0);
      checkNetworkHostPermissions(permissions.network_hosts, `${path}.permissions.network_hosts`);
      if (entry.execution_level === 'standard' && (entry.capabilities?.length ?? 0)) {
        errors.push(`${path} standard extensions must not declare Full-access capabilities`);
      }
      if ((entry.execution_level ?? 'full_access') === 'full_access' && standardPermissionCount) {
        errors.push(`${path} Full-access extensions must not declare Standard permissions`);
      }
      const min = semver(entry.asteria?.minimum); const max = semver(entry.asteria?.maximum_exclusive);
      if (!min || !max || compareSemver(min, max) >= 0) errors.push(`${path}.asteria compatibility range is invalid`);
      checkUrl(entry.homepage, `${path}.homepage`);
      if (entry.author?.url != null) checkUrl(entry.author.url, `${path}.author.url`);
      checkUrl(entry.license?.url, `${path}.license.url`);
      checkUrl(entry.source?.url, `${path}.source.url`);
      if (!shaPattern.test(entry.source?.sha256 ?? '')) errors.push(`${path}.source.sha256 must be lowercase SHA-256`);
      if (!Number.isInteger(entry.source?.size_bytes) || entry.source.size_bytes <= 0 || entry.source.size_bytes > maxBytes) errors.push(`${path}.source.size_bytes must be 1..536870912`);
    }
  }
}

if (errors.length) { for (const error of errors) console.error(`catalog validation: ${error}`); process.exit(1); }
console.log(`Catalog valid: ${catalog.entries.length} entr${catalog.entries.length === 1 ? 'y' : 'ies'}.`);
