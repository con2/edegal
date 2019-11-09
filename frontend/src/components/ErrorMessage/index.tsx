import React from 'react';
import alertIcons from 'material-design-icons/sprites/svg-sprite/svg-sprite-alert-symbol.svg';

import './index.css';

const ErrorMessage: React.FC<{}> = ({ children }) => (
  <div className="container pt-5">
    <div className="row justify-content-center align-items-center">
      <svg className="ErrorMessage-icon">
        <use xlinkHref={`${alertIcons}#ic_warning_24px`} />
      </svg>
      {children}
    </div>
  </div>
);

export default ErrorMessage;
