'use strict';

const sequence = require('promise-compose');
const {test, layer, unlayer, env, exec} = require('test-my-cli');

const {cleanOutputDir, excludingQuotes} = require('../lib/util');
const {assertWebpackOk, logOutput, assertContent, assertCssSourceMap, assertAssetUrls, assertAssetFiles} =
  require('../lib/assert');

module.exports = test(
  'absolute=true',
  sequence(
    layer(
      env({
        DEVTOOL: '"source-map"',
        LOADER_QUERY: '?sourceMap&absolute',
        LOADER_OPTIONS: JSON.stringify({sourceMap: true, absolute: true}),
        CSS_QUERY: '?sourceMap&root=',
        CSS_OPTIONS: JSON.stringify({sourceMap: true, root: ''}),
        OUTPUT: 'build/[name].js'
      })
    ),
    test(
      'development',
      sequence(
        test(
          'normal-build',
          sequence(
            cleanOutputDir,
            exec('npm run webpack'),
            assertWebpackOk,
            logOutput(process.env.VERBOSE),
            assertContent('CONTENT_DEV'),
            assertCssSourceMap('SOURCES'),
            assertAssetUrls('ASSETS'),
            assertAssetFiles('FILES')
          )
        ),
        test(
          'without-url',
          sequence(
            layer(
              env({
                CSS_QUERY: '?sourceMap&root=&url=false',
                CSS_OPTIONS: JSON.stringify({sourceMap: true, root: '', url: false}),
              })
            ),
            cleanOutputDir,
            exec('npm run webpack'),
            assertWebpackOk,
            logOutput(process.env.VERBOSE),
            assertContent('CONTENT_DEV'),
            assertCssSourceMap('SOURCES'),
            assertAssetUrls('ABSOLUTE', excludingQuotes),
            assertAssetFiles(false),
            unlayer
          )
        )
      )
    ),
    test(
      'production',
      sequence(
        test(
          'normal-build',
          sequence(
            cleanOutputDir,
            exec(`npm run webpack-p`),
            assertWebpackOk,
            logOutput(process.env.VERBOSE),
            assertContent('CONTENT_PROD'),
            assertCssSourceMap('SOURCES'),
            assertAssetUrls('ASSETS'),
            assertAssetFiles('FILES')
          )
        ),
        test(
          'without-url',
          sequence(
            layer(
              env({
                CSS_QUERY: '?sourceMap&root=&url=false',
                CSS_OPTIONS: JSON.stringify({sourceMap: true, root: '', url: false}),
              })
            ),
            cleanOutputDir,
            exec(`npm run webpack-p`),
            assertWebpackOk,
            logOutput(process.env.VERBOSE),
            assertContent('CONTENT_PROD'),
            assertCssSourceMap('SOURCES'),
            assertAssetUrls('ABSOLUTE', excludingQuotes),
            assertAssetFiles(false),
            unlayer
          )
        ),
        test(
          'without-devtool',
          sequence(
            layer(
              env({DEVTOOL: 'false'})
            ),
            cleanOutputDir,
            exec(`npm run webpack-p`),
            assertWebpackOk,
            logOutput(process.env.VERBOSE),
            assertContent('CONTENT_PROD'),
            assertCssSourceMap(false),
            assertAssetUrls('ASSETS'),
            assertAssetFiles('FILES'),
            unlayer
          )
        )
      )
    ),
    unlayer
  )
);
