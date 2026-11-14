// Switch the site to another page from anywhere (a page component, a button
// deep in a modal) without a full reload. App.jsx listens for this event.
//   navigate("schedule")
export const NAVIGATE_EVENT = "aces-navigate";
export const navigate = (id) => window.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, { detail: id }));
