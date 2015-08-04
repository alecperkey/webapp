var webpack = require('webpack')
var path    = require('path')

var HtmlWebpackPlugin = require('html-webpack-plugin')

var root_folder = path.resolve(__dirname, '..')

var third_party = 
[
	'react/dist/react.min.js',
	'react-router/dist/react-router.min.js',
	'moment/min/moment.min.js',
	'underscore/underscore-min.js'
]

var babel = 'babel-loader?stage=0&optional=runtime&plugins=typecheck'

var regular_expressions = 
{
	javascript: /\.js$/,
	style: /\.scss$/
}

var configuration =
{
	// resolve all relative paths from the project root folder
	context: root_folder,

	entry:
	{
		main: './client/application.js'
	},

	output: 
	{
		// filesystem path for static files
		path: path.resolve(root_folder, 'build', 'client'),

		// network path for static files
		publicPath: '/client/',

		// file name pattern for entry scripts
		filename: "[name].[hash].js",

		// file name pattern for chunk scripts
		chunkFilename: '[name].[chunkhash].js',

		// sourceMapFilename: '[file].map'
	},

	module:
	{
		loaders: 
		[
			{ 
				test: regular_expressions.javascript,
				exclude: /node_modules/,
				loaders: [babel]
			},
			{ 
				test: regular_expressions.style,
				loaders: 
				[
					'style',
					'css?modules&importLoaders=2&localIdentName=[local]___[hash:base64:5]',
					'autoprefixer?browsers=last 2 version',
					'sass?outputStyle=expanded&sourceMap=true&sourceMapContents=true'
				]
			},
			{
				test: /\.(png|jpg|woff|woff2|eot|ttf|svg)$/,
				loaders: ['url?limit=10240'] // Any png-image or woff-font below or equal to 10K will be converted to inline base64 instead
			}
		]
	},

	progress: true,

	resolve:
	{
		// you can now require('file') instead of require('file.coffee')
		extensions: ['', '.json', '.js']

		// // An array of directory names to be resolved to the current directory 
		// // as well as its ancestors, and searched for modules. 
		// // This functions similarly to how node finds “node_modules” directories. 
		// modulesDirectories: ['server', 'client', 'node_modules']
	},

	plugins:
	[
		// // extracts common javascript into a separate file
		// new webpack.optimize.CommonsChunkPlugin('common', 'common.[hash].js'),

		// // Assign the module and chunk ids by occurrence count. 
		// // Ids that are used often get lower (shorter) ids. 
		// // This make ids predictable, reduces to total file size and is recommended.
		// new webpack.optimize.OccurenceOrderPlugin(true)
	]
}

module.exports = configuration

// used in derived configs
configuration.regular_expressions = regular_expressions

// configuration.resolve = configuration.resolve || {}
// configuration.resolve.alias = configuration.resolve.alias || {}
// configuration.module.noParse = configuration.module.noParse || []
//
// // Run through deps and extract the first part of the path, 
// // as that is what you use to require the actual node modules 
// // in your code. Then use the complete path to point to the correct
// // file and make sure webpack does not try to parse it
// for (let dependency of third_party)
// {
// 	const dependency_path = path.resolve(root_folder, 'node_modules', dependency)
// 	configuration.resolve.alias[dependency.split(path.sep)[0]] = dependency_path
// 	configuration.module.noParse.push(dependency_path)
// }