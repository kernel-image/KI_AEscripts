//Sends all selected comps to render queue at custom scale 
//user designated destination
//file nameing according to Blaze naming conventions.
//Must have a template called 'PNG100' for this to work properly.

var compz = [],
    rq = app.project.renderQueue,
    selcomps = ':\n',
    separator = "/",
    errmsg = 'please try again.'+'\n'+'pro tip: choose a location next time';
    //newLocation = Folder.selectDialog("Select a render output folder..."),
    customScale = Number(prompt('comp scale resize %', 100, 'Percentage Resize'))/100,
    rqpath = '';
//check os and set seperator accordingly
/*
if ($.os.indexOf("Mac") == -1){
    separator = "\\";
}
*/
clearOutput();

//check that custom Scale is a number
if (customScale){
    main();
}else{
    alert(errmsg.replace('location', '(non-zero) number'));
}
function main(){
    if (rq.numItems > 0){
        rqpath = rq.item(1).outputModule(1).getSettings(GetSettingsFormat.STRING_SETTABLE)["Output File Info"]["Base Path"];
    }else{
        rqpath = Folder.selectDialog("Select a render output folder...").fsName;
    }
    if (rqpath != null) {
        app.beginUndoGroup('addPNG2Q');
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
                alert(errmsg.replace('location', 'comp or two'));
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
        alert(errmsg);
    }
}
function setupRender(comp){ 
    var om_resize = { 
            "Resize" : "true", 
            "Resize to" : [comp.width*customScale, comp.height*customScale],
            "Resize Quality" : 1
        },
        filePath = {
            "Output File Info":{
                "Base Path" : rqpath, //decodeURI(newLocation.toString()),
                "File Template" : '[compName]_[width]_[height]_24' + separator + '[compName]_[#####].[fileExtension]'
            }
        },
        rqitem;
    rq.items.add(comp);
    rqitem = rq.item(rq.numItems).outputModule(1);    
    rqitem.applyTemplate('PNG100%');
    rqitem.setSettings(filePath);
    rqitem.setSettings(om_resize);
    var rl = rqitem.getSettings(GetSettingsFormat.STRING_SETTABLE)["Output File Info"]["Full Flat Path"];
    writeLn(rl);
}