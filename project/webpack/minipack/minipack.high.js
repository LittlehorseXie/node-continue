const fs = require('fs')
const path = require('path')
const babelParser = require('@babel/parser')
const traverse = require('@babel/traverse').default;
const { transformFromAst } = require('@babel/core');
const config = require('../webpack.config')

const Parser = {
	getAst: (filePath) => {
		const content = fs.readFileSync(filePath, 'utf-8')
		return babelParser.parse(content, {
			sourceType: 'module'
		})
	},
	getDependencies: (ast, filepath) => {
		const dependencies = {}
		traverse(ast, {
			ImportDeclaration: ({ node }) => {
				const dirname = path.dirname(filepath)
				const filePath = path.resolve(dirname, node.source.value)
				dependencies[node.source.value] = filePath
			}
		})
		return dependencies
	},
	getCode: (ast) => {
		const { code } = transformFromAst(ast, null, {
			presets: ['@babel/preset-env']
		})
		return code
	},
}

class Compiler {
	constructor(options) {
		const { entry, output } = options
		this.entry = entry
		this.output = output
		this.graph = {}
	}
	run() {
		this.build(this.entry)
		this.generate(this.graph)
	}
	build(filePath) {
		if (!this.graph[filePath]) {
			const ast = Parser.getAst(filePath)
			const content = {
				code: Parser.getCode(ast),
				dependencies: Parser.getDependencies(ast, filePath)
			}
			this.graph[filePath] = content
			for(let relativePath in content.dependencies) {
				const absolutePath = content.dependencies[relativePath]
				this.build(absolutePath)
			}
		}
	}
	generate(graph) {
		// 重写require
		const result = `(function(graph) {
			function require(moduleId) {
				function localRequire(relativePath) {
					return require(graph[moduleId].dependencies[relativePath])
				}
				const exports = {};
				(function(require, exports, code) {
					eval(code)
				})(localRequire, exports, graph[moduleId].code)
				return exports
			}
			require('${this.entry}')
		})(${JSON.stringify(graph)})`
		const outputPath = path.resolve(this.output.path, this.output.filename)
		fs.writeFileSync(outputPath, result, 'utf-8')
	}
}

new Compiler(config).run()
