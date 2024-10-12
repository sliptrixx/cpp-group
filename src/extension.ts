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
			const isSourceFile : boolean = filename.endsWith( ".cpp" ) || filename.endsWith( ".c" );
			const isHeaderFile : boolean = filename.endsWith( ".h" );
			if( isSourceFile || isHeaderFile ) {
				const pairFilenames : string[] = getPairFilenames( filename );
				const pairTab : vscode.Tab | undefined = openedTab.group.tabs.find( ( value: vscode.Tab ) => {
					if( !(value.input instanceof vscode.TabInputText ) ) { return false; }
					const valInput = value.input as vscode.TabInputText;
					// loop through and check and if any of the potential pair filenames are open at the moment
					for( let i = 0; i < pairFilenames.length; i++ ) {
						const pairFilename : string = pairFilenames[ i ];
						if( valInput.uri.fsPath === pairFilename ) {
							return true;
						}
					}
					return false;
				} );

				if( pairTab !== undefined ) {
					const currTabGroup : vscode.TabGroup = openedTab.group;
					const pairTabIdx : number = currTabGroup.tabs.indexOf( pairTab );
					const newIdx : number = pairTabIdx + ( isSourceFile ? 1 : 2 );	// current schema places .cpp file to the left and the .h file to the right
					vscode.commands.executeCommand('moveActiveEditor', { to: 'position', by: 'tab', value: newIdx } );
				}
			}
		});
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Get the appropriate pair .cpp or .h file for a given .h or .cpp file
function getPairFilenames( filename : string ) : string[]  {

	// get header file if the given file is a .cpp file
	if( filename.endsWith( ".cpp" ) ) {
		return [ filename.replace( ".cpp", ".h" ) ];
	}

	// get header file if the given file is a .c file
	if( filename.endsWith( ".c" ) ) {
		return [ filename.replace( ".c", ".h" ) ];
	}

	// get the .cpp file if the given file is a .h file
	if( filename.endsWith( ".h" ) ) {
		return [ filename.replace( ".h", ".cpp" ), filename.replace( ".h", ".c" ) ];
	}

	throw `getPairFilename( ${ filename } ): Given file is neither a header nor a cpp file`;
}