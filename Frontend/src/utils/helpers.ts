/* eslint-disable @typescript-eslint/no-explicit-any */
export const LocalStorageGetItem = (name: any) => {
  if (typeof window !== "undefined" && localStorage) {
    const user = localStorage.getItem(name);
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const LocalStorageSetItem = (name: any, value: any) => {
  if (typeof window !== "undefined" && localStorage) {
    localStorage.setItem(name, JSON.stringify(value));
    return true;
  }
  return false;
};

export const getRandomColor = (name: string) => {
  const colors = [
    "bg-liveroom-purple text-white",
    "bg-liveroom-blue text-white",
    "bg-liveroom-green text-white",
    "bg-liveroom-red text-white",
    "bg-yellow-500 text-white",
    "bg-pink-500 text-white",
    "bg-indigo-500 text-white",
    "bg-teal-500 text-white",
    "bg-rose-500 text-white",
    "bg-cyan-500 text-white",
    "bg-amber-600 text-white",
    "bg-emerald-500 text-white",
    "bg-sky-500 text-white",
    "bg-violet-500 text-white",
    "bg-fuchsia-600 text-white",
    "bg-lime-500 text-white",
    "bg-orange-500 text-white",
    "bg-blue-700 text-white",
    "bg-red-600 text-white",
    "bg-green-600 text-white",
    "bg-purple-600 text-white",
    "bg-pink-600 text-white",
    "bg-teal-600 text-white",
    "bg-indigo-600 text-white",
  ];

  // Simple hash function to consistently assign same color to same user
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
