import { useNavigate } from "react-router-dom";
import { logout } from "../api";

export default function LogoutButton() {
  const navigate = useNavigate();

  async function onLogout() {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  }

  return (
    <button
      onClick={onLogout}
      className="
        rounded-xl
        border border-zinc-800
        bg-white/5
        px-4 py-2
        text-sm font-semibold
        text-white/90
        hover:bg-white/10 hover:text-white
        transition
      "
    >
      Logout
    </button>
  );
}
