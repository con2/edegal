import React from "react";
import Image from "next/image";
import warningIcon from "material-design-icons/alert/svg/production/ic_warning_24px.svg";

import "./index.css";

export default function ErrorMessage(children?: React.ReactNode) {
  return (
    <div className="container pt-5">
      <div className="row justify-content-center align-items-center">
        <Image src={warningIcon} alt="Warning" className="ErrorMessage-icon" />
        {children}
      </div>
    </div>
  );
}
