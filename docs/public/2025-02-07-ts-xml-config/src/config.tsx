// src/config.tsx
/** @jsx createConfigElement */
import { createConfigElement } from "./configElement";
import {
  Configuration,
  AppSettings,
  Setting,
  DatabaseConnection,
  ConnectionString,
  Provider
} from "./components";

const config = (
  <Configuration>
    <AppSettings>
      <Setting name="apiUrl" value="https://google.com/api" />
      <Setting name="port" value={8080} />
    </AppSettings>
    <DatabaseConnection type="sql">
      <ConnectionString>Data Source=server;Initial Catalog=db;</ConnectionString>
      <Provider>mssql</Provider>
    </DatabaseConnection>
  </Configuration>
);

export default config;
