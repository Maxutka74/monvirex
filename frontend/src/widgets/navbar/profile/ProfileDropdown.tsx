import { BiUser } from "react-icons/bi";
import { IoMoonOutline } from "react-icons/io5";
import { LiaToggleOffSolid, LiaToggleOnSolid } from "react-icons/lia";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import themeStore from "../../../entities/theme/themeStore.tsx";
import { useStore } from "zustand/react";

type ProfileDropdownProps = {
  firstName: string;
  lastName: string;
  email: string;
  logoutFunc: () => void | Promise<void>;
  setIsProfileDropdownOpen: React.Dispatch<SetStateAction<boolean>>;
};

const ProfileDropdown = ({
  firstName,
  lastName,
  email,
  logoutFunc,
  setIsProfileDropdownOpen,
}: ProfileDropdownProps) => {
  const navigate = useNavigate();
  const theme = useStore(themeStore, (state) => state.theme);
  const setTheme = useStore(themeStore, (state) => state.setTheme);

  return (
    <div
      className={`
          flex flex-col gap-4
          w-[310px] max-w-[calc(100vw-16px)] xl:w-[250px]
          rounded-[24px] xl:rounded-[20px]
          p-5 xl:p-4
          ${
            theme === "dark"
              ? "bg-[#020817] border border-[#123A70] text-white shadow-[0_0_25px_rgba(21,151,255,0.12)]"
              : "bg-white"
          }
      `}
    >
      <div className="flex flex-col justify-center gap-1">
        <h5 className="text-[28px] xl:text-[20px] font-medium leading-tight">
          {firstName} {lastName}
        </h5>

        <p
          className={`truncate ${
            theme === "dark" ? "text-[#7184A3]" : "text-[#6F6F6F]"
          }`}
        >
          {email}
        </p>
      </div>

      <div
        className={`w-full h-px ${
          theme === "dark" ? "bg-[#123A70]" : "bg-[#E5E7EB]"
        }`}
      />

      <div className="flex flex-col gap-3">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            setIsProfileDropdownOpen(false);
            navigate("/profile");
          }}
        >
          <BiUser size={28} />
          <span>Profile</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex justify-center gap-2">
            <IoMoonOutline
              size={28}
              className={theme === "dark" ? "text-[#1597FF]" : ""}
            />
            <span>Dark Mode</span>
          </div>

          <div>
            {theme === "dark" ? (
              <LiaToggleOnSolid
                size={52}
                className="text-[#1597FF] cursor-pointer"
                onClick={() => setTheme("white")}
              />
            ) : (
              <LiaToggleOffSolid
                size={52}
                className="text-[#DFE1E7] cursor-pointer"
                onClick={() => setTheme("dark")}
              />
            )}
          </div>
        </div>

        <div className="w-full h-px bg-[#E5E7EB]" />

        <button
          className="flex items-center gap-2 text-[#DF1C41] cursor-pointer"
          onClick={logoutFunc}
        >
          <RiLogoutCircleRLine size={28} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
