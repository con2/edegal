import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

const pipeline = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeRemark)
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
