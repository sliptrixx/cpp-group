// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	vscode.window.tabGroups.onDidChangeTabs( ( e: vscode.TabChangeEvent ) => {
		e.opened.forEach( openedTab => {
			if( !( openedTab.input instanceof vscode.TabInputText ) ) {
				return;
			}
			const openedTabInput = openedTab.input as vscode.TabInputText;
			const filename = openedTabInput.uri.fsPath;
			const isCppFile : boolean = filename.endsWith( ".cpp" );
			const isHeaderFile : boolean = filename.endsWith( ".h" );
			if( isCppFile || isHeaderFile ) {
				const pairFilename : string = getPairFilename( filename );
				const pairTab : vscode.Tab | undefined = openedTab.group.tabs.find( ( value: vscode.Tab ) => {
					if( !(value.input instanceof vscode.TabInputText ) ) { return false; }
					const valInput = value.input as vscode.TabInputText;
					return valInput.uri.fsPath === pairFilename;
				} );

				if( pairTab !== undefined ) {
					const currTabGroup : vscode.TabGroup = openedTab.group;
					const pairTabIdx : number = currTabGroup.tabs.indexOf( pairTab );
					const newIdx : number = pairTabIdx + ( isCppFile ? 1 : 2 );	// current schema places .cpp file to the left and the .h file to the right
					vscode.commands.executeCommand('moveActiveEditor', { to: 'position', by: 'tab', value: newIdx } );
				}
			}
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Get the appropriate pair .cpp or .h file for a given .h or .cpp file
function getPairFilename( filename : string ) : string  {

	// get header file for if the given file is a .cpp file
	if( filename.endsWith( ".cpp" ) ) {
		return filename.replace( ".cpp", ".h" );
	}

	// get the .cpp file if the given file is a .h file
	if( filename.endsWith( ".h" ) ) {
		return filename.replace( ".h", ".cpp" );
	}

	throw `getPairFilename( ${ filename } ): Given file is neither a header nor a cpp file`;
}