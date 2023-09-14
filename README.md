 # MindMap v1.0.0

This is a project to convert language in a tree node, where each node is a concept which is own weight and data.
They are united through tags, and connections, and the result is an inmense amount of data from text. This data provides the possibility of creating mind maps, creating tests, predicting  your input, fueling AI ...

Its a meaningful mapping of the language, your language, taking into account the context. While you study, you will be generating a tremendous amount of data, and that data will help you study more creating even more data.

This app has several parts, with a outer structure somewhat similar to Obsidian. Here are the main .Vue components that build this app. We will explain the current features and possible future additions.

## Vault System

### Current

![VaultWin](./assets/VaultWin.png)

Here you decide to create a new "vault" (folder with all your .json and .md)

![CreateVault](./assets/CreateVault.png)Open a folder as "vault"
![OpenFolder](./assets/OpenFolder.png)

Or simply open a previously opened vault

![OpenVault](./assets/OpenVault.png)

### Future

This in the future will be synced maybe with Google or GitHub, providing the possibility of
sharing your DataBase more easily.

## TitleBar

### Current

Here is a custom TitleBar with our design, where you have the default buttons aswell as a container for tabs.

![TitleBar](./assets/TitleBar.png)

You create new tabs (files) and close them.

![OpenTab](./assets/OpenTab.png)
![CloseTab](./assets/CloseTab.png)

You can also toggle the sidebars for a more clean view.

![ToggleSidebars](./assets/ToggleSidebars.png)

### Future

In the future more buttons and features will be added, such as bookmarks, search queries along with some utility functions.

## QueryBar

### Current

It has 2 parts, a part where you have a list of all the objects in the Vault, 

![Objectslist](./assets/Objectslist.png)

and a quick preview of the currently selected Object, where you can do small edits.

![QueryPreview](./assets/QueryPreview.png)

## Sidebar

### Current

This is the left sidebar containing menu items, and a treeview.

![Sidebar](./assets/Sidebar.png)

The menu items are basic buttons such as settings, or exiting current vault.

![MenuItems](./assets/MenuItems.png)

The treeview provides folder structure of the current opened vault. 

![TreeView](./assets/TreeView.png)

It has a couple buttons for adding folders and files.

![TreeViewMenu](./assets/TreeViewMenu.png)

You can rename and move them as you please

![FileManagement](./assets/FileManagement.png) 

### Future

More menu items will be added for plugins such as tasks plugins, productivity plugins or programming plugins.

## QueryView

### Current

Here is one of the most important parts. In the QueryView you view all the data regarding to the Object whose file is currently being focused. It displays all its relations, instance if it has and everything.

There are 3 types of objects, so there will be 3 types of QueryViews

#### Word

You can see the tags it belongs too

You can see its instances

You can see its relations with other words/tags through a relation


#### Relation

You can see the tags it belongs too

You can see its instances

You can see the connections it creates

You can convert a relation into a function. It will take several inputs, and you will create local relations within the function that will produce some output, some logs.


#### Set (Tag)

You can see the words it contains

You can see the relations it contains


## TextEditor

### Current

Very important part too, and probably the most complex one in terms of coding. This is a Markdown text renderer where it displays the MD rendered as you write.

![MDwysiwyg](./assets/MDwysiwyg.png)

You can also write with our custom syntax Relations and Words, which will be rendered into inline objects.

![InlineObjects](./assets/InlineObjects.png)

You can click them to select them and view their quick data. It automatically saves so no worries with it deleting suddenly.

### Future

Thanks to its "lines" features, which act as blocks of text we will add new types of blocks, not just text blocks. We will have image blocks, code blocks, tables, embeded websites, graphs ...
The posibilities are really endless


## Other general future additions

In the future you will be able to work in group, in sync. Utility command keys will be added for those who seek optimization and speed. Different design themes will be added for a more pleasing experience. Different APIs will be integrated, so you can work with ChatGPT, or even Telegram Bots. Most of these new features will come in the form of plugins, that will appear in the menu items bar.




