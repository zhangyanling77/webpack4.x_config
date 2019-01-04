'use strict'

const path = require('path');
const chalk = require('chalk');//颜色插件。主要用于日志输出
// const webpack = require('webpack');//内置插件
const ProgressBarPlugin = require('progress-bar-webpack-plugin');//显示打包进度
const HappyPack = require('happypack');//多进程打包，提高打包速度
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); //CSS文件单独提取出来
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function resolve (dir) {
  return path.join(__dirname, '..', dir);
}

function assetsPath(_path_) {
  let assetsSubDirectory;
  if (process.env.NODE_ENV === 'production') {
    assetsSubDirectory = 'static'; //可根据实际情况修改
  } else {
    assetsSubDirectory = 'static';
  }
  return path.posix.join(assetsSubDirectory, _path_);
}

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    index: './src/index.js'
  },
  output:{
    path: resolve('dist'),
    filename:'[name].[hash:7].js', //入口文件命名
    chunkFilename: '[name].chunk.[hash:7].js' //非入口文件命名
  },
  resolve: {
    //自动解析确定的扩展，当引入模块时便可以不带扩展名
    extensions: ['.js','.jsx','.json'],
    //配置别名可以加快webpack查找模块的速度
    alias: {
      '@': resolve('src')
    } 
  },
  /** 
   * 外部扩展。【从输出的bundle中排除依赖】不要遵循/打包这些模块，
   * 而是在运行时从环境中请求他们(比如百度地图地图)，jquery等不需要改动的依赖模块（CDN引入的模块）
  */
  // externals: { 
  //   BMap: 'BMap',
  //   jquery: 'jQuery'
  // }, 
  module: {
    // 多个loader是有顺序要求的，从右往左写，因为转换的时候是从右往左转换的
    rules:[
      {
        test: /\.css$/,
        use: ['css-hot-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        include: [resolve('src')], //限制范围，提高打包速度
        exclude: /node_modules/
      },
      {
        test:/\.less$/,
        use: ['css-hot-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader'],
        include: [resolve('src')],
        exclude: /node_modules/
      },
      {
        test:/\.scss$/,
        use: ['css-hot-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
        include: [resolve('src')],
        exclude: /node_modules/
      },
      {
          test: /\.jsx?$/,
          loader: 'happypack/loader?id=happy-babel-js',
          include: [resolve('src')],
          exclude: /node_modules/,
      },
      { //file-loader 解决css等文件中引入图片路径的问题
      // url-loader 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
        test: /\.(png|jpg|jpeg|gif|svg)/,
        use: {
          loader: 'url-loader',
          options: {
            name: assetsPath('images/[name].[hash:7].[ext]'), // 图片输出的路径
            limit: 1 * 1024
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  optimization: { //webpack4.x的最新优化配置项，用于提取公共代码
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial', // all, async
          name: 'common',
          minChunks: 2,
          maxInitialRequests: 5, // The default limit is too small to showcase the effect
          minSize: 0, // This is example is too small to create commons chunks
          reuseExistingChunk: true // 可设置是否重用该chunk（查看源码没有发现默认值）
        }
      }
    }
  },
  plugins: [
    //happypack 多线程打包
    new HappyPack({
      id: 'happy-babel-js',
      loaders: ['babel-loader?cacheDirectory=true'],
      threadPool: happyThreadPool,
      verbose: true
    }),
    //webpack4.x的最新优化配置项，用于提取公共代码
    // new webpack.optimize.SplitChunksPlugin({
		// 	cacheGroups: {
		// 		default: {
		// 			minChunks: 2,
		// 			priority: -20,
		// 			reuseExistingChunk: true,
		// 		},
		// 		//打包重复出现的代码
		// 		vendor: {
		// 			chunks: 'initial',
		// 			minChunks: 2,
		// 			maxInitialRequests: 5, // The default limit is too small to showcase the effect
		// 			minSize: 0, // This is example is too small to create commons chunks
		// 			name: 'vendor'
		// 		},
		// 		//打包第三方类库
		// 		common: {
		// 			name: "common",
		// 			chunks: "initial",
		// 			minChunks: Infinity
		// 		}
		// 	}
		// }),
    /*加载吧css文件单独分离出来的插件*/
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    /*打包进度展示*/
    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
    }),
    // new webpack.optimize.RuntimeChunkPlugin({
		// 	name: "manifest"
    // }),
    // new webpack.HashedModuleIdsPlugin(),//用于固定模块id 防止调整顺序对于id进行重新打包

		//提升作用域
    // new webpack.optimize.ModuleConcatenationPlugin(),
    new BundleAnalyzerPlugin()
  ]
}