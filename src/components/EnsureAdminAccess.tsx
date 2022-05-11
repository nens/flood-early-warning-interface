import { FC } from "react";
import { useUserHasRole } from "../api/hooks";

const EnsureAdminAccess: FC<{}> = ({ children }) => {
  const isAdmin = useUserHasRole("admin");

  if (!isAdmin) {
    return (
      <p>You do not have sufficient access to view this page.</p>
    );
  } else {
    return <>{children}</>;
  }
};

export default EnsureAdminAccess;
