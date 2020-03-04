const path = require('path')
const webpack = require('webpack')
const ThemeColorReplacer = require('webpack-theme-color-replacer')
const generate = require('@ant-design/colors/lib/generate').default
const TerserPlugin = require('terser-webpack-plugin')

function resolve(dir) {
	return path.join(__dirname, dir)
}

const isDev = process.env.NODE_ENV === 'development' // true->production false->development/test

module.exports = {
	publicPath: isDev ? '/' : './',
	configureWebpack: {
		plugins: [
			// Ignore all locale files of moment.js
			new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
			// 生成仅包含颜色的替换样式（主题色等）
			new ThemeColorReplacer({
				fileName: 'css/theme-colors-[contenthash:8].css',
				matchColors: getAntdSerials('#1890ff'), // 主色系列
				// 改变样式选择器，解决样式覆盖问题
				changeSelector(selector) {
					switch (selector) {
						case '.ant-calendar-today .ant-calendar-date':
							return (
								':not(.ant-calendar-selected-date):not(.ant-calendar-selected-day)' +
								selector
							)
						case '.ant-btn:focus,.ant-btn:hover':
							return '.ant-btn:focus:not(.ant-btn-primary),.ant-btn:hover:not(.ant-btn-primary)'
						case '.ant-steps-item-process .ant-steps-item-icon > .ant-steps-icon':
							return ':not(.ant-steps-item-process)' + selector
						case '.ant-btn.active,.ant-btn:active':
							return '.ant-btn.active:not(.ant-btn-primary),.ant-btn:active:not(.ant-btn-primary)'
						case '.ant-menu-horizontal>.ant-menu-item-active,.ant-menu-horizontal>.ant-menu-item-open,.ant-menu-horizontal>.ant-menu-item-selected,.ant-menu-horizontal>.ant-menu-item:hover,.ant-menu-horizontal>.ant-menu-submenu-active,.ant-menu-horizontal>.ant-menu-submenu-open,.ant-menu-horizontal>.ant-menu-submenu-selected,.ant-menu-horizontal>.ant-menu-submenu:hover':
						case '.ant-menu-horizontal > .ant-menu-item-active,.ant-menu-horizontal > .ant-menu-item-open,.ant-menu-horizontal > .ant-menu-item-selected,.ant-menu-horizontal > .ant-menu-item:hover,.ant-menu-horizontal > .ant-menu-submenu-active,.ant-menu-horizontal > .ant-menu-submenu-open,.ant-menu-horizontal > .ant-menu-submenu-selected,.ant-menu-horizontal > .ant-menu-submenu:hover':
							return '.ant-menu-horizontal > .ant-menu-item-active,.ant-menu-horizontal > .ant-menu-item-open,.ant-menu-horizontal > .ant-menu-item-selected,.ant-menu-horizontal > .ant-menu-item:hover,.ant-menu-horizontal > .ant-menu-submenu-active,.ant-menu-horizontal > .ant-menu-submenu-open,.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-selected,.ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu:hover'
						default:
							return selector
					}
				}
			})
		],
		optimization: {
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						compress: {
							warnings: false,
							drop_console: true,
							drop_debugger: true,
							pure_funcs: ['console.log']
						}
					}
				})
			]
		}
	},

	chainWebpack: config => {
		config.resolve.alias.set('@$', resolve('src'))

		const svgRule = config.module.rule('svg')
		svgRule.uses.clear()
		svgRule
			.oneOf('inline')
			.resourceQuery(/inline/)
			.use('vue-svg-icon-loader')
			.loader('vue-svg-icon-loader')
			.end()
			.end()
			.oneOf('external')
			.use('file-loader')
			.loader('file-loader')
			.options({
				name: 'assets/[name].[hash:8].[ext]'
			})
		/* svgRule.oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })
    */
	},

	css: {
		loaderOptions: {
			less: {
				modifyVars: {
					/* less 变量覆盖，用于自定义 ant design 主题 */
					/*
          'primary-color': '#F5222D',
          'link-color': '#F5222D',
          'border-radius-base': '4px',
          */
				},
				javascriptEnabled: true
			}
		}
	},

	devServer: {
		port: 8000
		// proxy: {
		// '/api': {
		//   target: 'https://testapp.aifound.cn',
		//   ws: false,
		//   changeOrigin: true,
		//   pathRewrite: {
		//     '^/api': ''
		//   }
		// }
		// }
	},

	// disable source map in production
	productionSourceMap: false,
	lintOnSave: true,
	// babel-loader no-ignore node_modules/*
	transpileDependencies: []
}

function getAntdSerials(color) {
	// 淡化（即less的tint）
	const lightens = new Array(9).fill().map((t, i) => {
		return ThemeColorReplacer.varyColor.lighten(color, i / 10)
	})
	const colorPalettes = generate(color)
	return lightens.concat(colorPalettes)
}
