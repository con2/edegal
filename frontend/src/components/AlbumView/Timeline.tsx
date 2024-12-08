import React from "react";

import Picture from "../../models/Picture";

interface Props {
  pictures: Picture[];
}

const dateStrToSeconds = (dateStr: string) =>
  new Date(dateStr).getTime() / 1000;
const numBuckets = 200;
const strokeOpacity = 0.03;

export default function Timeline({ pictures }: Props) {
  // rationale for !: this component is only displayed for the timeline view, in which only pictures with taken_at are included
  const minTime = pictures.length ? dateStrToSeconds(pictures[0].taken_at!) : 0;
  const maxTime = pictures.length
    ? dateStrToSeconds(pictures[pictures.length - 1].taken_at!)
    : 0;
  const timeSpan = maxTime - minTime;

  return (
    <svg
      viewBox={`0, 0, ${numBuckets}, 1`}
      preserveAspectRatio="none"
      style={{
        width: "100%",
        height: 40,
        borderTop: "1px solid black",
        position: "fixed",
        bottom: 0,
        backgroundColor: "#333",
      }}
    >
      {pictures.map((picture) => {
        const x =
          ((dateStrToSeconds(picture.taken_at!) - minTime) / timeSpan) *
          numBuckets;

        return (
          <line
            x1={x}
            y1={0}
            x2={x}
            y2={1}
            stroke="white"
            style={{ strokeOpacity }}
          />
        );
      })}
    </svg>
  );
}
