import { useState } from "react";
import { KDSTerminalLogin } from "./kds-terminal-login";
import { KDSProductionQueue } from "./kds-production-queue";
import { useAuth } from "@/admin/utils/auth-context";

type StationType = "FRY" | "CURRY" | "RICE" | "PREP" | "GRILL" | "DESSERT" | "HEAD_CHEF";

const VALID_STATIONS: StationType[] = ["FRY", "CURRY", "RICE", "PREP", "GRILL", "DESSERT", "HEAD_CHEF"];

export function MochaKDS() {
  const { user } = useAuth();

  // Normalize kitchenStation to uppercase so "fry" matches "FRY" etc.
  const normalizedStation = user?.kitchenStation?.toUpperCase() as StationType | undefined;

  // Auto-derive station from the logged-in chef's kitchenStation.
  // Admins/managers always see the full picker (null → show login screen).
  // Chef role always auto-enters — uses their assigned station or HEAD_CHEF as default.
  const autoStation: StationType | null =
    user?.role === 'chef'
      ? (normalizedStation && VALID_STATIONS.includes(normalizedStation) ? normalizedStation : 'HEAD_CHEF')
      : null;

  const [loggedInStation, setLoggedInStation] = useState<StationType | null>(autoStation);

  const handleLogin = (station: StationType) => {
    setLoggedInStation(station);
  };

  const handleLogout = () => {
    // Chef goes back to their own station automatically on next render.
    setLoggedInStation(autoStation);
  };

  if (!loggedInStation) {
    return <KDSTerminalLogin onLogin={handleLogin} />;
  }

  return <KDSProductionQueue station={loggedInStation} onLogout={handleLogout} />;
}
