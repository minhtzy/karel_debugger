import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
import { KarelConfigurationProvider } from '../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Debug configuration provider should provide default config', () => {
		const provider = new KarelConfigurationProvider();
		const config = provider.resolveDebugConfiguration(
			undefined,
			{
				type: "karel",
				name: "Debug Karel Program",
				request: "launch"
			}
		);

		if (vscode.window.activeTextEditor?.document.languageId === 'karel') {
			assert.strictEqual((config as vscode.DebugConfiguration).type, 'karel');
			assert.strictEqual((config as vscode.DebugConfiguration).name, 'Debug Karel Program');
			assert.strictEqual((config as vscode.DebugConfiguration).request, 'launch');
			assert.strictEqual((config as vscode.DebugConfiguration).program, '${file}');
			assert.strictEqual((config as vscode.DebugConfiguration).ktransPath, 'ktrans');
			assert.strictEqual((config as vscode.DebugConfiguration)?.version, '2.3');
		}
	});

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('your-publisher.karel-debugger'));
	});
});
