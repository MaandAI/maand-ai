import React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
  backgroundColor?: "default" | "muted" | "primary" | "secondary";
}

export function SectionWrapper({
  children,
  className,
  id,
  containerClassName,
  backgroundColor = "default",
}: SectionWrapperProps) {
  const bgStyles = {
    default: "bg-background",
    muted: "bg-muted/30",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary/10",
  };

  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-24",
        bgStyles[backgroundColor],
        className
      )}
    >
      <div className={cn("container max-w-7xl px-4 md:px-6 mx-auto", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
