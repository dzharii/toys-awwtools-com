// src/components.tsx
import { createConfigElement } from "./configElement";

// --- Configuration Component ---
export interface ConfigurationProps {
  children?: any;
}
export function Configuration(props: ConfigurationProps) {
  return createConfigElement("Configuration", props);
}

// --- AppSettings Component ---
export interface AppSettingsProps {
  children?: any;
}
export function AppSettings(props: AppSettingsProps) {
  return createConfigElement("AppSettings", props);
}

// --- Setting Component ---
export interface SettingProps {
  name: string;
  value: string | number;
  children?: any;
}
export function Setting(props: SettingProps) {
  return createConfigElement("Setting", props);
}

// --- DatabaseConnection Component ---
export interface DatabaseConnectionProps {
  type: string;
  children?: any;
}
export function DatabaseConnection(props: DatabaseConnectionProps) {
  return createConfigElement("DatabaseConnection", props);
}

// --- ConnectionString Component ---
export interface ConnectionStringProps {
  children?: string;
}
export function ConnectionString(props: ConnectionStringProps) {
  return createConfigElement("ConnectionString", props);
}

// --- Provider Component ---
export interface ProviderProps {
  children?: string;
}
export function Provider(props: ProviderProps) {
  return createConfigElement("Provider", props);
}
