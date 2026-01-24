"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useUser } from "@/context/UserContext";
import UserInitialAvatar from "../common/UserInitialAvatar";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { userProfile, userEmail, logout, isAuthenticated } = useUser();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = () => {
    closeDropdown();
    logout();
    router.push("/");
  };

  const userName = userProfile?.name || "Guest User";
  const displayEmail = userEmail || "guest@example.com";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full">
          <UserInitialAvatar name={userName} className="h-11 w-11" />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">{userName}</span>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {userName}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {displayEmail}
          </span>
        </div>

        
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-red-500 rounded-lg group text-theme-sm hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left"
          >
            <svg
              className="fill-red-500"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.1007 19.2469C15.1007 18.8327 15.4365 18.4969 15.8507 18.4969H18.75C19.3023 18.4969 19.75 18.0492 19.75 17.4969V6.50311C19.75 5.95082 19.3023 5.50311 18.75 5.50311H15.8507C15.4365 5.50311 15.1007 5.16732 15.1007 4.75311C15.1007 4.33889 15.4365 4.00311 15.8507 4.00311H18.75C20.1307 4.00311 21.25 5.1224 21.25 6.50311V17.4969C21.25 18.8776 20.1307 19.9969 18.75 19.9969H15.8507C15.4365 19.9969 15.1007 19.6611 15.1007 19.2469Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.7205 12.7019L16.9392 10.4831C17.2321 10.1902 17.2321 9.71533 16.9392 9.42244C16.6463 9.12955 16.1714 9.12955 15.8786 9.42244L12.5458 12.7552C12.2529 13.0481 12.2529 13.523 12.5458 13.8159L15.8786 17.1487C16.1714 17.4416 16.6463 17.4416 16.9392 17.1487C17.2321 16.8558 17.2321 16.3809 16.9392 16.088L14.7205 13.8693H3.25C2.83579 13.8693 2.5 13.5335 2.5 13.1193V12.8019C2.5 12.3877 2.83579 12.0519 3.25 12.0519H14.7205V12.7019Z"
                fill=""
              />
            </svg>
            Sign Out
          </button>
        ) : (
          <Link
            href="/signin"
            onClick={closeDropdown}
            className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-brand-500 rounded-lg group text-theme-sm hover:bg-brand-50 dark:hover:bg-brand-500/10 w-full"
          >
            <svg
              className="fill-brand-500"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.1007 19.2469C15.1007 18.8327 15.4365 18.4969 15.8507 18.4969H18.75C19.3023 18.4969 19.75 18.0492 19.75 17.4969V6.50311C19.75 5.95082 19.3023 5.50311 18.75 5.50311H15.8507C15.4365 5.50311 15.1007 5.16732 15.1007 4.75311C15.1007 4.33889 15.4365 4.00311 15.8507 4.00311H18.75C20.1307 4.00311 21.25 5.1224 21.25 6.50311V17.4969C21.25 18.8776 20.1307 19.9969 18.75 19.9969H15.8507C15.4365 19.9969 15.1007 19.6611 15.1007 19.2469Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M9.27945 12.7019L7.06068 10.4831C6.76778 10.1902 6.76778 9.71533 7.06068 9.42244C7.35357 9.12955 7.82845 9.12955 8.12134 9.42244L11.4541 12.7552C11.747 13.0481 11.747 13.523 11.4541 13.8159L8.12134 17.1487C7.82845 17.4416 7.35357 17.4416 7.06068 17.1487C6.76778 16.8558 6.76778 16.3809 7.06068 16.088L9.27945 13.8693H20.75C21.1642 13.8693 21.5 13.5335 21.5 13.1193V12.8019C21.5 12.3877 21.1642 12.0519 20.75 12.0519H9.27945V12.7019Z"
                fill=""
              />
            </svg>
            Sign In
          </Link>
        )}
      </Dropdown>
    </div>
  );
}
