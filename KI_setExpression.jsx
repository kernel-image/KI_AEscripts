var compz = [],
    expression = '',
    selcomps = ':\n';

main();

function main(){
    app.beginUndoGroup('setExpression');
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
                setExpression(compz[ic]);
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
                startPrompt();
                setExpression(compz[0]);
            }
        }
    //}
    app.endUndoGroup();
}

function startPrompt(){
    expression = prompt('set expression', expression, 'expression');
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