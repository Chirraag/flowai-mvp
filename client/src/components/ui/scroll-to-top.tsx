import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

interface ScrollToTopButtonProps {
  threshold?: number;
  className?: string;
}

export default function ScrollToTopButton({
  threshold = 300,
  className = ""
}: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-[60] h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-[#f48024] hover:bg-[#f48024]/90 text-white ${className}`}
      size="sm"
      variant="default"
    >
      <ChevronUp className="h-6 w-6" />
      <span className="sr-only">Scroll to top</span>
    </Button>
  );
}
