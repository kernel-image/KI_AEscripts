var compz = [],
    selcomps = ':\n';

main();

function main(){
    app.beginUndoGroup('maxDuration');
    
    if (app.project.selection[0]){
        //get selected comp(s)
        for (var c = 0; c<app.project.selection.length; c++){
            selcomps += app.project.selection[c].name;
            if (c < app.project.selection.length -1){
                selcomps += ',\n';
            }
        }
        if (confirm('selected ' + app.project.selection.length + ' comp(s)' + selcomps)){
            //startPrompt();
            for (var ic = 0; ic<app.project.selection.length; ic++){
                compz.push(app.project.selection[ic]);
                maxDuration(compz[ic]);
            }
        }
    }else{
    
        if (app.project.activeItem == null){
            alert('please select comp(s) and try again');
            return;
        }else if (app.project.activeItem){
            //get active comp
            compz.push(app.project.activeItem);
            if (confirm('selected comp: ' + compz[0].name)){
                //startPrompt();
                maxDuration(compz[0]);
            }
        }
    }
    app.endUndoGroup();
}

function maxDuration(comp){
    writeLn(comp.duration);
    for (layerID = 1; layerID < comp.layers.length+1; layerID++){
        writeLn(comp.layers[layerID].outPoint);
        comp.layers[layerID].outPoint = comp.duration;
    }
}