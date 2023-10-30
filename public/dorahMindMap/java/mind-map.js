var total_temas = 0;

function define_diagram() {
    const $ = go.GraphObject.make;

    diagram =
        new go.Diagram("mind-map",
            {
                allowCopy: false,
                allowDelete: true,
                maxSelectionCount: 1,
                "undoManager.isEnabled": true,
                "commandHandler.deletesTree": true,
                "draggingTool.dragsTree": true,

                layout:
                    $(go.TreeLayout,
                        { angle: 90, nodeSpacing: 15, layerSpacing: 60, layerStyle: go.TreeLayout.LayerUniform })
            });

    diagram.nodeTemplate =
        $(go.Node, "Auto",
            $(go.Shape, "RoundedRectangle", {
                stroke: "#757575",
                strokeWidth: 3,
                fill: "white"
            }),
            $(go.TextBlock, { margin: 10, font: "18px sans-serif" },
                new go.Binding("text"))
        );

    diagram.nodeTemplate.selectionAdornmentTemplate =
        $(go.Adornment, "Spot",
            $(go.Panel, "Auto",
                $(go.Shape, "RoundedRectangle", { fill: null, stroke: "black", strokeWidth: 3 }),
                $(go.Placeholder, { margin: 5 })
            ),
            $(go.Panel, "Auto", {
                alignment: go.Spot.Bottom,
                alignmentFocus: go.Spot.Top
            },
                $(go.Shape, "RoundedRectangle",
                    {
                        fill: "white", stroke: "black", strokeWidth: 3
                    }),
                $(go.TextBlock, { font: "bold 15px sans-serif", stroke: "#757575", margin: 10 },
                    new go.Binding("text", "summary")),
            ),
            $("Button",
                {
                    alignment: go.Spot.Right,
                    "ButtonBorder.figure": "Circle",
                    "ButtonBorder.fill": "white",
                    "ButtonBorder.stroke": "black",
                    "ButtonBorder.strokeWidth": 3,

                    click: addNodeAndLink
                },
                $(go.TextBlock, "+",
                    { font: "bold 15px sans-serif", stroke: "#757575" }),
            )
        );

    diagram.linkTemplate =
        $(go.Link,
            { routing: go.Link.Orthogonal, corner: 5, selectable: false },
            $(go.Shape,
                { strokeWidth: 3, stroke: "#757575" })
        );

    function addNodeAndLink(e, obj) {
        var adorn = obj.part;

        diagram.startTransaction("Add Node");
        var oldnode = adorn.adornedPart;

        var newdata = { key: total_temas + 1, text: `Novo Subtema ${total_temas}`, summary: `Resumo do subtema ${total_temas}` };
        diagram.model.addNodeData(newdata);
        diagram.model.addLinkData({ from: oldnode.key, to: newdata.key })

        total_temas++;

        diagram.commitTransaction("Add Node");

        var newnode = diagram.findNodeForData(newdata);
        if (newnode !== null) diagram.scrollToRect(newnode.actualBounds);
    }
}

function draw_map(tema, topicos) {
    total_temas = topicos.length + 1;

    define_diagram();

    summary_placeholder = 'Clique em + para adicionar um resumo!'

    var nodeDataArray = [{key: 0, text: tema, summary: summary_placeholder}];

    for (let i = 0; i < topicos.length; i++) {
        if(topicos[i] != tema)
        {
            nodeDataArray.push({ key: i + 1, text: topicos[i], summary: summary_placeholder });
        }
    }

    var linkDataArray = [];
    for (let i = 1; i <= topicos.length + 1; i++) {
        linkDataArray.push({ to: i, from: 0 });
    }

    diagram.model = new go.GraphLinksModel(nodeDataArray, linkDataArray);

    //Setup map controls
    document.getElementById('fitDiagram').addEventListener('click', () => {
        diagram.scale = 1;
        diagram.commandHandler.zoomToFit();
        diagram.commandHandler.scrollToPart(diagram.findNodeForKey(0));

        document.getElementById('zoom').value = 1;
    });

    document.getElementById('zoom').addEventListener('input', (event) => {
        diagram.scale = event.target.value;
    })
    // document.getElementById('bottom-to-json').addEventListener('click', () => {
        document.getElementById('menu-download').addEventListener('click', () => {
            var endModel = diagram.model.toJson(); //Converte o mapa mental em um json
    
            var blob = new Blob([endModel], { type: 'application/json' });
            var temporaryA = document.createElement('a');
            temporaryA.href = URL.createObjectURL(blob);
            temporaryA.target = '_blank';
            temporaryA.download = 'mapa_mental.json';
            temporaryA.click();
    
            alert("Confira se inicia o download");
        });
    }
    
      function printDiagram() {
        var svgWindow = window.open();
        if (!svgWindow) return;  // failure to open a new Window
        var bnds = diagram.documentBounds;
        var x = bnds.x;
        var y = bnds.y;
        var printSize = new go.Size(bnds.right + 1, 530);
        while (y < bnds.bottom) {
          while (x < bnds.right) {
            var svg = diagram.makeSvg({ scale: diagram.scale, position: new go.Point(x, y), size: printSize });
            svgWindow.document.body.appendChild(svg);
            x += printSize.width;
          }
          x = bnds.x;
          y += printSize.height;
        }
        setTimeout(() => svgWindow.print(), 1);
      }