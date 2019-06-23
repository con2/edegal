import React from 'react';


const Linebreaks = ({ text }: { text: string }) => {
  const paragraphs = text.split(/(?:\r?\n){2,}/g);
  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>
          {paragraph.split(/\r?\n/g).map((line, ind, lines) => (
            <span key={ind}>
              {line}
              {ind === lines.length - 1 ? null : <br/>}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}


export default Linebreaks;
