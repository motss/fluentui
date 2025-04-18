/**
 * This config should be shared for all web-component packages.
 * Tracking issue - https://github.com/microsoft/fluentui/issues/33576
 */

const config = {
  // Browsers to test against
  browsers: ['chrome'],

  // Importmaps for your test.
  // See: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap
  imports: {
    '@tensile-perf/web-components': '/node_modules/@tensile-perf/web-components/lib/index.js',
    '@microsoft/fast-element': '/node_modules/@microsoft/fast-element/dist/fast-element.min.js',
    '@microsoft/fast-element/utilities.js': '/node_modules/@microsoft/fast-element/dist/esm/utilities.js',
    '@microsoft/fast-web-utilities': '/node_modules/@microsoft/fast-web-utilities/dist/index.js',
    '@fluentui/tokens': '/tensile-assets/benchmark-dependencies/tokens.js',
    '@fluentui/web-components': '/node_modules/@fluentui/web-components/dist/esm/index.js',
    'exenv-es6': '/node_modules/exenv-es6/dist/index.js',
    tabbable: '/node_modules/tabbable/dist/index.esm.js',
    tslib: '/node_modules/tslib/tslib.es6.js',
  },
};

export default config;
