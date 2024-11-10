import * as vscode from "vscode";
import { Prompt } from "./types";

export class PromptsProvider implements vscode.TreeDataProvider<Prompt> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    Prompt | undefined | null | void
  > = new vscode.EventEmitter<Prompt | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Prompt | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor(private storage: vscode.Memento) {}

  getPrompts(): Prompt[] {
    return this.storage.get("prompts", []);
  }

  private savePrompts(prompts: Prompt[]) {
    this.storage.update("prompts", prompts);
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(prompt: Prompt): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(prompt.title);
    treeItem.description = prompt.content;
    treeItem.contextValue = "prompt";
    treeItem.tooltip = prompt.content;
    treeItem.command = {
      command: "prompter-by-lakphy.copyPrompt",
      title: "复制 Prompt",
      arguments: [prompt],
    };
    return treeItem;
  }

  getChildren(): Prompt[] {
    return this.getPrompts();
  }

  addPrompt(title: string, content: string) {
    const prompts = this.getPrompts();
    prompts.push({
      id: Date.now().toString(),
      title,
      content,
    });
    this.savePrompts(prompts);
  }

  editPrompt(id: string, content: string) {
    const prompts = this.getPrompts();
    const index = prompts.findIndex((p) => p.id === id);
    if (index !== -1) {
      prompts[index].content = content;
      this.savePrompts(prompts);
    }
  }

  deletePrompt(id: string) {
    const prompts = this.getPrompts();
    const index = prompts.findIndex((p) => p.id === id);
    if (index !== -1) {
      prompts.splice(index, 1);
      this.savePrompts(prompts);
    }
  }

  async exportToClipboard() {
    const prompts = this.getPrompts();
    const exportData = JSON.stringify(prompts, null, 2);
    await vscode.env.clipboard.writeText(exportData);
    vscode.window.showInformationMessage("已成功导出 Prompts 到剪贴板");
  }

  async importFromClipboard() {
    try {
      const clipboardText = await vscode.env.clipboard.readText();
      const importedPrompts = JSON.parse(clipboardText) as Prompt[];

      if (
        !Array.isArray(importedPrompts) ||
        !importedPrompts.every(
          (p) =>
            typeof p.id === "string" &&
            typeof p.title === "string" &&
            typeof p.content === "string"
        )
      ) {
        throw new Error("无效的数据格式");
      }

      const existingPrompts = this.getPrompts();
      const mergedPrompts = [...existingPrompts, ...importedPrompts];

      this.savePrompts(mergedPrompts);
      vscode.window.showInformationMessage(
        `成功导入 ${importedPrompts.length} 个 Prompts`
      );
    } catch (error) {
      vscode.window.showErrorMessage("导入失败：剪贴板中的数据格式无效");
    }
  }
}
