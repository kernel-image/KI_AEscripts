var compz = [],
    newDuration = 1,
    selcomps = ':\n';

main();

function main(){
    app.beginUndoGroup('setCompDuration');
    if (app.project.selection[0]){
        //get selected comp(s)
        for (var c = 0; c<app.project.selection.length; c++){
            selcomps += app.project.selection[c].name;
            if (c < app.project.selection.length -1){
                selcomps += ',\n';
            }
        }
        if (confirm('selected ' + app.project.selection.length + ' comp(s)' + selcomps)){
            newDuration = prompt('comp duration (seconds)', app.project.selection[0].duration, 'comp duration (seconds)');
            writeLn('new duration: ', newDuration);
            for (var ic = 0; ic<app.project.selection.length; ic++){
                compz.push(app.project.selection[ic]);
                setCompDuration(compz[ic]);
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
                newDuration = prompt('comp duration (seconds)', app.project.activeItem.duration, 'comp duration (seconds)');
                writeLn('new duration: ', newDuration);
                setCompDuration(compz[0]);
            }
        }
    }
    app.endUndoGroup();
}
function setCompDuration(comp){
    var roundDur = Math.floor(newDuration/comp.frameDuration);
    comp.duration = roundDur*comp.frameDuration;
}