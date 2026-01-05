// App.tsx
import React from "react";
import { ThemeProvider } from "./src/context/ThemeContext";
import { ProfileProvider } from "./src/context/ProfileContext"; // Add this
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <ThemeProvider>
      <ProfileProvider> {/* Wrap with ProfileProvider */}
        <AppNavigator />
      </ProfileProvider>
    </ThemeProvider>
  );
}
