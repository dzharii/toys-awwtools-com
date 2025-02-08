# TSX Config Project
Date: 2025-02-07

**TSX Config Project** is a proof-of-concept that demonstrates how to create a configuration system using TSX (TypeScript’s XML-like syntax) instead of traditional JSON. JSON configurations can quickly become verbose and hard to manage, especially for complex applications. This project leverages the familiarity of XML/HTML-like syntax along with TypeScript’s type safety to build cleaner, more maintainable configurations that are then transformed into JSON for runtime use.

## Why TSX for Configuration?

- **Expressiveness:**  
  TSX allows you to write configurations in a natural, XML-like format. This is much more concise and readable compared to the often verbose JSON.

- **Type Safety:**  
  With TypeScript interfaces defined for each configuration component, you get compile-time validation. This reduces runtime errors and ensures your configuration is correct before deployment.

- **Modularity and Reuse:**  
  Components can be reused and composed, letting you build complex configuration trees from simple building blocks.

- **Flexibility:**  
  Because you’re writing TypeScript, you can also incorporate logic, conditionals, loops, and other programmatic constructs into your configuration if needed.

## How It Works

### TSX Configuration
Write your configuration using TSX syntax. For example, instead of writing:

```json
{
 "type": "Configuration",
 "children": [
   {
     "type": "AppSettings",
     "children": [
       { "type": "Setting", "name": "apiUrl", "value": "https://example.com/api" },
       { "type": "Setting", "name": "port", "value": 8080 }
     ]
   }
 ]
}
```

You write a more concise version in `src/config.tsx`:

```tsx
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
      <Setting name="apiUrl" value="https://example.com/api" />
      <Setting name="port" value={8080} />
    </AppSettings>
    <DatabaseConnection type="sql">
      <ConnectionString>Data Source=server;Initial Catalog=db;</ConnectionString>
      <Provider>mssql</Provider>
    </DatabaseConnection>
  </Configuration>
);

export default config;
```

### Custom JSX Factory
The custom JSX pragma (`createConfigElement`) defined in `src/configElement.ts` converts TSX elements into a JavaScript object that represents the configuration tree.

### Processing to JSON
A simple recursive function in `src/processConfig.ts` processes the configuration tree and outputs a JSON file (`outputConfig.json`). This JSON file can then be consumed by your application.

## File Structure

```
tsx-config-project/
├── package.json            # Project metadata and scripts
├── tsconfig.json           # TypeScript configuration
└── src
    ├── buildConfig.ts      # Entry point: processes TSX config to JSON
    ├── config.tsx          # TSX configuration file
    ├── configElement.ts    # Custom JSX factory for TSX elements
    ├── components.tsx      # Type-safe configuration components
    └── processConfig.ts    # Converts configuration tree to JSON
```

## Installation


**Install Dependencies:**

```bash
   npm install
```

## Usage

### Build and Run

**Compile the Project:**

```bash
   npm run build
```

**Run the Project:**

```bash
   npm start
```

After running, you will see the JSON configuration printed to the console and an `outputConfig.json` file generated in the project root.

### Sample Output

The generated JSON might look like this:

```json
{
  "type": "Configuration",
  "children": [
    {
      "type": "AppSettings",
      "children": [
        {
          "type": "Setting",
          "name": "apiUrl",
          "value": "https://example.com/api"
        },
        {
          "type": "Setting",
          "name": "port",
          "value": 8080
        }
      ]
    },
    {
      "type": "DatabaseConnection",
      "type": "sql",
      "children": [
        {
          "type": "ConnectionString",
          "children": [
            "Data Source=server;Initial Catalog=db;"
          ]
        },
        {
          "type": "Provider",
          "children": [
            "mssql"
          ]
        }
      ]
    }
  ]
}
```

## Future Enhancements

- **Dynamic Configurations:**
   Incorporate environment-based or runtime logic directly into your TSX configuration.
- **Advanced Validation:**
   Expand type safety and validation rules to further ensure that configuration errors are caught at compile time.
- **Integration:**
   Adapt the project for integration with popular frameworks or microservices architectures.

## Contributing

Contributions are welcome! If you have suggestions, bug fixes, or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.