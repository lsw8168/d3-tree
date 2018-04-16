var margin = {
        top: 20,
        right: 50,
        bottom: 30,
        left: 50
    },
    clientWidth = document.getElementById("tree-container").clientWidth,
    clientHeight = document.getElementById("tree-container").clientHeight,
    width = 1280 - margin.left - margin.right,
    height = 200,
    rectWidth = 180;

var i = 0,
    duration = 750,
    root;

var svg = d3.select("#tree-container")
    .append("svg")
    .attr("width", clientWidth)
    .attr("height", clientHeight);

var zoom = d3.zoom()
    .scaleExtent([0.25, 2])
    .on("zoom", zoomed);

var zoomer = svg.append("rect")
    .attr("width", clientWidth)
    .attr("height", clientHeight)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(zoom);

var g = svg.append("g")
    .attr("class","root");
    // .attr("transform", "translate(0,0)");

function zoomed() {
    g.attr("transform", d3.event.transform);
}



var treemap = d3.tree().size([height, width]);

// 글자 자르는 function
function wrap() {
    var self = d3.select(this),
        textLength = self.node().getComputedTextLength(),
        text = self.text();
    while (textLength > (rectWidth - 10) && text.length > 0) {
        text = text.slice(0, -1);
        self.text(text + '...');
        textLength = self.node().getComputedTextLength();
    }
}

function click(d) {
    alert(d.data.url);
    console.log(d.data.url);
}

d3.json("treeData.json", function(error, treeData) {
    if (error)
        throw error;

    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function(d) {
        return d.children;
    });
    root.x0 = height / 2;
    root.y0 = 0;

    update(root);

    function update(source) {
        var treeData = treemap(root);

        // Compute the new tree layout.
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        var widthValue = width - rectWidth;

        // Normalize for fixed-depth.

        var length = nodes.map (function (obj){
            if (obj.children) {
                return obj.children.length
            }
        });

        var maxLength = length.sort(function(a, b){ return b-a; })[0];
        newHeight = 100 * maxLength;

        treemap = d3.tree().size([newHeight, widthValue]);
        treeData = treemap(root);

        var initScale = clientHeight / newHeight;
        console.log("initScale : " +  initScale);
        console.log("width : " +  width);

        var ddd = (width - (width * initScale)) / 2;
        console.log(width*initScale);

        if (initScale > 1) {
            zoomer.call(zoom.transform, d3.zoomIdentity.translate(margin.left, 0).scale(1));
        } else {
            zoomer.call(zoom.transform, d3.zoomIdentity.translate(ddd, 0).scale(initScale));
        }

        // Update the nodes…
        var node = g.selectAll("g.node").data(nodes, function(d) {
            return d.id || (d.id = ++i);
        });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        });

        // Add Rect for the nodes
        nodeEnter.append("rect")
            .attr("class", function(d) {
                return d.data.level === 2 ? "danger" : "normal";
            })
            .attr("width", rectWidth)
            .attr("height", 25)
            .attr("x", 0)
            .attr("y", -25 / 2)
            .filter(function(d) {
                if(!d.data.name) {
                    return d3.select(this).remove();
                }
            });

        // Add labels for the nodes
        nodeEnter.append("text")
            .attr("dy", 5)
            .attr("dx", 5)
            .text(function(d) {
                if(!d.data.name) {
                    return d3.select(this).remove();
                } else {
                    return d.data.name;
                }
            })
            .each(wrap)
            .filter(function(d) {
                return d.data.type == 'file' && d.data.file !== undefined;
            })
            .attr("class", "ip_link")
            .on("click", function(d){
                return click(d);
            });

        nodeEnter.append("rect")
            .attr("width", rectWidth)
            .attr("height", 25)
            .attr("x", 0)
            .attr("y", -25 / 2 + 24)
            .filter(function(d) {
                if (d.data.type == 'file') {
                    return d.data.file !== undefined ? d.data.file : d3.select(this).remove();
                } else if (d.data.type !== 'file' && !d.data.ip) {
                    return d3.select(this).remove();
                }
            });

        nodeEnter.append("text")
            .attr("class", "ip")
            .attr("dy", 29)
            .attr("dx", 5)
            .text(function(d) {
                if (d.data.type !== 'file') {
                    return d.data.ip;
                } else {
                    return d.data.file !== undefined ? d.data.file.sample_risk_level == 2 ? "악성" : "정상" : undefined;
                }
            })
            .filter(function(d) {
                if (d.data.type !== 'file') {
                    return d.data.url !== '' ? d.data.url : '';
                }
            })
            .attr("class", "ip_link")
            .on("click", function(d){
                if(!d.data.url) {
                    return d.data.ip;
                } else {
                    return click(d);
                }
            });

        nodeEnter.append("rect")
            .attr("width", rectWidth)
            .attr("height", 25)
            .attr("x", 0)
            .attr("y", -25 / 2 + 48)
            .filter(function(d) {
                if (d.data.type == 'file') {
                    return d.data.file !== undefined ? d.data.file : d3.select(this).remove();
                } else if (d.data.type !== 'file' && !d.data.tag) {
                    return d3.select(this).remove();
                }
            });


        nodeEnter.append("text")
            .attr("dy", 53)
            .attr("dx", 5)
            .text(function(d) {
                if (d.data.type !== 'file') {
                    return d.data.tag;
                } else {
                    return d.data.file !== undefined ? d.data.file.sample_tag : undefined;
                }
            })
            .each(wrap);

        // Transition nodes to their new position.
        var nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition().duration(duration).attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition().duration(duration).attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        }).remove();

        // Update the links...
        var link = g.selectAll('path.link').data(links, function(d) {
            return d.id;
        });

        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert("path", "g").attr("class", "link").attr("d", function(d) {
            var o = {
                x: source.x0,
                y: source.y0
            };
            return diagonal(o, o);
        }).attr("class", function(d) {
            if (d.data.type !== "file") {
                return d.data.warning === true ? "warning" : "";
            } else {
                return d.data.warning === true ? "file" : "";
            }
        });

        // UPDATE
        var linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition().duration(duration).attr('d', function(d) {
            return diagonal(d, d.parent);
        });


        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {
            path = null;
            if (d) {
                path = `M ${s.y} ${s.x}
                    C ${ (s.y + (d.y + rectWidth)) / 2} ${s.x},
                      ${ (s.y + (d.y + rectWidth)) / 2} ${d.x},
                      ${(d.y + rectWidth)} ${d.x}`
            }
            return path
        }
    }



});
