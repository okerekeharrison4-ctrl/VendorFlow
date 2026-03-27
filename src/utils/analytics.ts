import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log("[Analytics] Google Analytics initialized");
  } else {
    console.warn("[Analytics] VITE_GA_MEASUREMENT_ID not found in environment");
  }
};

export const track = (eventName: string, data?: any) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({
      category: "User Interaction",
      action: eventName,
      label: data ? JSON.stringify(data) : undefined,
      ...data
    });
  }
  
  // Keep console log for development visibility
  console.log(`[Analytics] ${eventName}`, data || '');
};
