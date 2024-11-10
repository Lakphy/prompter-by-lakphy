// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { PromptsProvider } from "./PromptsProvider";
import { Prompt } from "./types";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // 初始化 prompts 存储
  const promptsProvider = new PromptsProvider(context.globalState);

  // 注册 TreeView
  const treeView = vscode.window.createTreeView("promptsList", {
    treeDataProvider: promptsProvider,
  });

  // 注册添加 prompt 命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prompter-by-lakphy.addPrompt",
      async () => {
        const title = await vscode.window.showInputBox({
          placeHolder: "输入 Prompt 标题",
          prompt: "请输入 Prompt 的标题",
        });

        if (title) {
          const content = await vscode.window.showInputBox({
            placeHolder: "输入 Prompt 内容",
            prompt: "请输入 Prompt 的内容",
          });

          if (content) {
            promptsProvider.addPrompt(title, content);
          }
        }
      }
    )
  );

  // 注册编辑 prompt 命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prompter-by-lakphy.editPrompt",
      async (prompt: Prompt) => {
        const content = await vscode.window.showInputBox({
          value: prompt.content,
          placeHolder: "编辑 Prompt 内容",
          prompt: "请编辑 Prompt 的内容",
        });

        if (content !== undefined) {
          promptsProvider.editPrompt(prompt.id, content);
        }
      }
    )
  );

  // 注册删除 prompt 命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prompter-by-lakphy.deletePrompt",
      async (prompt: Prompt) => {
        const confirm = await vscode.window.showWarningMessage(
          `确定要删除 "${prompt.title}" 吗？`,
          { modal: true },
          "确定"
        );

        if (confirm === "确定") {
          promptsProvider.deletePrompt(prompt.id);
        }
      }
    )
  );

  // 注册复制 prompt 命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prompter-by-lakphy.copyPrompt",
      (prompt: Prompt) => {
        vscode.env.clipboard.writeText(prompt.content);
        vscode.window.showInformationMessage(
          `已复制 "${prompt.title}" 的内容到剪贴板`
        );
      }
    )
  );

  // 注册复制所有 prompts 命令
  context.subscriptions.push(
    vscode.commands.registerCommand("prompter-by-lakphy.copyAllPrompts", () => {
      const prompts = promptsProvider.getPrompts();
      const promptsText = prompts
        .map((prompt) => `${prompt.title}:\n${prompt.content}\n`)
        .join("\n---\n\n");
      vscode.env.clipboard.writeText(promptsText);
      vscode.window.showInformationMessage("已复制所有 Prompts 到剪贴板");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("prompter-by-lakphy.exportPrompts", () => {
      promptsProvider.exportToClipboard();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("prompter-by-lakphy.importPrompts", () => {
      promptsProvider.importFromClipboard();
    })
  );

  context.subscriptions.push(treeView);
}

// This method is called when your extension is deactivated
export function deactivate() {}
