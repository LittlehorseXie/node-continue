const fs = require('fs')
const path = require('path')
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { transformFromAst } = require('@babel/core');
const config = require('../webpack.config')

function getGraphItem(filepath) {
	const file = fs.readFileSync(filepath, 'utf-8');
	const ast = babelParser.parse(file, {
		sourceType: 'module',
	});
	const { code } = transformFromAst(ast, null, {
	  presets: ['@babel/preset-env'],
	})
	const dependencies = []
	traverse(ast, {
		ImportDeclaration: ({node}) => {
			dependencies.push(node.source.value)
		}
	});
	return {
		code,
		dependencies
	}
}

const queue = {}

function getGraph(entryPath, graphItem) {
	graphItem.mapping = {}
	graphItem.dependencies.forEach(relativePath => {
		const absolutePath = path.resolve(path.dirname(entryPath), relativePath)
		graphItem.mapping[relativePath] = absolutePath
		if (!queue[absolutePath]) {
			const child = getGraphItem(absolutePath)
			queue[absolutePath] = child
			if (child.dependencies.length > 0) {
				getGraph(absolutePath, child)
			}
		}
	})
}

function bundle(graph, entryPath) {
	let modules = ''
	for (let filename in graph) {
		const mod = graph[filename]
		modules += `'${filename}': [
      function (require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)},
		],`;
	}
	const result = `(function(modules) {
		function require(id) {
			const [fn, mapping] = modules[id]
			function localRequire(name) {
        return require(mapping[name])
      }
      const module = {exports: {}}
			fn(localRequire, module, module.exports)
			console.log(module.exports)
      return module.exports
		}
		require('${entryPath}')
	})({${modules}})`
	return result
}

const entryPath = path.resolve(process.cwd(), config.entry)
const entry = getGraphItem(entryPath) 
getGraph(entryPath, entry)
const graph = {
	[entryPath]: entry,
	...queue
}
const result = bundle(graph, entryPath)
fs.writeFile(`${config.output.path}/${config.output.filename}`, result, (err) => {
  if (err) throw err;
  console.log('文件已被保存');
})