# Manage My Prompts

A Visual Studio Code extension for managing and copying your prompts efficiently.

## Features

- View and manage your prompts directly in VS Code's explorer
- Add, edit, and delete prompts with ease
- Copy individual prompts or all prompts at once
- Import and export prompts functionality
- Simple and intuitive interface

## Usage

1. Open VS Code
2. Look for the "Prompts" view in the Explorer sidebar
3. Use the ➕ button to add new prompts
4. Click the prompt item to copy
5. Other actions
   - Edit the prompt
   - Delete the prompt
   - Copy the prompt

## Commands

The extension provides the following commands:

- **New Prompt** (`prompter-by-lakphy.addPrompt`): Create a new prompt
- **Edit Prompt** (`prompter-by-lakphy.editPrompt`): Modify existing prompts
- **Delete Prompt** (`prompter-by-lakphy.deletePrompt`): Remove unwanted prompts
- **Copy Prompt** (`prompter-by-lakphy.copyPrompt`): Copy a single prompt to clipboard
- **Copy All Prompts** (`prompter-by-lakphy.copyAllPrompts`): Copy all prompts to clipboard
- **Export Prompts** (`prompter-by-lakphy.exportPrompts`): Export all prompts to clipboard
- **Import Prompts** (`prompter-by-lakphy.importPrompts`): Import prompts from clipboard
- **Drag to Editor** (`prompter-by-lakphy.dragToEditor`): Drag the prompter board tree view to the editor view

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Prompter by lakphy"
4. Click Install

## Requirements

- VS Code version 1.86.0 or higher

## Contributing

Feel free to submit issues and enhancement requests on our GitHub repository.

## License

This extension is licensed under the [MIT License](LICENSE).

## Change Log

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

## Drag-and-Drop Feature

### How to Use

1. Open VS Code
2. Look for the "Prompts" view in the Explorer sidebar
3. Drag the "Prompter Board" tree view item to the editor view
4. The selected prompt will be displayed in a new webview panel in the editor view
