const argv = require('yargs').argv
const webpack = require('webpack')
const cssnano = require('cssnano')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
//const project = require('./project.config')
const debug = require('debug')('app:config:webpack')
const path = require('path')

var env = process.env.NODE_ENV || 'development'
const globals = {
    'process.env': {
        'NODE_ENV': JSON.stringify(env)
    },
    'NODE_ENV': env,
    '__DEV__': env === 'development',
    '__PROD__': env === 'production',
    '__TEST__': env === 'test',
    '__COVERAGE__': !argv.watch && env === 'test',
    '__BASENAME__': JSON.stringify(process.env.BASENAME || '')
}

console.log(JSON.stringify(globals))

debug('Creating configuration.')
const webpackConfig = {
    name: 'client',
    target: 'web',
    devtool: 'source-map',
    resolve: {
        root: path.resolve('src'),
        extensions: ['', '.js', '.jsx', '.json']
    },
    module: {}
}
// ------------------------------------
// Entry Points
// ------------------------------------
const APP_ENTRY = path.resolve('src/main.js')

webpackConfig.entry = {
    app: globals.__DEV__
        ? [APP_ENTRY].concat(`webpack-hot-middleware/client?path=/__webpack_hmr`)
        : [APP_ENTRY],
    vendor: [
        'react',
        'react-redux',
        'react-router',
        'redux'
    ]
}

// ------------------------------------
// Bundle Output
// ------------------------------------
webpackConfig.output = {
    filename: `[name].[hash].js`,
    path:  path.resolve('dist'),
    publicPath: '/'
}

// ------------------------------------
// Externals
// ------------------------------------
webpackConfig.externals = {}
webpackConfig.externals['react/lib/ExecutionEnvironment'] = true
webpackConfig.externals['react/lib/ReactContext'] = true
webpackConfig.externals['react/addons'] = true

// ------------------------------------
// Plugins
// ------------------------------------
webpackConfig.plugins = [
    new webpack.DefinePlugin(globals),
    new HtmlWebpackPlugin({
        template: path.resolve('src/index.html'),
        hash: false,
        filename: 'index.html',
        inject: 'body',
        minify: {
            collapseWhitespace: true
        }
    })
]

// Ensure that the compiler exits on errors during testing so that
// they do not get skipped and misreported.


if (globals.__DEV__) {
    debug('Enabling plugins for live development (HMR, NoErrors).')
    webpackConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    )
} else if (globals.__PROD__) {
    debug('Enabling plugins for production (OccurrenceOrder, Dedupe & UglifyJS).')
    webpackConfig.plugins.push(
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                unused: true,
                dead_code: true,
                warnings: false
            }
        }),
        new webpack.optimize.AggressiveMergingPlugin()
    )
}

// Don't split bundles during testing, since we only want import one bundle

    webpackConfig.plugins.push(
        new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor']
        })
    )

// ------------------------------------
// Loaders
// ------------------------------------
// JavaScript / JSON
webpackConfig.module.loaders = [
    {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
            cacheDirectory: true,
            plugins: ['transform-runtime'],
            presets: ['es2015', 'react', 'stage-0']
        }
    },
    {
        test: /\.json$/,
        loader: 'json'
    }]

// ------------------------------------
// Style Loaders
// ------------------------------------
// We use cssnano with the postcss loader, so we tell
// css-loader not to duplicate minimization.
const BASE_CSS_LOADER = 'css?sourceMap&-minimize'

webpackConfig.module.loaders.push({
    test: /\.scss$/,
    exclude: null,
    loaders: [
        'style',
        BASE_CSS_LOADER,
        'postcss',
        'sass?sourceMap'
    ]
})
webpackConfig.module.loaders.push({
    test: /\.css$/,
    exclude: null,
    loaders: [
        'style',
        BASE_CSS_LOADER,
        'postcss'
    ]
})

webpackConfig.sassLoader = {
    includePaths: path.resolve('src/styles')
}

webpackConfig.postcss = [
    cssnano({
        autoprefixer: {
            add: true,
            remove: true,
            browsers: ['last 2 versions']
        },
        discardComments: {
            removeAll: true
        },
        discardUnused: false,
        mergeIdents: false,
        reduceIdents: false,
        safe: true,
        sourcemap: true
    })
]

// File loaders
/* eslint-disable */
webpackConfig.module.loaders.push(
    {
        test: /\.woff(\?.*)?$/,
        loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff'
    },
    {
        test: /\.woff2(\?.*)?$/,
        loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2'
    },
    {test: /\.otf(\?.*)?$/, loader: 'file?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype'},
    {
        test: /\.ttf(\?.*)?$/,
        loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream'
    },
    {test: /\.eot(\?.*)?$/, loader: 'file?prefix=fonts/&name=[path][name].[ext]'},
    {test: /\.svg(\?.*)?$/, loader: 'url?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml'},
    {test: /\.(png|jpg)$/, loader: 'url?limit=8192'}
)
/* eslint-enable */

// ------------------------------------
// Finalize Configuration
// ------------------------------------
// when we don't know the public path (we know it only when HMR is enabled [in development]) we
// need to use the extractTextPlugin to fix this issue:
// http://stackoverflow.com/questions/34133808/webpack-ots-parsing-error-loading-fonts/34133809#34133809
if (!globals.__DEV__) {
    debug('Applying ExtractTextPlugin to CSS loaders.')
    webpackConfig.module.loaders.filter((loader) =>
        loader.loaders && loader.loaders.find((name) => /css/.test(name.split('?')[0]))
    ).forEach((loader) => {
        const first = loader.loaders[0]
        const rest = loader.loaders.slice(1)
        loader.loader = ExtractTextPlugin.extract(first, rest.join('!'))
        delete loader.loaders
    })

    webpackConfig.plugins.push(
        new ExtractTextPlugin('[name].[contenthash].css', {
            allChunks: true
        })
    )
}

module.exports = webpackConfig
