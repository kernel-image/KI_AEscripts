//Sends all selected comps to render queue at 100% & 50% scale 
//user designated destination
//file nameing according to Blaze naming conventions.
//Must have a template called 'PNG100' for this to work properly.

var compz = [],
    rq = app.project.renderQueue,
    selcomps = ':\n',
    separator = "/",
    newLocation = '';

if ($.os.indexOf("Mac") == -1){
    write('not mac');
    separator = "\\";
}

main();

function main(){
    if (rq.numItems > 0){
        newLocation = rq.item(rq.numItems).outputModule(1).getSettings(GetSettingsFormat.STRING_SETTABLE)["Output File Info"]["Base Path"];
    }else{
        newLocation = Folder.selectDialog("Select a render output folder...").fsName;
    }
    if (newLocation != null) {
        app.beginUndoGroup('addPNG2Q');
        clearOutput();
        if (app.project.selection[0]){
            //get selected comp(s)
            for (var c = 0; c<app.project.selection.length; c++){
                selcomps += app.project.selection[c].name;
                if (c < app.project.selection.length -1){
                    selcomps += ',\n';
                }
            }
            if (confirm('selected ' + app.project.selection.length + ' comp(s)' + selcomps)){
                for (var ic = 0; ic<app.project.selection.length; ic++){
                    compz.push(app.project.selection[ic]);
                    setupRender(compz[ic]);
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
                    setupRender(compz[0]);
                }
            }
        }
        app.endUndoGroup();
    }else{
        alert('please try again.'+'\n'+'pro tip: choose a location next time');
    }
}
function setupRender(comp){  
    
    var om_png50 = { 
            "Resize" : "true", 
            "Resize to" : [comp.width/2, comp.height/2],
            "Resize Quality" : 1
        },
        /*
        filePath = {
            "Output File Info":{
                "Base Path" : newLocation,
                "File Template" : '[compName]_[width]_[height]_24' + separator + '[compName]_[#####].[fileExtension]'
            }
        },
        */
        basePath50 = {
            "Output File Info":{
                "Base Path" : newLocation,
                "File Template" : '50%' + separator + '[compName]_[width]_[height]_24' + separator + '[compName]_[#####].[fileExtension]'
            }
        },
        basePath100 = {
            "Output File Info":{
                "Base Path" : newLocation,
                "File Template" : '100%' + separator + '[compName]_[width]_[height]_24' + separator + '[compName]_[#####].[fileExtension]'
            }
        },
        rqitem;
    rq.items.add(comp);
    rqitem = rq.item(rq.numItems);    
    rqitem.outputModules.add();
    for (i=1;i<=rqitem.outputModules.length;i++){
        rqitem.outputModule(i).applyTemplate('PNG100%');
        //rqitem.outputModule(i).setSettings(filePath);
        if (i == 1){
            rqitem.outputModule(i).setSettings(basePath100);
        }else if (i ==2){
            rqitem.outputModule(i).setSettings(basePath50);
            rqitem.outputModule(i).setSettings(om_png50);
        }
        var rl = rqitem.outputModule(i).getSettings(GetSettingsFormat.STRING_SETTABLE)["Output File Info"]["Full Flat Path"];
        writeLn(rl);
    }

}
