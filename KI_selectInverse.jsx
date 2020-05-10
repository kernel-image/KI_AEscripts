var compz = [],
    selcomps = ':\n';

main();

function main(){
    app.beginUndoGroup('seletInverse');
    if (app.project.activeItem == null){
        alert('please select comp(s) and try again');
        return;
    }else if (app.project.activeItem){
        //get active comp
        compz.push(app.project.activeItem);
        if (confirm('selected comp: ' + compz[0].name)){
            seletInverse(compz[0]);
        }
    }
    app.endUndoGroup();
}
function seletInverse(comp){

    for (var i = 1; i <= comp.layers.length; i++) 
    {
        if (comp.layers[i].selected == true) {
            comp.layers[i].selected = false;
        }else{
            comp.layers[i].selected = true;
        }
    }
}