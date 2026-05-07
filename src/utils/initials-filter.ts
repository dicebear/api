import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const ATTRIBUTES_KEY = ':@';
const TEXT_VALUE_KEY = '#text';

// Kept in sync with the (private) `xmlRoundTripOptions` inside
// `@dicebear/converter` so a round-trip here produces output the converter
// can re-parse with the same shape.
const XML_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  preserveOrder: true,
  commentPropName: '#comment',
  allowBooleanAttributes: true,
  processEntities: false,
} as const;

const parser = new XMLParser(XML_OPTIONS);
const builder = new XMLBuilder(XML_OPTIONS);

type XmlNode = Record<string, unknown>;

function filterTextNodes(nodes: XmlNode[], blocklist: ReadonlySet<string>): void {
  for (const node of nodes) {
    for (const [key, value] of Object.entries(node)) {
      if (key === ATTRIBUTES_KEY || !Array.isArray(value)) {
        continue;
      }

      const children = value as XmlNode[];

      if (key === 'text') {
        for (const child of children) {
          const text = child[TEXT_VALUE_KEY];

          if (typeof text === 'string' && blocklist.has(text)) {
            child[TEXT_VALUE_KEY] = '*'.repeat([...text].length);
          }
        }

        // `<text>` leaves only carry `#text` children, no nested elements
        // worth recursing into.
        continue;
      }

      filterTextNodes(children, blocklist);
    }
  }
}

/**
 * Replaces the text content of any `<text>` element on the blocklist with
 * one asterisk per Unicode codepoint, preserving the visible glyph count.
 * Stays agnostic about how the text was produced upstream — no logic from
 * `Initials.fromSeed()` is replicated here.
 */
export function filterInitialsSvg(
  svg: string,
  blocklist: ReadonlySet<string>,
): string {
  if (!svg.includes('<text')) {
    return svg;
  }

  const parsed = parser.parse(svg) as XmlNode[];

  filterTextNodes(parsed, blocklist);

  return builder.build(parsed);
}
