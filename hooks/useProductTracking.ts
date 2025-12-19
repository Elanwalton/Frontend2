import { useEffect, useRef } from "react";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/?api\/?$/i, "");

export const useProductTracking = () => {
  const trackEvent = async (
    productId: number,
    eventType: "view" | "add_to_cart" | "purchase" | "wishlist"
  ) => {
    try {
      await fetch(`${API_BASE}/api/trackProductEvent.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          event_type: eventType,
        }),
      });
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  };

  return { trackEvent };
};

// Hook to track product view when component mounts
export const useTrackProductView = (productId: number) => {
  const tracked = useRef(false);
  const { trackEvent } = useProductTracking();

  useEffect(() => {
    if (productId && !tracked.current) {
      trackEvent(productId, "view");
      tracked.current = true;
    }
  }, [productId]);
};
