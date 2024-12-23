// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Prompt, PromptDomain } from "./types";
import { PromptDomainProvider } from "./PromptDomainProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // 初始化 Prompt 域提供者
  const promptDomainProvider = new PromptDomainProvider(context.globalState);

  // 注册 TreeView
  const promptDomainTreeView = vscode.window.createTreeView(
    "PromptDomainList",
    {
      treeDataProvider: promptDomainProvider,
      showCollapseAll: true,
    }
  );

  // 注册添加 Prompt 域命令
  context.subscriptions.push(
    vscode.commands.registerCommand("prompter-by-lakphy.refresh", async () => {
      // 展示一个loading提示
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Refreshing prompts...",
          cancellable: false,
        },
        async () => {
          await promptDomainProvider.refresh();
          vscode.window.showInformationMessage("Prompts refreshed");
        }
      );
    })
  );
  // 注册打开 Prompt 域命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prompter-by-lakphy.openWorkspacePrompt",
      async (prompt: Prompt) => {
        // 在编辑器中打开 prompt.path 文件
        promptDomainProvider.openWorkspacePrompt(prompt.path);
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
          `Copied "${prompt.title}" content to clipboard`
        );
      }
    )
  );
  // 注册添加 prompt 命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prompter-by-lakphy.addPrompt",
      async (prompt: PromptDomain) => {
        const isGlobalFolder = (prompt as PromptDomain).id === "_GLOBAL"; // 是否为域内项
        if (isGlobalFolder) {
          await promptDomainProvider.userAddGlobalPrompt();
        } else {
          await promptDomainProvider.userAddWorkspacePrompt(prompt);
        }
      }
    )
  );
  // 注册删除 prompt 命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prompter-by-lakphy.deletePrompt",
      async (prompt: Prompt) => {
        const isWorkspaceItem = !!(prompt as Prompt).path; // 是否为工作群内项
        if (isWorkspaceItem) {
          promptDomainProvider.deleteWorkspacePrompt(prompt.path, prompt.title);
        } else {
          promptDomainProvider.deleteGlobalPrompt(prompt.id);
        }
      }
    )
  );
  // 注册编辑 prompt 命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prompter-by-lakphy.editPrompt",
      async (prompt: Prompt) => {
        promptDomainProvider.editGlobalPrompt(prompt);
      }
    )
  );
  // 注册创建 Prompt 域命令
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "prompter-by-lakphy.createPromptDomain",
      async () => {
        await promptDomainProvider.createWorkspacePromptFold();
      }
    )
  );

  context.subscriptions.push(promptDomainTreeView);
}

// This method is called when your extension is deactivated
export function deactivate() {}
