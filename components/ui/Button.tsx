// Re-export all button components for backward compatibility
export { default as ArrowButton } from "../auth/buttons/ArrowButton";
export { default as AuthButton, default } from "../auth/buttons/AuthButton";
export { default as EmailButton } from "../auth/buttons/EmailButton";
export { default as BaseButton } from "./BaseButton";

// Export types
export type { BaseButtonProps } from "./BaseButton";
