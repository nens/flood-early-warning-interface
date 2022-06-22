import { ReactNode } from "react";

interface IfProps {
  test: boolean;
  children: ReactNode;
}

function If({ test, children }: IfProps) {
  if (test) {
    return <>{children}</>;
  } else {
    return null;
  }
}

export default If;
