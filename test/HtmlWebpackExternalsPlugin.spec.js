import assert from 'assert'
import AssertionError from 'assertion-error'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import HtmlWebpackExternalsPlugin from '../lib/'
import {
  cleanUp,
  runWebpack,
  checkBundleExcludes,
  checkCopied,
  checkHtmlIncludes,
} from './utils'

describe('HtmlWebpackExternalsPlugin', function() {
  afterEach(cleanUp)

  it('validates the arguments passed to the constructor', function() {
    assert.throws(
      () => new HtmlWebpackExternalsPlugin({}),
      /should have required property 'externals'/
    )
  })

  it('Local JS external example', function() {
    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'jquery',
            entry: 'dist/jquery.min.js',
            global: 'jQuery',
          },
        ],
      })
    )
      .then(() => checkBundleExcludes('jQuery'))
      .then(() => checkCopied('vendor/jquery/dist/jquery.min.js'))
      .then(() => checkHtmlIncludes('vendor/jquery/dist/jquery.min.js', 'js'))
  })

  it('Local CSS external example', function() {
    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'bootstrap',
            entry: 'dist/css/bootstrap.min.css',
          },
        ],
      })
    )
      .then(() => checkCopied('vendor/bootstrap/dist/css/bootstrap.min.css'))
      .then(() =>
        checkHtmlIncludes('vendor/bootstrap/dist/css/bootstrap.min.css', 'css')
      )
  })

  it('Local external with supplemental assets example', function() {
    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'bootstrap',
            entry: 'dist/css/bootstrap.min.css',
            supplements: ['dist/fonts/'],
          },
        ],
      })
    )
      .then(() => checkCopied('vendor/bootstrap/dist/css/bootstrap.min.css'))
      .then(() =>
        checkCopied(
          'vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.eot'
        )
      )
      .then(() =>
        checkHtmlIncludes('vendor/bootstrap/dist/css/bootstrap.min.css', 'css')
      )
  })

  it('CDN example', function() {
    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'jquery',
            entry: 'https://unpkg.com/jquery@3.2.1/dist/jquery.min.js',
            global: 'jQuery',
          },
        ],
      })
    )
      .then(() => checkBundleExcludes('jQuery'))
      .then(() =>
        checkHtmlIncludes(
          'https://unpkg.com/jquery@3.2.1/dist/jquery.min.js',
          'js'
        )
      )
  })

  it('URL without implicit extension example', function() {
    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'google-roboto',
            entry: {
              path: 'https://fonts.googleapis.com/css?family=Roboto',
              type: 'css',
            },
          },
        ],
      })
    ).then(() =>
      checkHtmlIncludes('https://fonts.googleapis.com/css?family=Roboto', 'css')
    )
  })

  it('Module with multiple entry points example', function() {
    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'bootstrap',
            entry: [
              'dist/css/bootstrap.min.css',
              'dist/css/bootstrap-theme.min.css',
            ],
            supplements: ['dist/fonts/'],
          },
        ],
      })
    )
      .then(() => checkCopied('vendor/bootstrap/dist/css/bootstrap.min.css'))
      .then(() =>
        checkCopied('vendor/bootstrap/dist/css/bootstrap-theme.min.css')
      )
      .then(() =>
        checkCopied(
          'vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.eot'
        )
      )
      .then(() =>
        checkHtmlIncludes('vendor/bootstrap/dist/css/bootstrap.min.css', 'css')
      )
      .then(() =>
        checkHtmlIncludes(
          'vendor/bootstrap/dist/css/bootstrap-theme.min.css',
          'css'
        )
      )
  })

  it('Appended assets example', function() {
    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'bootstrap',
            entry: 'dist/css/bootstrap.min.css',
            append: true,
          },
        ],
      })
    )
      .then(() => checkCopied('vendor/bootstrap/dist/css/bootstrap.min.css'))
      .then(() =>
        checkHtmlIncludes(
          'vendor/bootstrap/dist/css/bootstrap.min.css',
          'css',
          true
        )
      )
  })

  it('Cache-busting with hashes example', function() {
    let hash
    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'bootstrap',
            entry: 'dist/css/bootstrap.min.css',
          },
        ],
        hash: true,
      })
    )
      .then(stats => {
        hash = stats.toJson().hash
      })
      .then(() => checkCopied('vendor/bootstrap/dist/css/bootstrap.min.css'))
      .then(() =>
        checkHtmlIncludes(
          `vendor/bootstrap/dist/css/bootstrap.min.css?${hash}`,
          'css'
        )
      )
  })

  it('Customizing output path example', function() {
    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'bootstrap',
            entry: 'dist/css/bootstrap.min.css',
          },
        ],
        outputPath: 'thirdparty',
      })
    )
      .then(() =>
        checkCopied('thirdparty/bootstrap/dist/css/bootstrap.min.css')
      )
      .then(() =>
        checkHtmlIncludes(
          'thirdparty/bootstrap/dist/css/bootstrap.min.css',
          'css'
        )
      )
  })

  it('Customizing public path example', function() {
    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'bootstrap',
            entry: 'dist/css/bootstrap.min.css',
          },
        ],
        publicPath: '/assets/',
      })
    )
      .then(() => checkCopied('vendor/bootstrap/dist/css/bootstrap.min.css'))
      .then(() =>
        checkHtmlIncludes(
          '/assets/vendor/bootstrap/dist/css/bootstrap.min.css',
          'css'
        )
      )
  })

  it('Adding custom attributes to tags example', function() {
    const integrity = 'sha256-DZAnKJ/6XZ9si04Hgrsxu/8s717jcIzLy3oi35EouyE='
    const crossorigin = 'anonymous'

    return runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'jquery',
            entry: {
              path: 'https://code.jquery.com/jquery-3.2.1.js',
              attributes: {
                integrity,
                crossorigin,
              },
            },
            global: 'jQuery',
          },
        ],
      })
    )
      .then(() =>
        checkHtmlIncludes(
          'https://code.jquery.com/jquery-3.2.1.js',
          'js',
          undefined,
          undefined,
          `integrity="${integrity}" crossorigin="${crossorigin}"`
        )
      )
  })

  it('Specifying which HTML files to affect example', function() {
    return runWebpack(
      new HtmlWebpackPlugin({
        filename: 'index.html',
      }),
      new HtmlWebpackPlugin({
        filename: 'about.html',
      }),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'bootstrap',
            entry: 'dist/css/bootstrap.min.css',
          },
        ],
        files: ['about.html'],
      })
    )
      .then(() => checkCopied('vendor/bootstrap/dist/css/bootstrap.min.css'))
      .then(() =>
        checkHtmlIncludes(
          'vendor/bootstrap/dist/css/bootstrap.min.css',
          'css',
          false,
          'about.html'
        )
      )
      .then(() => {
        return new Promise((resolve, reject) => {
          checkHtmlIncludes(
            'vendor/bootstrap/dist/css/bootstrap.min.css',
            'css',
            false,
            'index.html'
          )
            .then(() =>
              reject(
                new AssertionError(
                  'index.html should not have had the assets inserted into the HTML'
                )
              )
            )
            .catch(resolve)
        })
      })
  })

  it('does not run when enabled is false', function() {
    const wp = runWebpack(
      new HtmlWebpackPlugin(),
      new HtmlWebpackExternalsPlugin({
        externals: [
          {
            module: 'jquery',
            entry: 'dist/jquery.min.js',
            global: 'jQuery',
          },
        ],
        enabled: false,
      })
    )

    return Promise.all([
      new Promise((resolve, reject) => {
        wp
          .then(() => checkBundleExcludes('jQuery'))
          .then(() =>
            reject(new AssertionError('Plugin should not have excluded jQuery'))
          )
          .catch(resolve)
      }),
      new Promise((resolve, reject) => {
        wp
          .then(() => checkCopied('vendor/jquery/dist/jquery.min.js'))
          .then(() =>
            reject(new AssertionError('Plugin should not have copied jQuery'))
          )
          .catch(resolve)
      }),
      new Promise((resolve, reject) => {
        wp
          .then(() =>
            checkHtmlIncludes('vendor/jquery/dist/jquery.min.js', 'js')
          )
          .then(() =>
            reject(new AssertionError('Plugin should not have injected jQuery'))
          )
          .catch(resolve)
      }),
    ])
  })
})
