import { GoLock, GoPencil } from "react-icons/go";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiUser } from "react-icons/ci";
import { PiEnvelopeSimpleLight, PiFloppyDiskBack } from "react-icons/pi";
import { LuUserRoundX } from "react-icons/lu";
import userStore from "../../entities/user/model/userStore.ts";
import { useEffect, useRef, useState } from "react";
import profileApi from "../../features/profile/api/profileApi.ts";
import profileStore from "../../entities/profile/profileStore.tsx";
import { BiErrorCircle } from "react-icons/bi";
import DeleteAccountModal from "./DeleteAccountModal.tsx";
import { FiEye, FiEyeOff } from "react-icons/fi";
import SuccessMessage from "./SuccessMessage.tsx";
import axios from "axios";
import { useStore } from "zustand/react";
import themeStore from "../../entities/theme/themeStore.tsx";

type FormErrors = {
  avatar?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  currentPassword?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
};

type Toast = {
  show: boolean;
  type: "avatar" | "name" | "password";
  title: string;
  message: string;
  closeToast: () => void;
};

const ProfileCard = () => {
  const theme = useStore(themeStore, (state) => state.theme);

  const API_URL = import.meta.env.VITE_API_URL;
  const DEFAULT_AVATAR = "https://res.cloudinary.com/dfpfrizds/image/upload/v1782311086/user_ev9tiw.png";
  const email = userStore((state) => state?.user?.email);
  const telegram_id = userStore((state) => state?.user?.telegram_id);
  const isTelegramUser = telegram_id != null;
  const profile = profileStore((state) => state?.profile);
  const setAvatar = profileStore((state) => state?.setAvatar);
  const setUsername = profileStore((state) => state?.setUsername);
  const refreshProfile = profileStore((state) => state?.refreshProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [error, setError] = useState<FormErrors>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!profile) return;

    setFirstName(profile.first_name);
    setLastName(profile.last_name);
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    changeAvatar(file);
  };

  const changeAvatar = async (file: File) => {
    const errorFile: FormErrors = {};

    if (
      file &&
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      errorFile.avatar = "Only JPG, PNG and WebP images are allowed";
    }

    if (file && file.size > 3 * 1024 * 1024) {
      errorFile.avatar = "Image size must be less than 3 MB";
    }

    if (Object.keys(errorFile).length > 0) {
      setError(errorFile);
      return;
    }

    try {
      const avatar = { avatar: file };
      const updateAvatar = await profileApi.updateAvatar(avatar);

      setAvatar(updateAvatar.avatar);

      setToast({
        show: true,
        type: "avatar",
        title: "Avatar updated successfully",
        message: "Your profile picture has been changed",
        closeToast: () => setToast(null),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteUserAvatar = async () => {
    if (!profile?.avatar || profile.avatar === DEFAULT_AVATAR) return;

    try {
      await profileApi.deleteAvatar();
      await refreshProfile();

      setToast({
        show: true,
        type: "avatar",
        title: "Avatar deleted successfully",
        message: "Your profile picture has been deleted",
        closeToast: () => setToast(null),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const changeUsername = async () => {
    if (!profile) return;

    const errorUsername: FormErrors = {};

    if (profile.first_name === firstName && profile.last_name === lastName) {
      errorUsername.first_name = "Please change your first name or last name";
      errorUsername.last_name = "Please change your first name or last name";
    }

    if (firstName.length < 2 || firstName.length > 50) {
      errorUsername.first_name =
        "First name must be between 2 and 50 characters";
    }

    if (lastName.length < 2 || lastName.length > 50) {
      errorUsername.last_name = "Last name must be between 2 and 50 characters";
    }

    if (Object.keys(errorUsername).length > 0) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setError(errorUsername);
      return;
    }

    try {
      await profileApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
      });

      setUsername(firstName, lastName);

      setToast({
        show: true,
        type: "name",
        title: "Profile updated successfully",
        message: "Your changes have been saved",
        closeToast: () => setToast(null),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const changePassword = async () => {
    const errorPassword: FormErrors = {};

    if (oldPassword.length < 8) {
      errorPassword.currentPassword =
        "Current password must be at least 8 characters";
    }

    if (newPassword.length < 8) {
      errorPassword.password = "New password must be at least 8 characters";
    }

    if (confirmNewPassword.length < 8) {
      errorPassword.confirmPassword =
        "Password confirmation must be at least 8 characters";
    }

    if (newPassword !== confirmNewPassword) {
      errorPassword.password = "Passwords do not match";
      errorPassword.confirmPassword = "Passwords do not match";
    }

    if (oldPassword === newPassword) {
      errorPassword.password =
        "New password must be different from your current password";
    }

    if (Object.keys(errorPassword).length > 0) {
      setError(errorPassword);
      return;
    }

    try {
      await profileApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmNewPassword,
      });

      setToast({
        show: true,
        type: "password",
        title: "Password changed successfully",
        message: "Your password has been updated",
        closeToast: () => setToast(null),
      });
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setError((error) => ({
          ...error,
          currentPassword: e.response?.data.detail,
        }));
      }
    }
  };

  const avatar = profile?.avatar;

  const avatarSrc = avatar
    ? avatar.startsWith("http")
      ? avatar
      : `${API_URL}${avatar}`
    : DEFAULT_AVATAR;

  return (
    <div
      className={`relative w-full h-full rounded-[20px] p-5 ${
        theme === "dark" ? "bg-[#020817]/40 text-white" : "bg-[#FFFFFF]/40"
      }`}
    >
      <div className="mb-5">
        <h3 className="text-[24px] font-medium">Profile Setting</h3>
        <p
          className={`${
            theme === "dark" ? "text-[#7184A3]" : "text-[#6F6F6F]"
          }`}
        >
          Manage your profile information and account settings
        </p>
      </div>

      <div>
        <div
          className={`w-full rounded-[20px] mb-5 p-5 border ${
            theme === "dark"
              ? "bg-[#020817] border-[#123A70]"
              : "bg-white border-[#DFE1E7]"
          }`}
        >
          <div className="flex flex-col mb-6">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="max-w-[380px] w-full">
                <h4 className="text-[22px] font-medium">Profile</h4>
                <p
                  className={
                    theme === "dark" ? "text-[#7184A3]" : "text-[#6F6F6F]"
                  }
                >
                  Update your profile
                  <br /> information
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-5">
                <div className="flex flex-col">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1 shrink-0">
                      <span className="font-medium">Avatar</span>
                      {error?.avatar && (
                        <div
                          className={`max-w-[330px] h-[38px] flex justify-start items-center text-wrap gap-2 rounded-[6px] bg-[#FFF0F3] mb-3`}
                        >
                          <BiErrorCircle
                            size={16}
                            className="ml-[10px] text-[#DF1C41] shrink-0"
                          />
                          <p className="text-[14px] font-medium">
                            {error?.avatar}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                    <img
                      className="w-[64px] h-[64px] rounded-full"
                      src={avatarSrc}
                      alt="avatar_user"
                    />
                    <button
                      className={`max-w-[120px] h-10 flex flex-row items-center justify-center gap-3 px-4 rounded-full cursor-pointer ${
                        theme === "dark"
                          ? "text-[#A8B8D0] border-[#164B86] bg-[#071329] hover:bg-[#0B2A52]"
                          : "text-gray-600 border-gray-300"
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <GoPencil /> Change
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleAvatarChange}
                      onClick={() =>
                        setError((error) => ({
                          ...error,
                          avatar: null,
                        }))
                      }
                    />
                    <button
                      className={`max-w-[115px] h-10 flex flex-row items-center justify-center gap-3 px-4 rounded-full cursor-pointer ${
                        theme === "dark"
                          ? "text-[#DF1C41] border-[#7A1F35] bg-[#2A0D18] hover:bg-[#3A1020]"
                          : "text-red-500 border-red-300"
                      }`}
                      onClick={() => {
                        setError((error) => ({
                          ...error,
                          avatar: null,
                        }));
                        deleteUserAvatar();
                      }}
                    >
                      <FaRegTrashCan /> Delete
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="font-medium">First Name</span>
                    {error?.first_name && (
                      <div
                        className={`w-full h-[38px] flex justify-start items-center text-wrap gap-2 rounded-[6px] bg-[#FFF0F3] p-1 mb-3`}
                      >
                        <BiErrorCircle
                          size={16}
                          className="ml-[10px] text-[#DF1C41] shrink-0"
                        />
                        <p className="text-[14px] font-medium">
                          {error?.first_name}
                        </p>
                      </div>
                    )}
                    <div className="relative">
                      <CiUser className="absolute top-3 left-3 text-2xl" />
                      <input
                        value={firstName}
                        className={`w-full h-12 outline-none rounded-full px-12 ${
                          theme === "dark"
                            ? "bg-[#071329] border border-[#164B86] text-white placeholder:text-[#60718D] focus:border-[#1597FF]"
                            : "border border-gray-100"
                        }`}
                        type="text"
                        onChange={(e) => setFirstName(e.target.value)}
                        onClick={() =>
                          setError((error) => ({
                            ...error,
                            first_name: null,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="font-medium">Last Name</span>
                    {error?.last_name && (
                      <div
                        className={`w-full h-[38px] flex justify-start items-center text-wrap gap-2 rounded-[6px] bg-[#FFF0F3] p-1 mb-3`}
                      >
                        <BiErrorCircle
                          size={16}
                          className="ml-[10px] text-[#DF1C41] shrink-0"
                        />
                        <p className="text-[14px] font-medium">
                          {error?.last_name}
                        </p>
                      </div>
                    )}
                    <div className="relative">
                      <CiUser className="absolute top-3 left-3 text-2xl" />
                      <input
                        value={lastName}
                        className={`w-full h-12 outline-none rounded-full px-12 ${
                          theme === "dark"
                            ? "bg-[#071329] border border-[#164B86] text-white placeholder:text-[#60718D] focus:border-[#1597FF]"
                            : "border border-gray-100"
                        }`}
                        type="text"
                        onChange={(e) => setLastName(e.target.value)}
                        onClick={() =>
                          setError((error) => ({
                            ...error,
                            last_name: null,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="font-medium">{email ? "Email" : "Telegram ID"}</span>
                    <div className="relative">
                      <PiEnvelopeSimpleLight className="absolute top-3 left-3 text-2xl" />
                      <p
                        className={`w-full h-12 outline-none rounded-full px-12 pt-2.75 ${
                          theme === "dark"
                            ? "bg-[#071329] border border-[#164B86] text-[#A8B8D0]"
                            : "bg-gray-100 border border-gray-100"
                        }`}
                      >
                        {email || telegram_id || ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 flex">
                    <button
                      className="max-w-[150px] w-full h-10 sm:h-12 flex-1 flex flex-row items-center justify-center gap-3 text-white bg-[#429EFF] rounded-full cursor-pointer"
                      onClick={() => {
                        setError((error) => ({
                          ...error,
                          first_name: null,
                          last_name: null,
                        }));
                        changeUsername();
                      }}
                    >
                      <PiFloppyDiskBack size={20} /> Save Name
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`w-full rounded-[20px] mb-5 p-5 border ${
            theme === "dark"
              ? "bg-[#020817] border-[#123A70]"
              : "bg-white border-[#DFE1E7]"
          }`}
        >
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="max-w-[380px] w-full">
              <h4 className="text-[22px] font-medium">Password</h4>
              <p className="text-[#6F6F6F]">
                Change your password to <br /> keep your account secure
              </p>
            </div>
            <div className="w-full flex flex-col gap-5">
                {isTelegramUser && (
                  <p
                      className={`text-[13px] mb-2 ${
                          theme === "dark" ? "text-[#7184A3]" : "text-gray-500"
                      }`}
                  >
                      Your account is linked to Telegram.
                      Password changes are unavailable.
                  </p>
                )}
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="font-medium">Current Password</span>
                  {error?.currentPassword && (
                    <div
                      className={`h-[42px] flex justify-start items-center text-wrap gap-2 rounded-[6px] bg-[#FFF0F3] mb-3`}
                    >
                      <BiErrorCircle
                        size={16}
                        className="ml-[10px] text-[#DF1C41] shrink-0"
                      />
                      <p className="text-[14px] font-medium">
                        {error?.currentPassword}
                      </p>
                    </div>
                  )}
                  <div className="relative">
                    <GoLock className="absolute top-3 left-3 text-2xl" />
                    <input
                      className={`w-full h-12 outline-none rounded-full px-12 ${
                        theme === "dark"
                          ? "bg-[#071329] border border-[#164B86] text-white placeholder:text-[#60718D] focus:border-[#1597FF]"
                          : "border border-gray-100"
                      } ${isTelegramUser ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={isTelegramUser}
                      onChange={(e) => setOldPassword(e.target.value)}
                      onClick={() =>
                        setError({ ...error, currentPassword: null })
                      }
                      type={`${showCurrentPassword ? "text" : "password"}`}
                      placeholder="Enter current password"
                    />
                    {showCurrentPassword ? (
                      <FiEye
                        size={24}
                        className={`absolute top-3 right-5 ${
                            theme === "dark" ? "text-[#7184A3]" : "text-gray-400"
                        } ${
                            isTelegramUser
                                ? "opacity-50 pointer-events-none cursor-not-allowed"
                                : "cursor-pointer"
                        }`}
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      />
                    ) : (
                      <FiEyeOff
                        size={24}
                        className={`absolute top-3 right-5 ${
                            theme === "dark" ? "text-[#7184A3]" : "text-gray-400"
                        } ${
                            isTelegramUser
                                ? "opacity-50 pointer-events-none cursor-not-allowed"
                                : "cursor-pointer"
                        }`}
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      />
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="font-medium">New Password</span>
                  {error?.password && (
                    <div
                      className={`h-[42px] flex justify-start items-center text-wrap gap-2 rounded-[6px] bg-[#FFF0F3] mb-3`}
                    >
                      <BiErrorCircle
                        size={16}
                        className="ml-[10px] text-[#DF1C41] shrink-0"
                      />
                      <p className="text-[14px] font-medium">
                        {error?.password}
                      </p>
                    </div>
                  )}
                  <div className="relative">
                    <GoLock className="absolute top-3 left-3 text-2xl" />
                    <input
                      className={`w-full h-12 outline-none rounded-full px-12 ${
                        theme === "dark"
                          ? "bg-[#071329] border border-[#164B86] text-white placeholder:text-[#60718D] focus:border-[#1597FF]"
                          : "border border-gray-100"
                      } ${isTelegramUser ? "opacity-50 cursor-not-allowed" : ""} `}
                      disabled={isTelegramUser}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onClick={() => setError({ ...error, password: null })}
                      type={`${showNewPassword ? "text" : "password"}`}
                      placeholder="Enter new password"
                    />
                    {showNewPassword ? (
                      <FiEye
                        size={24}
                        className={`absolute top-3 right-5 ${
                            theme === "dark" ? "text-[#7184A3]" : "text-gray-400"
                        } ${
                            isTelegramUser
                                ? "opacity-50 pointer-events-none cursor-not-allowed"
                                : "cursor-pointer"
                        }`}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      />
                    ) : (
                      <FiEyeOff
                        size={24}
                        className={`absolute top-3 right-5 ${
                            theme === "dark" ? "text-[#7184A3]" : "text-gray-400"
                        } ${
                            isTelegramUser
                                ? "opacity-50 pointer-events-none cursor-not-allowed"
                                : "cursor-pointer"
                        }`}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      />
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="font-medium">Confirm New Password</span>
                  {error?.confirmPassword && (
                    <div
                      className={`h-[42px] flex justify-start items-center text-wrap gap-2 rounded-[6px] bg-[#FFF0F3] mb-3`}
                    >
                      <BiErrorCircle
                        size={16}
                        className="ml-[10px] text-[#DF1C41] shrink-0"
                      />
                      <p className="text-[14px] font-medium">
                        {error?.confirmPassword}
                      </p>
                    </div>
                  )}
                  <div className="relative">
                    <GoLock className="absolute top-3 left-3 text-2xl" />
                    <input
                      className={`w-full h-12 outline-none rounded-full px-12 ${
                        theme === "dark"
                          ? "bg-[#071329] border border-[#164B86] text-white placeholder:text-[#60718D] focus:border-[#1597FF]"
                          : "border border-gray-100"
                      } ${isTelegramUser ? "opacity-50 cursor-not-allowed" : ""} `}
                      disabled={isTelegramUser}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      onClick={() =>
                        setError({ ...error, confirmPassword: null })
                      }
                      type={`${showConfirmPassword ? "text" : "password"}`}
                      placeholder="Enter confirm new password"
                    />
                    {showConfirmPassword ? (
                      <FiEye
                        size={24}
                        className={`absolute top-3 right-5 ${
                            theme === "dark" ? "text-[#7184A3]" : "text-gray-400"
                        } ${
                            isTelegramUser
                                ? "opacity-50 pointer-events-none cursor-not-allowed"
                                : "cursor-pointer"
                        }`}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    ) : (
                      <FiEyeOff
                        size={24}
                        className={`absolute top-3 right-5 ${
                            theme === "dark" ? "text-[#7184A3]" : "text-gray-400"
                        } ${
                            isTelegramUser
                                ? "opacity-50 pointer-events-none cursor-not-allowed"
                                : "cursor-pointer"
                        }`}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex lg:justify-end">
            <button
              disabled={isTelegramUser}
              className={`max-w-[200px] w-full h-10 sm:h-12 flex flex-row items-center justify-center gap-3 text-white bg-[#429EFF] rounded-full ${
                  isTelegramUser
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
              }`}
              onClick={() => changePassword()}
            >
              <GoLock size={20} /> Change Password
            </button>
          </div>
        </div>
        <div
          className={`w-full rounded-[20px] mb-5 p-5 border ${
            theme === "dark"
              ? "bg-[#020817] border-[#123A70]"
              : "bg-white border-[#DFE1E7]"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="max-w-[380px] w-full">
              <h4 className="text-[22px] font-medium">Danger Zone</h4>
              <p
                className={
                  theme === "dark" ? "text-[#7184A3]" : "text-[#6F6F6F]"
                }
              >
                Permanently delete your account <br /> and all of your data
              </p>
            </div>
            <button
              className={`max-w-[200px] w-full h-10 sm:h-12 flex flex-row items-center justify-center gap-3 rounded-full cursor-pointer ${
                theme === "dark"
                  ? "text-[#DF1C41] bg-[#2A0D18] border border-[#7A1F35] hover:bg-[#3A1020]"
                  : "text-red-500 bg-red-100/50 border border-red-400"
              }`}
              onClick={() => setDeleteModalOpen(true)}
            >
              <LuUserRoundX size={20} /> Delete Account
            </button>
          </div>
        </div>
      </div>
      {deleteModalOpen && (
        <DeleteAccountModal setDeleteModalOpen={setDeleteModalOpen} />
      )}
      {toast?.show && <SuccessMessage notificationInfo={toast} />}
    </div>
  );
};

export default ProfileCard;
