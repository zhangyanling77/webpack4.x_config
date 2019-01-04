'use strict'

const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin'); // 复制静态资源的插件
const CleanWebpackPlugin = require('clean-webpack-plugin'); // 清空打包目录的插件
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 生成html的插件
const webpack = require('webpack');
const baseConfig = require('./webpack.base.config');
const merge = require('webpack-merge');

const glob = require('glob');//匹配规则
/**
 * 在webpack中，tree-shaking指的就是按需加载，即没有被引用的模块不会被打包进来，
 * 减少我们的包大小，缩小应用的加载时间，呈现给用户更佳的体验
 */
const PurifyCSSPlugin = require('purifycss-webpack');//用于css的tree-shaking
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');//用于js的tree-shaking
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin');//生产环境压缩css

module.exports = merge(baseConfig, {
    output:{
        publicPath: './' //这里要放的是静态资源CDN的地址(一般只在生产环境下配置)
        // 输出解析文件的目录，url 相对于 HTML 页面
    },
    plugins: [
        // 多入口的html文件用chunks这个参数来区分
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '..', 'src', 'index.html'),
            filename:'index.html',
            chunks:['index', 'common'],
            vendor: './vendor.dll.js',
            hash:true,//防止缓存
            minify:{
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,//压缩 去掉引号
            },
            chunksSortMode: 'dependency'
        }),
        /*打包的时候将静态资源文件复制到dist*/
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '..', 'static'),
                to: path.join(__dirname,  '..', 'dist', 'static'),
                ignore: ['.*']
            }
        ]),
        /*每次打包的时候把dist文件的内容进行清除*/
        new CleanWebpackPlugin(['dist'], {
            root: path.join(__dirname, '..'),
            exclude: ['manifest.json', 'vendor.dll.js'],
            verbose: true, //开启控制台输出
            dry:  false //启用删除文件
        }),
        /*压缩css*/
        new OptimizeCSSPlugin({
            cssProcessorOptions: {safe: true}
        }),
        /*css的tree-shaking*/
        new PurifyCSSPlugin({
            //查找html文件
            paths: glob.sync(path.join(__dirname, '../src/*.html'))
        }),
        /*js的tree-shaking 包含了压缩，混淆*/
        new WebpackParallelUglifyPlugin({
            uglifyJS: {
                output: {
                    beautify: false, //不需要格式化
                    comments: false //不保留注释
                },
                compress: {
                    warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
                    drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
                    collapse_vars: true, // 内嵌定义了但是只用到一次的变量
                    reduce_vars: true, // 提取出出现多次但是没有定义成变量去引用的静态值
                    drop_debugger: true, //删除所有的`debugger`语句
                }
            }
        }),
        new webpack.DllReferencePlugin({
            context: path.resolve(__dirname, '../'),
            manifest: path.resolve(__dirname, '..', 'dist', 'manifest.json')
        }),
    ]
})
