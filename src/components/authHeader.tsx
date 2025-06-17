import { useNavigate } from "react-router-dom";

interface AuthHeaderProps {
  variant?: "login" | "register";
}

function AuthHeader({ variant = "login" }: AuthHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="w-full flex justify-start p-4 absolute top-0 left-0">
      {variant === "login" ? (
        <button
          className="text-white bg-[#E80000] px-4 py-2 rounded hover:bg-red-700 transition"
          onClick={() => navigate("/")}
        >
          Home
        </button>
      ) : (
        <div className="flex gap-4">
          <button
            className="text-white bg-[#E80000] px-4 py-2 rounded hover:bg-red-700 transition"
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <button
            className="text-white bg-[#373232] px-4 py-2 rounded hover:bg-gray-700 transition"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthHeader;
