if (typeof (Sitecore) != "undefined" || Sitecore.Treeview) {
    Sitecore.Treeview.getDataContext = function (node) {
        var startIdx = node.id.indexOf("_");
        var endIdx = node.id.lastIndexOf("_");
        if (endIdx <= startIdx) {
            return null;
        }

        var dataContextId = node.id.substring(startIdx + 1, endIdx);
        var dataContextLowered;
        if (dataContextId) {
            dataContextLowered = dataContextId.toLowerCase();
        }

        var datacontexts = $$(".scDataContexts").first();
        if (!datacontexts) {
            return null;
        }

        var r = datacontexts.childElements().find(function (e) {
            var id = e.readAttribute("data-context-id");
            return id && id.toLowerCase() === dataContextLowered;
        });

        if (!r) {
            return null;
        }

        return {
            id: dataContextId,
            parameters: r.value || ""
        };
    };

    Sitecore.Treeview.getCommands = function (node, treeElement, id) {
        $$(".treeNodeCommnds").each(function (e) {
            e.remove();
        });
        new Ajax.Request("/sxa/selectdatasource/commands/" + encodeURIComponent(id), {
            method: "get",
            onSuccess: function (transport) {
                var commands = transport.responseJSON;
                var wrapper = new Element("span", {
                    class: "treeNodeCommnds"
                });
                for (var index = 0; index < commands.length; index++) {
                    wrapper.insert(commands[index]);
                }
                node.select(">a").first().insert({
                    after: wrapper
                });
            },
            onException: function (request, ex) {
                console.log("Exception occured during the request execution.", ex)
            },
            onFailure: function (request) {
                console.log("Request failed.")
            }
        });
    }

    Sitecore.Treeview.onTreeNodeClickMultiRoot = Sitecore.Treeview.onTreeNodeClick;
    Sitecore.Treeview.onTreeNodeClick = function (node, treeElement, evt, id, click) {
        var commands = this.getCommands(node, treeElement, id);
        this.onTreeNodeClickMultiRoot(node, treeElement, evt, id, click);
    };

    var interval = 50;
    function waitForActiveNodeAndClick() {
        var activeTreeNode = document.querySelector(".scContentTreeNodeActive")
        if (activeTreeNode) {
            activeTreeNode.click()
        } else {
            setTimeout(function () {
                waitForActiveNodeAndClick();
            }, interval);
        }
    }
    waitForActiveNodeAndClick();
}