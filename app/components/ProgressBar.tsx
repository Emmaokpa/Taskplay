"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500); // Small pulse for instant feedback

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ width: "0%", opacity: 0 }}
          animate={{ width: "40%", opacity: 1 }}
          exit={{ width: "100%", opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-blue-600 via-blue-400 to-purple-500 z-[9999] shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
      )}
    </AnimatePresence>
  );
}
