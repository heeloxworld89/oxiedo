// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static',

  // The dev toolbar is off. It only ever renders under `astro dev` and never appears in a
  // production build, but it floats a pill over the bottom of the viewport — which on a phone
  // sits exactly where the page's own content is, and made it impossible to tell a real layout
  // fault from the toolbar covering things while checking mobile screenshots.
  devToolbar: {
    enabled: false,
  },
});
