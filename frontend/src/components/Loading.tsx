import React from 'react';

// import Spinner from 'react-svg-spinner';

// TODO Replace spinner with sth like https://github.com/danilowoz/react-content-loader
// TODO Figure out how to center this vertically without breaking sticky footer
// Adding h-100 to both divs and height: 100% to html, body works otherwise, but breaks footer
const Loading: React.FC<{}> = () => (
  <div className="container pt-5">
    <div className="row justify-content-center align-items-center">
      {/* <Spinner color="#eee" size="6vw" speed="slow" gap={1} /> */}
    </div>
  </div>
);

export default Loading;
