import type { Root } from "mdast";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

/** A loosely-typed view of an mdast node: only the shape this transform reads or writes. */
interface LooseNode {
  type: string;
  value?: string;
  children?: LooseNode[];
}

const emphasisLikeTypes = new Set(["emphasis", "strong", "delete"]);

/**
 * CommonMark emphasis markers must hug their content (no space right inside `*`/`**`), so legacy
 * markup like `<strong><em>Name </em></strong>after` - trailing space kept inside the tags by the
 * old editor - would otherwise force `mdast-util-to-markdown` to escape that space and the
 * following letter as character references to preserve the exact text, which is valid but
 * unreadable. Moving the whitespace outside the emphasis node instead keeps the rendered result
 * identical and the Markdown source readable. Children are processed before their parent, so
 * whitespace nested inside several levels of emphasis (as above) hoists all the way out.
 */
function dedent(node: LooseNode): void {
  const children = node.children;
  if (!children) return;
  for (const child of children) dedent(child);

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!emphasisLikeTypes.has(child.type) || !child.children?.length) continue;

    let leading = "";
    let trailing = "";
    const first = child.children[0];
    if (first.type === "text" && first.value) {
      const match = /^\s+/.exec(first.value);
      if (match) {
        leading = match[0];
        first.value = first.value.slice(match[0].length);
      }
    }
    const last = child.children[child.children.length - 1];
    if (last.type === "text" && last.value) {
      const match = /\s+$/.exec(last.value);
      if (match) {
        trailing = match[0];
        last.value = last.value.slice(0, last.value.length - match[0].length);
      }
    }
    if (!leading && !trailing) continue;

    child.children = child.children.filter(
      (c) => !(c.type === "text" && c.value === ""),
    );
    const replacement: LooseNode[] = [];
    if (leading) replacement.push({ type: "text", value: leading });
    if (child.children.length > 0) replacement.push(child);
    if (trailing) replacement.push({ type: "text", value: trailing });
    children.splice(i, 1, ...replacement);
    i += replacement.length - 1;
  }
}

function dedentInlineEmphasis() {
  return (tree: Root) => dedent(tree as unknown as LooseNode);
}

const pipeline = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeRemark)
  .use(dedentInlineEmphasis)
  .use(remarkStringify, { bullet: "-", emphasis: "*", rule: "-" });

/**
 * Legacy album, series and photographer bodies are simple prose-editor HTML (headings, emphasis,
 * links, lists, the occasional image); this is fully expressible in the Markdown v4 bodies use, so
 * migration converts once instead of keeping an HTML/Markdown split alive in the v4 models.
 * `target="_blank"` on links is dropped (v4 rendering adds it to every external link anyway) and a
 * `width` attribute on an `<img>` is dropped (accepted: only a handful of legacy banner images use
 * it). A `<p>&nbsp;</p>` CKEditor spacer becomes a blank paragraph, collapsed away below.
 */
export function legacyHtmlToMarkdown(html: string): string {
  const markdown = String(pipeline.processSync(html));
  return markdown
    .split("\n")
    .map((line) => (line.trim() === "" ? "" : line.replace(/\s+$/, "")))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
