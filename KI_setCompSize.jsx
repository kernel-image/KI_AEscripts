var compz = [],
    nw = 1,
    nh = 1,
    selcomps = ':\n';

main();

function main(){
    app.beginUndoGroup('setCompSize');
    if (app.project.selection[0]){
        //get selected comp(s)
        for (var c = 0; c<app.project.selection.length; c++){
            selcomps += app.project.selection[c].name;
            if (c < app.project.selection.length -1){
                selcomps += ',\n';
            }
        }
        if (confirm('selected ' + app.project.selection.length + ' comp(s)' + selcomps)){
            sizePrompt();
            for (var ic = 0; ic<app.project.selection.length; ic++){
                compz.push(app.project.selection[ic]);
                setCompSize(compz[ic]);
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
                sizePrompt();
                setCompSize(compz[0]);
            }
        }
    }
    app.endUndoGroup();
}

function sizePrompt(){
    nw = Number(prompt('width', nw, 'width'));
    nh = Number(prompt('height', nw, 'height'));
}

function setCompSize(comp){
    comp.width = nw;
    comp.height = nh;
}