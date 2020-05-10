var compz = [],
    label = 0,
    selcomps = ':\n';

main();

function main(){
    app.beginUndoGroup('seletLabel');
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
                seletLabel(compz[ic]);
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
                seletLabel(compz[0]);
            }
        }
    //}
    app.endUndoGroup();
}

function startPrompt(){
    label = prompt('select label', label, 'label (0-16)');
    writeLn('label: ' + label);
}

function seletLabel(comp){

    for (var i = 1; i <= comp.layers.length; i++) 
    {
        if (comp.layers[i].label == label) {
            comp.layers[i].selected = true;
        }else{
            comp.layers[i].selected = false;
        }
    }
}