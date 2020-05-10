var compz = [],
    selcomps = ':\n';

main();

function main(){
    app.beginUndoGroup('selectProp');
    /*
    if (app.project.selection[0]){
        //get selected comp(s)
        for (var c = 0; c<app.project.selection.length; c++){
            selcomps += app.project.selection[c].name;
            if (c < app.project.selection.length -1){
                selcomps += ',\n';
            }
        }
        if (confirm('selected ' + app.project.selection.length + ' comp(s)' + selcomps)){
            startPrompt();
            for (var ic = 0; ic<app.project.selection.length; ic++){
                compz.push(app.project.selection[ic]);
                selectProp(compz[ic]);
            }
        }
    }else{
    */
        if (app.project.activeItem == null){
            alert('please select comp(s) and try again');
            return;
        }else if (app.project.activeItem){
            //get active comp
            compz.push(app.project.activeItem);
            if (confirm('selected comp: ' + compz[0].name)){
                //startPrompt();
                selectProp(compz[0]);
            }
        }
    //}
    app.endUndoGroup();
}

function startPrompt(){
    prop = prompt('select property', label, 'property (e.g. "opacity", cancel to copy select first selected property)');
}

function selectProp(comp){
    var prop = comp.selectedLayers[0].selectedProperties;
    for (var i = 1; i < comp.selectedLayers.length; i++) {
        comp.selectedLayers[i],selectedProperties = [];
        for (var n = 0; n < prop.length; n++){
            writeLn(prop[n]);
            comp.selectedLayers[i],selectedProperties.append(prop[n]);
        }
    }
}


function setExpression(comp){
    for (layerID = 0; layerID < comp.selectedLayers.length; layerID++){
        selProps = comp.selectedLayers[layerID].selectedProperties;
        for (propID = 0; propID < selProps.length; propID++){
            if (selProps[propID].canSetExpression) {
                selProps[propID].expression = expression;
                selProps[propID].expressionEnabled = true;   
            }
        }
    }
}