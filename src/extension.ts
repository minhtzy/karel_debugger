import * as vscode from 'vscode';
import { KarelDebugSession } from './karelDebug';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('karel.build', async () => {
            // Implementation for build command
        })
    );

    const provider = new KarelConfigurationProvider();
    context.subscriptions.push(
        vscode.debug.registerDebugConfigurationProvider('karel', provider)
    );

    const factory = new KarelDebugAdapterDescriptorFactory();
    context.subscriptions.push(
        vscode.debug.registerDebugAdapterDescriptorFactory('karel', factory)
    );
}

export class KarelConfigurationProvider implements vscode.DebugConfigurationProvider {
    resolveDebugConfiguration(folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {
        if (!config.type && !config.request && !config.name) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'karel') {
                config.type = 'karel';
                config.name = 'Debug Karel Program';
                config.request = 'launch';
                config.program = '${file}';
                config.ktransPath = 'ktrans';
                config.version = '2.3';
            }
        }
        return config;
    }
}

class KarelDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(_session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new KarelDebugSession());
    }
} 