import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
	console.log('WPISpotless');

	const disposable = vscode.commands.registerCommand('wpi-spotless.spotless', () => {
		if (vscode.workspace.workspaceFolders === undefined) {
			vscode.window.showErrorMessage("No workspace is open");
			return;
		}

		let folder = vscode.workspace.workspaceFolders[0].uri.path ;

		const createdTerminal = vscode.window.createTerminal("Spotless", undefined, folder);

		// Create a shell integration
		vscode.window.onDidChangeTerminalShellIntegration(async ({ terminal, shellIntegration}) => {
			if (terminal === createdTerminal) {
				vscode.window.showInformationMessage("Please wait, formatting with spotless...");

				// Execute command
				const command = shellIntegration.executeCommand("./gradlew spotlessApply");
				vscode.window.onDidEndTerminalShellExecution(event => {
					if (event.execution === command) {
						// undefined is usually an error according to VS docs, but it's always a success normally?
						if (event.exitCode === undefined) {
							vscode.window.showInformationMessage("Formatting completed");
						} else {
							if (event.exitCode === 0) {
								vscode.window.showInformationMessage("Formatting completed");
							} else {
								vscode.window.showErrorMessage(`Formatting exited with status code ${event.exitCode}`);
							}
						}	
					}
				});

				setTimeout(() => {
					if (!createdTerminal.shellIntegration) {
						vscode.window.showErrorMessage("The terminal failed to launch a shell integration after 3s.");
					}
				}, 3000);
			}
		})
	});

	// Push the command
	context.subscriptions.push(disposable);
}


export function deactivate() {}
