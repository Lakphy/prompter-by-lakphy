import * as vscode from "vscode";
import { Prompt, PromptDomain } from "./types";
import { parse } from "yaml";

export class PromptDomainProvider
  implements vscode.TreeDataProvider<PromptDomain | Prompt>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    PromptDomain | undefined | null | void
  > = new vscode.EventEmitter<PromptDomain | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    PromptDomain | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(private storage: vscode.Memento) {
    // 监听文件保存事件
    vscode.workspace.onDidSaveTextDocument(this.onDocumentSaved, this);
  }

  /**
   * 获取树形项内容
   */
  getTreeItem(prompt: PromptDomain | Prompt): vscode.TreeItem {
    const isDomain = !!(prompt as PromptDomain).children; // 是否为域
    const isDomainItem = !!(prompt as Prompt).path; // 是否为域内项
    const treeItem = new vscode.TreeItem(prompt.title);
    if (isDomain) {
      treeItem.iconPath = new vscode.ThemeIcon("folder");
      if (prompt.id === "_GLOBAL") {
        treeItem.contextValue = "domain_global";
        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
      } else {
        treeItem.contextValue = "domain_workspace";
        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        treeItem.tooltip = (prompt as PromptDomain).path;
      }
    } else {
      if (!isDomainItem) {
        treeItem.contextValue = "domain_global_item";
      } else {
        treeItem.contextValue = "domain_workspace_item";
      }
      treeItem.iconPath = new vscode.ThemeIcon("symbol-variable");
      treeItem.description = (prompt as Prompt).content;
      treeItem.tooltip = (prompt as Prompt).content;
    }
    return treeItem;
  }

  /**
   * 获取所有 Prompt 域树形结构，包括全局和当前工作区的 Prompt，用于展示在树形结构中
   * @returns
   */
  async getChildren(
    element?: PromptDomain
  ): Promise<(PromptDomain | Prompt)[]> {
    if (!element)
      return [
        ...this.getGlobalPrompts(),
        ...(await this.getWorkspacePrompts()),
      ];
    return element.children;
  }

  /**
   * 获取全局 Prompt 域
   * @returns
   */
  getGlobalPrompts(): PromptDomain[] {
    return [
      {
        id: "_GLOBAL",
        title: "GLOBAL",
        path: "_global",
        children: [...this.getPromptsFromVSCodeStorage()],
      },
    ];
  }

  /**
   * 从 VSCode 的存储中获取 Prompt
   * @returns
   */
  getPromptsFromVSCodeStorage(): Prompt[] {
    return this.storage.get("prompts", []);
  }

  /**
   * 找到所有 .prompts/ 文件夹位置及其父级目录名称
   * @returns Promise<{path: string, parentName: string}[]>
   */
  private async getWorkspacePrompts(): Promise<PromptDomain[]> {
    if (!vscode.workspace.workspaceFolders) {
      return [];
    }
    const results: PromptDomain[] = [];

    for (const workspaceFolder of vscode.workspace.workspaceFolders) {
      const pattern = new vscode.RelativePattern(
        workspaceFolder,
        "**/.prompts/*.md"
      );
      const files = await vscode.workspace.findFiles(pattern, null);
      const domainHash = new Map<string, PromptDomain>();
      for (const file of files) {
        // 解析文件归属
        const pathParts = file.fsPath.split(/[/\\]/);
        const scopeName = pathParts[pathParts.length - 3];
        const scopePath = pathParts.slice(0, pathParts.length - 2).join("/");

        // 拿到文件内容
        const fileContent = await vscode.workspace.fs
          .readFile(file)
          .then((content) => content.toString());

        // 解析 markdown 元信息
        const yamlMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
        let title = "";
        let pureContent = "";
        if (yamlMatch) {
          const yamlContent = yamlMatch[1];
          try {
            const parsed = parse(yamlContent);
            if (typeof parsed === "object" && parsed && "name" in parsed) {
              title = `${parsed.name}` as string;
              pureContent = fileContent.slice(yamlMatch[0].length).trim();
            } else {
              continue;
            }
          } catch (e) {
            console.error("解析 yaml 失败:", e);
            continue;
          }
        } else {
          pureContent = fileContent;
        }

        // 存储
        let domain = domainHash.get(scopeName);
        if (!domain) {
          domain = {
            id: scopeName,
            title: scopeName,
            path: scopePath,
            children: [
              {
                id: `${scopeName}-${title}`,
                title,
                content: pureContent,
                path: file.fsPath,
              },
            ],
          };
        } else {
          domain.children.push({
            id: `${scopeName}-${title}`,
            title,
            content: pureContent,
            path: file.fsPath,
          });
        }
        domainHash.set(scopeName, domain);
      }
      results.push(...domainHash.values());
    }

    return results;
  }

  /**
   * 文件保存时触发更新 TreeView
   * @param document
   */
  private onDocumentSaved(document: vscode.TextDocument) {
    if (document.uri.fsPath.endsWith(".md")) {
      this._onDidChangeTreeData.fire();
    }
  }

  /**
   * 刷新 TreeView
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}
