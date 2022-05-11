import EnsureAdminAccess from "../components/EnsureAdminAccess";

function ConfigEditor() {
  return (
    <EnsureAdminAccess>
      <p>Hello, world!</p>
    </EnsureAdminAccess>
  );
}

export default ConfigEditor;
