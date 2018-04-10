// set the dimensions and margins of the diagram
var margin = {
        top: 20,
        right: 180,
        bottom: 20,
        left: 20
    };

var clientWidth = document.getElementById("tree-container").clientWidth;
var clientHeight = document.getElementById("tree-container").clientHeight;
var width = clientWidth - margin.left - margin.right;
var height = clientHeight - margin.top - margin.bottom;
var rectWidth = 150;
var rectHeight = 24;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

// load the external data
d3.json("treeData.json", function(error, treeData) {
    if (error)
        throw error;

    //  assigns the data to a hierarchy using parent-child relationships
    var nodes = d3.hierarchy(treeData, function(d) {
        return d.children;
    });

    // maps the node data to the tree layout
    nodes = treemap(nodes);

    function zoomed() {
        g.attr("transform", d3.event.transform); //The zoom and panning is affecting my G element which is a child of SVG
    }

    var zoom = d3.zoom()
        .scaleExtent([0.3,2])
        .on("zoom", zoomed);

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#tree-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var zoomer = svg.append("rect")
        .attr("width", clientWidth)
        .attr("height", clientHeight)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);

    var g = svg.append("g")
        .attr("class","root")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



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

    function ct2(d) {
        console.log(nodes);
    }

    // adds each node as a group
    var node = g.selectAll(".node").data(nodes.descendants()).enter().append("g").attr("class", function(d) {
        return "node" + ( d.children ? " node--internal" : " node--leaf");
    }).attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
    });
    // adds the circle to the node
    node.append("rect")
        .attr("class", function(d) {
            return d.data.level === 2 ? "danger" : "normal";
        })
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("x", 0)
        .attr("y", -rectHeight / 2)
        .text(function(d) {
            if(!d.data.name) {
                return d3.select(this).remove();
            } else {
                return d.data.name;
            }
        });


    node.append("text")
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
        .on("click", function(d){
            return ct2(d);
        });

    node.append("rect")
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("x", 0)
        .attr("y", -rectHeight / 2 + 24)
        .text(function(d) {
            if(!d.data.ip) {
                return d3.select(this).remove();
            } else {
                return d.data.ip;
            }
        });

    node.append("text")
        .attr("class", "ip")
        .attr("dy", 29)
        .attr("dx", 5)
        .text(function(d) {
            if(!d.data.ip) {
                return d3.select(this).remove();
            } else {
                return d.data.ip;
            }
        })
        .filter(function(d) {
            return d.data.url !== '' ? d.data.url : '';
        })
        .attr("class", "ip_link")
        .on("click", function(d){
            if(!d.data.url) {
                return d.data.ip;
            } else {
                return click(d);
            }
        });

    node.append("rect")
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("x", 0)
        .attr("y", -rectHeight / 2 + 48)
        .text(function(d) {
            if(!d.data.tag) {
                return d3.select(this).remove();
            } else {
                return d.data.tag;
            }
        });

    node.append("text")
        .attr("dy", 53)
        .attr("dx", 5)
        .text(function(d) {
            if(!d.data.tag) {
                return d3.select(this).remove();
            } else {
                return d.data.tag;
            }
        });


    // adds the links between the nodes
    var link = g.selectAll(".link").data(nodes.descendants().slice(1))
        .enter()
        .append("path")
        .attr("class", function(d) {
            return d.data.warning === true ? "link warning" : "link"
        })
        .attr("d", function(d) {
            return "M" + d.y + "," + d.x + "C" + (
                d.y + (d.parent.y + rectWidth)) / 2 + "," + d.x + " " + (
                    d.y + (d.parent.y + rectWidth)) / 2 + "," + d.parent.x + " " + (d.parent.y + rectWidth) + "," + d.parent.x; //150은 rect width
                });

    var element = d3.select('.root').node();
    console.log(element.getBoundingClientRect());
});
