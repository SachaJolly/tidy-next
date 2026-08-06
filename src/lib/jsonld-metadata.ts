export type JsonLdMetadata = {
  title?: string;
  description?: string;
  image?: string;
  images?: string[];
  siteName?: string;
  author?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  language?: string;
  keywords?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function resolveMaybeRelativeUrl(value: string | undefined, baseUrl: URL): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function getJsonLdString(record: Record<string, unknown>, key: string): string | undefined {
  return asString(record[key]);
}

function getJsonLdImage(record: Record<string, unknown>): string | undefined {
  const images = getJsonLdImages(record);
  return images[0];
}

function getJsonLdImages(record: Record<string, unknown>): string[] {
  const image = record.image;
  const result: string[] = [];
  const seen = new Set<string>();

  const push = (value: string | undefined) => {
    if (!value) {
      return;
    }

    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    result.push(normalized);
  };

  if (typeof image === 'string') {
    push(image);
    return result;
  }

  if (Array.isArray(image)) {
    for (const entry of image) {
      if (typeof entry === 'string' && entry.trim().length > 0) {
        push(entry);
        continue;
      }

      const entryRecord = asRecord(entry);
      const entryUrl = entryRecord ? asString(entryRecord.url) : undefined;
      push(entryUrl);
    }

    return result;
  }

  const imageRecord = asRecord(image);
  push(imageRecord ? asString(imageRecord.url) : undefined);
  return result;
}

function getJsonLdAuthor(record: Record<string, unknown>): string | undefined {
  const author = record.author;

  if (typeof author === 'string') {
    return author.trim();
  }

  if (Array.isArray(author)) {
    for (const entry of author) {
      if (typeof entry === 'string' && entry.trim().length > 0) {
        return entry.trim();
      }

      const entryRecord = asRecord(entry);
      const entryName = entryRecord ? asString(entryRecord.name) : undefined;
      if (entryName) {
        return entryName;
      }
    }
  }

  const authorRecord = asRecord(author);
  return authorRecord ? asString(authorRecord.name) : undefined;
}

function getJsonLdSiteName(record: Record<string, unknown>): string | undefined {
  const publisher = asRecord(record.publisher);
  if (publisher) {
    const publisherName = asString(publisher.name);
    if (publisherName) {
      return publisherName;
    }
  }

  return asString(record.sourceOrganization);
}

function flattenJsonLdCandidates(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => flattenJsonLdCandidates(entry));
  }

  const record = asRecord(value);
  if (!record) {
    return [];
  }

  const graph = Array.isArray(record['@graph']) ? flattenJsonLdCandidates(record['@graph']) : [];
  return [record, ...graph];
}

export function extractJsonLdMetadata(html: string, baseUrl: URL): JsonLdMetadata | null {
  const jsonLdScriptRegex =
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  const candidates: Record<string, unknown>[] = [];
  let scriptMatch = jsonLdScriptRegex.exec(html);

  while (scriptMatch) {
    const rawContent = scriptMatch[1].trim();
    if (rawContent.length > 0) {
      try {
        const parsed = JSON.parse(rawContent) as unknown;
        candidates.push(...flattenJsonLdCandidates(parsed));
      } catch {
        // Invalid JSON-LD blocks are ignored so one malformed script
        // does not break metadata extraction for the whole page.
      }
    }

    scriptMatch = jsonLdScriptRegex.exec(html);
  }

  for (const candidate of candidates) {
    const title =
      getJsonLdString(candidate, 'headline') ??
      getJsonLdString(candidate, 'name') ??
      getJsonLdString(candidate, 'title');
    const description = getJsonLdString(candidate, 'description');
    const image = resolveMaybeRelativeUrl(getJsonLdImage(candidate), baseUrl);
    const images = getJsonLdImages(candidate)
      .map((value) => resolveMaybeRelativeUrl(value, baseUrl))
      .filter((value): value is string => Boolean(value));
    const siteName = getJsonLdSiteName(candidate);
    const author = getJsonLdAuthor(candidate);
    const type = getJsonLdString(candidate, '@type');
    const publishedTime =
      getJsonLdString(candidate, 'datePublished') ?? getJsonLdString(candidate, 'uploadDate');
    const modifiedTime = getJsonLdString(candidate, 'dateModified');
    const language = getJsonLdString(candidate, 'inLanguage');
    const keywordsValue = candidate.keywords;
    const keywords =
      typeof keywordsValue === 'string'
        ? keywordsValue.trim() || undefined
        : Array.isArray(keywordsValue)
          ? keywordsValue
              .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
              .filter((entry) => entry.length > 0)
              .join(', ') || undefined
          : undefined;

    if (
      title ||
      description ||
      image ||
      images.length > 0 ||
      siteName ||
      author ||
      type ||
      publishedTime ||
      modifiedTime
    ) {
      return {
        title,
        description,
        image: image ?? images[0],
        images: images.length > 0 ? images : undefined,
        siteName,
        author,
        type,
        publishedTime,
        modifiedTime,
        language,
        keywords,
      };
    }
  }

  return null;
}
