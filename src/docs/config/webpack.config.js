import ReactRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { config as loadEnv } from 'dotenv';
import { existsSync } from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { createRequire } from 'module';
import { resolve as pathResolve } from 'path';
import webpack from 'webpack';

import paths from './paths.ts';

const require = createRequire(import.meta.url);

loadEnv({ path: pathResolve(process.cwd(), '.env') });

const FaviconWebpackPlugin = require('favicons-webpack-plugin');

const pkg = require('../../../package.json');

const themeStyl = pathResolve(paths.src, 'theme.styl');
const logoSvgPath = pathResolve(paths.src, 'components/ui/Logo/logo.svg');

/** GitHub Pages project sites live at /<repo>/; set PUBLIC_PATH=/repo-name/ for production deploy. */
function normalizePublicPath(raw) {
  const v = (raw && String(raw).trim()) || '/';
  if (v === '/') {
    return '/';
  }
  const withLeading = v.startsWith('/') ? v : `/${v}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

function routerBasenameFromPublicPath(publicPath) {
  if (publicPath === '/') {
    return '';
  }
  return publicPath.replace(/\/$/, '');
}

export default (env, argv) => {
  const isDev = argv.mode === 'development';
  const publicPath = normalizePublicPath(process.env.PUBLIC_PATH);
  const docsRouterBasename = routerBasenameFromPublicPath(publicPath);
  const alias = {
    '#uilib': paths.src,
    uilib: paths.src,
    'docs/components': `${paths.docs}/components`,
  };
  if (existsSync(themeStyl)) {
    alias.theme = themeStyl;
  }

  const docsHtmlMinify = isDev
    ? false
    : {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      };

  const docsHtmlPluginBase = {
    lang: 'en',
    baseUrl: publicPath,
    template: `${paths.assets}/index.html`,
    minify: docsHtmlMinify,
  };

  const config = {
    entry: [paths.docs],
    output: {
      path: paths.build,
      publicPath,
    },

    resolve: {
      modules: [paths.src, paths.docs, 'node_modules'],
      extensions: ['.js', '.ts', '.tsx', '.styl'],
      alias,
    },

    optimization: {
      moduleIds: 'named',
      minimize: false,
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'babel-loader',
          include: [paths.src, paths.docs],
          options: {
            plugins: [isDev && require.resolve('react-refresh/babel')].filter(
              Boolean,
            ),
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.styl$/,
          use: [
            'style-loader',
            { loader: 'css-modules-typescript-loader' },
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                },
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  ident: 'postcss',
                  plugins: [
                    ['postcss-preset-env', { stage: 3, autoprefixer: true }],
                  ],
                },
              },
            },
            {
              loader: 'stylus-loader',
            },
          ],
        },
        {
          test: /\.svg$/i,
          oneOf: [
            {
              resourceQuery: /url/i,
              type: 'asset/resource',
            },
            {
              include: /components[/\\]ui[/\\]WorldMap[/\\]map\.svg$/,
              type: 'asset/resource',
            },
            {
              issuer: /\.[jt]sx?$/,
              use: [
                {
                  loader: '@svgr/webpack',
                  options: {
                    icon: true,
                    ext: 'tsx',
                    typescript: true,
                    exportType: 'default',
                  },
                },
              ],
            },
            {
              type: 'asset/resource',
            },
          ],
        },
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'static/[name].[ext]',
              outputPath: 'images/',
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|webp)$/,
          type: 'asset/resource',
        },
      ],
    },

    plugins: [
      isDev && new ReactRefreshPlugin(),
      new CleanWebpackPlugin(),
      new webpack.ProvidePlugin({
        React: 'react',
      }),
      new webpack.DefinePlugin({
        isDEV: JSON.stringify(isDev),
        VERSION: JSON.stringify(pkg.version),
        DOCS_ROUTER_BASENAME: JSON.stringify(docsRouterBasename),
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: `${paths.assets}/*.css`,
            to: paths.build,
          },
          {
            from: `${paths.assets}/fonts`,
            to: `${paths.build}/assets/fonts`,
            noErrorOnMissing: true,
          },
          {
            from: logoSvgPath,
            to: paths.build,
            noErrorOnMissing: true,
          },
          {
            from: logoSvgPath,
            to: `${paths.assets}/logo.svg`,
            noErrorOnMissing: true,
          },
        ],
      }),

      new HtmlWebpackPlugin({
        ...docsHtmlPluginBase,
        filename: 'index.html',
      }),
      /** GitHub Pages serves this for missing paths; same shell as index.html so SPA routes work. */
      new HtmlWebpackPlugin({
        ...docsHtmlPluginBase,
        filename: '404.html',
      }),
      existsSync(logoSvgPath) &&
        new FaviconWebpackPlugin({
          logo: logoSvgPath,
          mode: 'webapp',
          devMode: 'webapp',
          favicons: {
            appName: 'Sybilion uilib',
            developerName: 'Sybilion',
            developerURL: null,
            background: '#fff',
            theme_color: '#1a1a1a',
            display: 'standalone',
            icons: { coast: false, yandex: false },
          },
        }),
      new MiniCssExtractPlugin({
        filename: isDev ? '[name].css' : '[name].[hash].css',
        chunkFilename: isDev ? '[id].css' : '[id].[hash].css',
      }),
    ].filter(Boolean),
  };

  if (isDev) {
    Object.assign(config, {
      devtool: 'source-map',
      devServer: {
        hot: true,
        port: process.env.PORT || 8181,
        historyApiFallback: true,
        ...(publicPath !== '/' && {
          devMiddleware: { publicPath },
        }),
      },
    });
  }

  return config;
};
