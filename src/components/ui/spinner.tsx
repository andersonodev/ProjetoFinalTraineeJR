import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    >
      <Loader2 
        className={cn(
          "text-primary", 
          sizeClasses[size],
          className
        )} 
      />
    </motion.div>
  );
}
