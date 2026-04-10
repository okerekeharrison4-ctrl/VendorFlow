# UI/UX Design System

## 1. Design Principles
* **Mobile-First:** The interface is designed primarily for touch interactions on mobile devices. Large tap targets (min 44px), bottom-heavy navigation.
* **Bento Grid Layouts:** Use rounded, distinct cards to group related information (e.g., Settings screen, Dashboard stats).
* **Feedback-Driven:** Every action (save, delete, share) must have immediate visual feedback (toast notifications, button loading states, haptic-style animations).

## 2. Components
* **Bottom Navigation:** Fixed at the bottom on mobile, containing Home, Clients, Catalog, and Settings.
* **Floating Action Button (FAB):** A prominent primary button for the main action (e.g., "New Invoice").
* **Modals & Bottom Sheets:** Custom Framer Motion modals are used for all confirmations (e.g., the Premium cancellation modal) and forms. Native browser dialogs (`window.confirm`, `alert`) are strictly avoided to ensure compatibility within iframes and provide a cohesive UX.
* **Toggle Switches:** Used for boolean settings (e.g., Premium mode toggle).

## 3. Interaction & Animation
* **Page Transitions:** Soft fade and slide-up animations using Framer Motion.
* **Active States:** Buttons scale down slightly (`active:scale-95`) when tapped to simulate physical depth.
* **Skeletons/Loading:** Use spinners (`Loader2` from Lucide) inside buttons during async operations (like generating PDFs).

## 4. Accessibility
* High contrast text (`text-on-surface` vs `bg-surface`).
* Semantic HTML where possible.
* Clear visual hierarchy using typography weight and size rather than just color.
