import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Starlight supplies layout, sidebar navigation, contents, themes and Pagefind search.
export default defineConfig({
  site: 'https://c99-property-match-guide.mach1ne.chatgpt.site',
  output: 'static', trailingSlash: 'always',
  cacheDir: './.generated/astro-cache',
  integrations: [starlight({
    title: 'C99 key matching',
    description: 'Parser behavior, matching algorithms, commented source and measured results.',
    customCss: ['@fontsource/atkinson-hyperlegible/latin-400.css', '@fontsource/atkinson-hyperlegible/latin-700.css', '@fontsource-variable/jetbrains-mono/wght.css', './web/styles/reader.css'],
    components: { Header: './web/components/ReaderHeader.astro', Sidebar: './web/components/ReaderSidebar.astro', Head: './web/components/ReaderHead.astro' },
    sidebar: [
      { label: 'Project overview', slug: '' },
      { label: 'Configuration processing', items: [
        { label: 'Parsing and resolution sequence', slug: 'configuration-sequence' },
        { label: 'Acceptance and rejection rules', slug: 'acceptance-policy' },
      ]},
      { label: 'Matching algorithms', items: [
        { label: 'Algorithm comparison', slug: 'matching-algorithms' },
        { label: 'Measured recovery and risks', slug: 'reference/measured-results' },
        { label: 'Edit distance calculations', slug: 'edit-distances' },
        { label: 'Scoring formulas and limits', slug: 'reference/algorithm-formulas' },
        { label: 'Algorithm explanations and references', slug: 'reference/learning-resources' },
      ]},
      { label: 'Source reference', items: [
        { label: 'C99 source files', slug: 'source-files' },
        { label: 'Searchable reference tags', slug: 'reference-tags' },
        { label: 'Source readability changes', slug: 'source-review' },
        { label: 'Standard-library and banned-call review', slug: 'standard-library-review' },
      ]},
      { label: 'Tests and reports', items: [
        { label: 'Correctness and regression results', slug: 'verification-results' },
        { label: 'Benchmark results', slug: 'reference/benchmark-results' },
        { label: 'Calibration and timing methods', slug: 'reference/benchmark-methods' },
        { label: 'Build and run commands', slug: 'build-commands' },
      ]},
    ],
    tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
    pagination: true, lastUpdated: false,
    expressiveCode: { themes: ['github-light', 'github-dark'], defaultProps: { wrap: true } },
  })],
});
