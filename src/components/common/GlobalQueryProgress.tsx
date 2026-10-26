import React, { useEffect, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";

/**
 * GlobalQueryProgress — A subtle, premium top progress bar that indicates
 * background API queries / mutations across the Admin Panel without blocking the UI.
 */
export const GlobalQueryProgress: React.FC = () => {
  const isFetching = useIsFetching();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isFetching > 0) {
      // 100ms debounce to prevent flicker on instant cache hits
      timer = setTimeout(() => {
        setVisible(true);
      }, 100);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isFetching]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-[9999] h-[2.5px] overflow-hidden bg-transparent">
      <div
        className="h-full w-full animate-loader-progress"
        style={{
          background: "linear-gradient(90deg, transparent 0%, #F472B6 50%, #FB7185 100%)",
          boxShadow: "0 0 10px rgba(244, 114, 182, 0.6)",
        }}
      />
    </div>
  );
};

export default GlobalQueryProgress;
