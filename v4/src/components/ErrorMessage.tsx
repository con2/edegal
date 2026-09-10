import type { ReactNode } from "react";

import { WarningIcon } from "./icons";

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <div className="container pt-5">
      <div className="row justify-content-center align-items-center">
        <WarningIcon className="ErrorMessage-icon" />
        {children}
      </div>
    </div>
  );
}
