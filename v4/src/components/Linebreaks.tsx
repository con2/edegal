import { Fragment } from "react";

/** Plain text where blank lines separate paragraphs and single newlines become `<br>`. */
export function Linebreaks({ text }: { text: string }) {
  const paragraphs = text.split(/(?:\r?\n){2,}/g);
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>
          {paragraph.split(/\r?\n/g).map((line, lineIndex, lines) => (
            <Fragment key={lineIndex}>
              {line}
              {lineIndex === lines.length - 1 ? null : <br />}
            </Fragment>
          ))}
        </p>
      ))}
    </>
  );
}
