# Color

Color tokens are split into global palette values, semantic aliases, and theme-specific aliases.

<ThemeSwitcher />

## Theme Tokens

These are the component-facing color variables for each theme.

### Default

<TokenTable group="color" theme="default" />

### Dark

<TokenTable group="color" theme="dark" />

### High Contrast

<TokenTable group="color" theme="highContrast" />

## Usage

Components should consume variables like `--theme-color-action-primary-bg`, not raw palette tokens. The semantic name carries intent, which makes the component API more stable than the implementation palette.
