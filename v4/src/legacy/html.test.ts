import { describe, expect, it } from "vitest";

import { legacyHtmlToMarkdown } from "./html";

// Fixtures below are trimmed down from real `edegal_album`/`edegal_photographer`/`edegal_series`
// bodies sampled from a production dump, keeping their exact tag and attribute shapes: CKEditor-era
// HTML entities, a nested ordered/unordered list, a banner image with a `width` attribute, an empty
// CKEditor spacer paragraph, and compact django-prose-editor markup with no whitespace between tags.

describe("legacyHtmlToMarkdown", () => {
  it("converts headings, emphasis, links and a nested ordered/unordered list (CKEditor era, HTML entities)", () => {
    const html = `<h1>Mikäli ennakoit julkaisevasi kuvia</h1>

<p>Rekisteröidy&nbsp;<strong>heti</strong>.</p>

<ol>
	<li>Rekisteröidy <a href="https://kompassi.eu" target="_blank">Kompassiin</a>.</li>
	<li>Saatuasi pääsyn seuraa ohjeita
	<ul>
		<li>Korvaa mielessäsi viittaukset.</li>
		<li>Kirjoita <strong>ensimäisessä persoonassa</strong>.</li>
	</ul>
	</li>
</ol>

<h3>Toinen otsikko</h3>

<p>Loppu.</p>`;
    expect(legacyHtmlToMarkdown(html)).toBe(
      `# Mikäli ennakoit julkaisevasi kuvia

Rekisteröidy **heti**.

1. Rekisteröidy [Kompassiin](https://kompassi.eu).

2. Saatuasi pääsyn seuraa ohjeita

   - Korvaa mielessäsi viittaukset.
   - Kirjoita **ensimäisessä persoonassa**.

### Toinen otsikko

Loppu.`,
    );
  });

  it("converts a compact django-prose-editor body with no leading heading", () => {
    const html = `<p>Tarinoita Mustassa on kauhularppikampanja.</p><p>Peli pelattiin <strong>18.7.2026</strong> Verstas-näyttämöllä.</p><p><a target="_blank" rel="noopener" title="" href="https://tarinoitamustassa.wordpress.com/">Pelin kotisivut.</a></p>`;
    expect(legacyHtmlToMarkdown(html)).toBe(
      `Tarinoita Mustassa on kauhularppikampanja.

Peli pelattiin **18.7.2026** Verstas-näyttämöllä.

[Pelin kotisivut.](https://tarinoitamustassa.wordpress.com/)`,
    );
  });

  it("converts a banner image, dropping its width attribute", () => {
    const html = `<p><img alt="Odysseus" src="/media/uploads/2019/07/04/odysseus_banner.jpg" width="100%" /></p>

<h1>Odysseus</h1>

<p><em>Tagline.</em></p>

<p><a href="http://www.odysseuslarp.com" target="_blank">www.odysseuslarp.com</a></p>`;
    expect(legacyHtmlToMarkdown(html)).toBe(
      `![Odysseus](/media/uploads/2019/07/04/odysseus_banner.jpg)

# Odysseus

*Tagline.*

[www.odysseuslarp.com](http://www.odysseuslarp.com)`,
    );
  });

  it("collapses a heading followed by a CKEditor `<p>&nbsp;</p>` spacer to just the heading", () => {
    const html = `<h1>Nexus</h1>

<p>&nbsp;</p>`;
    expect(legacyHtmlToMarkdown(html)).toBe("# Nexus");
  });

  it("keeps intentional double spaces from &nbsp; but trims a trailing one at end of paragraph", () => {
    const html = `<p>Hi, my name is Alex.&nbsp; I am a photographer.</p>

<p>They like to act and pose and show emotion.&nbsp;&nbsp;</p>`;
    expect(legacyHtmlToMarkdown(html)).toBe(
      "Hi, my name is Alex.  I am a photographer.\n\nThey like to act and pose and show emotion.",
    );
  });

  it("converts a series body with emphasis, strong and a strong-wrapped link", () => {
    const html = `<h1>Vallat ja väet</h1>

<p><em>Kuvaus.</em></p>

<p><strong>Vallat ja väet</strong> seuraa vaihdokkaiden elämää.</p>

<p><strong><a href="http://www.lasipallo.com/vallatjavaet/" target="_blank">Kampanjan kotisivut</a></strong></p>`;
    expect(legacyHtmlToMarkdown(html)).toBe(
      `# Vallat ja väet

*Kuvaus.*

**Vallat ja väet** seuraa vaihdokkaiden elämää.

**[Kampanjan kotisivut](http://www.lasipallo.com/vallatjavaet/)**`,
    );
  });

  it("returns an empty string for an empty body", () => {
    expect(legacyHtmlToMarkdown("")).toBe("");
  });

  it("moves a trailing space kept inside <strong> outside the ** markers instead of escaping it", () => {
    const html =
      "<p><strong>Name </strong>on tamperelainen pelitutkimuksen opiskelija.</p>";
    expect(legacyHtmlToMarkdown(html)).toBe(
      "**Name** on tamperelainen pelitutkimuksen opiskelija.",
    );
  });
});
