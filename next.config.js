const withLess = require('@zeit/next-less');
const path = require('path');
const generateTheme = require('next-dynamic-antd-theme/plugin');
const cssLoaderGetLocalIdent = require('css-loader/lib/getLocalIdent.js');

const withAntdTheme = generateTheme({
  antDir: path.join(__dirname, './node_modules/antd'),
  stylesDir: path.join(__dirname, './theme'),
  varFile: path.join(__dirname, './theme/vars.less'),
  outputFilePath: path.join(__dirname, './.next/static/color.less'),
  lessFilePath: `./_next/static/color.less`,
  lessJSPath: 'https://cdnjs.cloudflare.com/ajax/libs/less.js/3.11.3/less.min.js',
  // customThemes: { dark: { '@primary-color': 'yellow' } },
});

withAntd = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    ...nextConfig,
    lessLoaderOptions: {
      ...nextConfig.lessLoaderOptions,
      javascriptEnabled: true,
    },
    cssModules: true,
    cssLoaderOptions: {
      ...nextConfig.cssLoaderOptions,
      camelCase: true,
      localIdentName: '[local]___[hash:base64:5]',
      getLocalIdent: (context, localIdentName, localName, options) => {
        let hz = context.resourcePath.replace(context.rootContext, '');
        if (/node_modules/.test(hz)) {
          return localName;
        } else {
          return cssLoaderGetLocalIdent(context, localIdentName, localName, options);
        }
      },
    },
    webpack(config, options) {
      if (config.externals) {
        const includes = [/antd/];
        config.externals = config.externals.map((external) => {
          if (typeof external !== 'function') return external;
          return (ctx, req, cb) => {
            return includes.find((include) =>
              req.startsWith('.') ? include.test(path.resolve(ctx, req)) : include.test(req),
            )
              ? cb()
              : external(ctx, req, cb);
          };
        });
      }

      return typeof nextConfig.webpack === 'function'
        ? nextConfig.webpack(config, options)
        : config;
    },
  });
};

module.exports = withLess(
  withAntdTheme(
    withAntd(() => {
      return {
        assetPrefix: prefix,
      };
    }),
  ),
);
