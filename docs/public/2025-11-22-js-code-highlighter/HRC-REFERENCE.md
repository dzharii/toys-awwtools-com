# HRC Quick Reference Card

## HRC File Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<hrc>
  <!-- File type detection -->
  <prototype name="lang" group="category" description="Language Name">
    <filename>/\.ext$/i</filename>
    <firstline>/^#!.*interpreter/i</firstline>
  </prototype>

  <!-- Syntax definition -->
  <type name="lang">
    <scheme name="lang">
      <!-- Syntax rules here -->
    </scheme>
  </type>
</hrc>
```

## Node Types

### 1. Regular Expression (`<regexp>`)

Match a single pattern:

```xml
<!-- Simple match -->
<regexp match="//.*$" region="def:Comment"/>

<!-- With capture groups -->
<regexp match="/function\s+(\w+)\s*\(/" 
        region0="def:Keyword" 
        region1="def:Function"/>

<!-- Low priority -->
<regexp match="/\w+/" region="def:Identifier" priority="low"/>
```

**Attributes:**
- `match` - Regular expression pattern
- `region` - Region for entire match
- `region0` to `region9` - Regions for capture groups
- `priority` - "normal" (default) or "low"

### 2. Block (`<block>`)

Match start/end pattern pairs:

```xml
<!-- Simple block -->
<block start="/&quot;/" end="/&quot;/" region="def:String"/>

<!-- Block with nested scheme -->
<block start="/&quot;/" end="/&quot;/" 
       scheme="StringContent" 
       region="def:String"/>

<!-- Block with regions for start/end -->
<block start="/\{/" end="/\}/" 
       region="def:Symbol"
       region0="def:PairStart"
       region0e="def:PairEnd"/>
```

**Attributes:**
- `start` - Start pattern
- `end` - End pattern
- `scheme` - Nested scheme name
- `region` - Region for entire block
- `region0` to `region9` - Start pattern capture groups
- `region0e` to `region9e` - End pattern capture groups
- `priority` - "normal" (default) or "low"
- `inner-region` - "yes" to include delimiters in region

### 3. Keywords (`<keywords>`)

Match words from a list:

```xml
<keywords region="def:Keyword">
  <word name="if"/>
  <word name="else"/>
  <word name="while"/>
</keywords>

<!-- Case-insensitive with custom word boundaries -->
<keywords region="def:Keyword" 
          ignorecase="yes"
          worddiv="\s\t\r\n(){}[],.;">
  <word name="keyword"/>
</keywords>

<!-- Individual word regions -->
<keywords region="def:Keyword">
  <word name="special" region="def:Special"/>
  <word name="normal"/>
</keywords>
```

**Attributes:**
- `region` - Default region for all keywords
- `ignorecase` - "yes" for case-insensitive
- `worddiv` - Characters that delimit words

**Word attributes:**
- `name` - The keyword text
- `region` - Override default region

### 4. Inherit (`<inherit>`)

Include another scheme:

```xml
<inherit scheme="base-scheme"/>
<inherit scheme="other-type:scheme-name"/>
```

**Attributes:**
- `scheme` - Name of scheme to inherit

## Common Regions

### Syntax Elements
- `def:Comment` - Comments
- `def:String` - String literals
- `def:Number` - Numeric literals
- `def:Keyword` - Language keywords
- `def:Operator` - Operators
- `def:Identifier` - Identifiers
- `def:Symbol` - Symbols and delimiters

### Numbers
- `def:NumberDec` - Decimal numbers
- `def:NumberHex` - Hexadecimal numbers
- `def:NumberOct` - Octal numbers
- `def:NumberBin` - Binary numbers
- `def:NumberFloat` - Floating point numbers

### Code Elements
- `def:Function` - Function names
- `def:Type` - Type names
- `def:Constant` - Constants
- `def:Variable` - Variables
- `def:Directive` - Preprocessor directives

### Markup
- `def:Tag` - Tags
- `def:OpenTag` - Opening tags
- `def:CloseTag` - Closing tags
- `def:Attribute` - Attributes

### Special
- `def:Escape` - Escape sequences
- `def:Special` - Special characters
- `def:Error` - Syntax errors
- `def:TODO` - TODO markers

## XML Entity Escaping

In patterns, escape XML special characters:

| Character | Entity | Example |
|-----------|--------|---------|
| `"` | `&quot;` | `/&quot;/` |
| `'` | `&apos;` | `/&apos;/` |
| `<` | `&lt;` | `/&lt;/` |
| `>` | `&gt;` | `/&gt;/` |
| `&` | `&amp;` | `/&amp;/` |

