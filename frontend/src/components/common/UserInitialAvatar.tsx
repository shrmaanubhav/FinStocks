import React from "react";

interface UserInitialAvatarProps {
  name?: string;
  className?: string;
}

export default function UserInitialAvatar({
  name = "User",
  className = "h-11 w-11",
}: UserInitialAvatarProps) {
  // Get the first letter of the name
  const initial = (name || "U").charAt(0).toUpperCase();

  // Generate a consistent color based on the initial
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-cyan-500",
  ];

  const colorIndex = initial.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={`flex items-center justify-center rounded-full font-bold text-white ${bgColor} ${className}`}
    >
      {initial}
    </div>
  );
}
