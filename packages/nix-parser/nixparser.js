/ TODO make sure that the git repo in /etc / nixos is clean
//  app.post('/writeconfig',(req, res) => fs.writeFileSync('/etc/nixos/configuration.nix', '{...}', 'utf8'))

const fs = await import('node:fs');
const child_process = await('node:child_process');

// https://github.com/tree-sitter/node-tree-sitter
// interface SyntaxNode // https://github.com/tree-sitter/node-tree-sitter/blob/master/tree-sitter.d.ts#L52
const nixParser = new (await import('tree-sitter')).default();
nixParser.setLanguage((await import('tree-sitter-nix')));

// read the current system config
// ignore imported files in configuration.nix
// separate api endpoint for configText to avoid json overhead
const routes = {
	'/readconfig': (req, res) => fs
		.readFileSync('/etc/nixos/configuration.nix', 'utf8').pipe(res)),
	'/parseconfig': (req, res) => {
		// read the current system config
		// ignore imported files in configuration.nix
		//const configText = fs.readFileSync('/etc/nixos/configuration.nix', 'utf8');
		//const configTree = nixParser.parse(configText);
		//res.setHeader(json)
		const iteratorFilterNode = (syntaxNode) => ({
			type: syntaxNode.type,
			typeId: syntaxNode.typeId,
			//text: syntaxNode.text,
			children: [...syntaxNode.children].map(iteratorFilterNode),
			startIndex: syntaxNode.startIndex,
			endIndex: syntaxNode.endIndex,
			isNamed: syntaxNode.isNamed,
			name: syntaxNode.name, // ?
		});

		res.json(iteratorFilterNode(configTree.rootNode));
	}),
	'/getschema': (req, res) => {
		// get schema of all valid config options
		// based on nix-gui/nixui/options/nix_eval.py
		const name = 'get_all_nixos_options';
		const expr = `(import ./src/lib.nix).${name}`;
		console.log(expr)

		const proc = child_process.spawnSync(
			"nix-instantiate", ['--eval', '--expr', expr, '--json',
			// fix: error: cannot convert a function application to JSON
			'--strict'], { encoding: 'utf8', maxBuffer: 1 / 0 }
		);
		res.send(proc.stdout + proc.stderr);
	},
};