## Regular Expression Patterns

Common pattern examples:

```xml
<!-- Comments -->
<regexp match="//.*$" region="def:Comment"/>
<regexp match="/#.*$" region="def:Comment"/>

<!-- Numbers -->
<regexp match="/\b0[xX][0-9a-fA-F]+\b/" region="def:NumberHex"/>
<regexp match="/\b0[oO][0-7]+\b/" region="def:NumberOct"/>
<regexp match="/\b0[bB][01]+\b/" region="def:NumberBin"/>
<regexp match="/\b\d+\.?\d*([eE][+-]?\d+)?\b/" region="def:NumberFloat"/>

<!-- Strings -->
<block start="/&quot;/" end="/&quot;/" region="def:String"/>
<block start="/&apos;/" end="/&apos;/" region="def:String"/>

<!-- Functions -->
<regexp match="/\b([a-zA-Z_]\w*)\s*\(/" region1="def:Function"/>

<!-- Operators -->
<regexp match="/[\+\-\*\/\%\=\&lt;\&gt;\!\&amp;\|\^\~]/" region="def:Operator"/>

<!-- Symbols -->
<regexp match="/[\(\)\[\]\{\}\;\,\:\.]/" region="def:Symbol"/>
```

## Nested Schemes Example

```xml
<type name="mylang">
  <!-- Main scheme -->
  <scheme name="mylang">
    <block start="/&quot;/" end="/&quot;/" 
           scheme="StringContent" 
           region="def:String"/>
  </scheme>
  
  <!-- Helper scheme for string content -->
  <scheme name="StringContent">
    <regexp match="/\\[\\&quot;nrt]/" region="def:Escape"/>
    <regexp match="/\$\{[^}]*\}/" region="def:Special"/>
  </scheme>
</type>
```

## Priority and Matching

When patterns overlap:
1. Patterns are matched in order
2. Matches are sorted by position
3. Among overlapping matches, higher priority wins
4. Normal priority = 0, Low priority = 10

```xml
<!-- High priority - matches first -->
<regexp match="/\d+/" region="def:Number"/>

<!-- Low priority - only if number doesn't match -->
<regexp match="/\w+/" region="def:Identifier" priority="low"/>
```

## Complete Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<hrc>
  <prototype name="mylang" group="scripts" description="My Language">
    <filename>/\.ml$/i</filename>
  </prototype>

  <type name="mylang">
    <scheme name="mylang">
      <!-- Comments -->
      <regexp match="//.*$" region="def:Comment"/>
      <block start="/\/\*/" end="/\*\//" region="def:Comment"/>
      
      <!-- Strings -->
      <block start="/&quot;/" end="/&quot;/" 
             scheme="StringContent" 
             region="def:String"/>
      
      <!-- Numbers -->
      <regexp match="/\b\d+\b/" region="def:Number"/>
      
      <!-- Keywords -->
      <keywords region="def:Keyword">
        <word name="if"/>
        <word name="else"/>
        <word name="while"/>
        <word name="return"/>
      </keywords>
      
      <!-- Functions -->
      <regexp match="/\b([a-zA-Z_]\w*)\s*\(/" region1="def:Function"/>
      
      <!-- Operators -->
      <regexp match="/[\+\-\*\/\=\&lt;\&gt;]/" region="def:Operator"/>
    </scheme>
    
    <scheme name="StringContent">
      <regexp match="/\\[\\&quot;nrt]/" region="def:Escape"/>
    </scheme>
  </type>
</hrc>
```

## Tips

1. **Start simple** - Add rules incrementally
2. **Test frequently** - Verify each rule works
3. **Use helper schemes** - Break complex patterns into sub-schemes
4. **Set priorities** - Control which patterns win in conflicts
5. **Escape XML entities** - Use `&quot;` not `"`
6. **Use capture groups** - Highlight parts of patterns differently
7. **Check regex** - Test patterns in a regex tester first

## Debugging

- **Pattern not matching?** Test regex separately
- **Wrong colors?** Check region names match CSS
- **Conflicts?** Use priority attributes
- **Performance?** Simplify complex regexes

## Resources

- **Examples**: See `samples/javascript.hrc` and `samples/python.hrc`
- **Template**: Use `samples/template.hrc`
- **Documentation**: Read `TECHNICAL.md` for algorithms
- **Quick Start**: See `QUICKSTART.md` for step-by-step guide
