import React from "react";

export const AuroraBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute -top-[20%] -left-[10%] w-[50rem] h-[50rem] bg-purple-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 dark:mix-blend-screen dark:bg-purple-500/20 dark:opacity-20"></div>
      <div className="absolute -top-[20%] -right-[10%] w-[50rem] h-[50rem] bg-blue-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 dark:mix-blend-screen dark:bg-blue-500/20 dark:opacity-20"></div>
      <div className="absolute -bottom-[20%] left-[20%] w-[50rem] h-[50rem] bg-emerald-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 dark:mix-blend-screen dark:bg-emerald-500/20 dark:opacity-20"></div>
    </div>
  );
};
