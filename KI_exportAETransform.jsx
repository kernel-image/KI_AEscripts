//exportAETransform
//v0.6
//07-11-2017

//exports transform data from AE to JSON file.
//send feedback to info@kernel-image.net

try {
    var testJSON = JSON.stringify({key:000});
}catch(err){
    //@include 'json2_min.js'
}
var obj = new Object(),
    compz = new Array(),
    selcomps = ':\n',
    compzObj = new Object(),
    laerzObj = new Object(),
    laerz = new Array();

main();


function main(){
    clearOutput();
    if (app.project.selection[0]){
        //get selected comp
        for (var c = 0; c<app.project.selection.length; c++){
            selcomps += app.project.selection[c].name;
            if (c < app.project.selection.length -1){
                selcomps += ',\n';
            }
        }
        if (confirm('selected ' + app.project.selection.length + ' comp(s)' + selcomps)){
            for (var ic = 0; ic<app.project.selection.length; ic++){
                laerzObj = {};
                compz.push(app.project.selection[ic]);
                chooseLayers(compz[ic]);
                layerLoop(laerz);
                compzObj[compz[ic].name] = laerzObj;
            }
        }else{
            return;
        }
    }else{
        if (app.project.activeItem == null){
            alert('please select comp(s) and run again');
            return;
        }else (app.project.activeItem){
            if (confirm('selected comp: ' + app.project.activeItem.name)){
                //get active comp
                compz.push(app.project.activeItem);
                chooseLayers(compz[0]);
                layerLoop(laerz);
                compzObj[compz[0].name] = laerzObj;
            }else{
                return;
            }
        }
    }
    obj[mkfn()] = compzObj;
    save(obj, mkfn());
}
function chooseLayers(comp){
    //choose selected or all layers
    if (comp.selectedLayers[0]){
        laerz = comp.selectedLayers;
        alert('selected '+ comp.selectedLayers.length +' layer(s)');
    }else if (comp.numLayers != 0){
        //get all comp layers
        alert('all ' + comp.numLayers +' layers' );
        for (var n = 1; n<=comp.numLayers; n++){
            laerz.push(comp.layer(n));
        }
    }else{
        return;
    }
}
function layerLoop(laerz){
    //loop through all layers
    for (var il = 0; il<laerz.length; il++){
        var laer = {name : laerz[il].name, index : laerz[il].index, inPoint: laerz[il].inPoint, outPoint: laerz[il].outPoint, blendMode: laerz[il].blendingMode};
        layerVal(laerz[il], laer);
        //writelayerinfo(laer);
        animation(laerz[il], laer);
        laerzObj['layer_'+laer['index']] = laer;

    }
}
function animation(layer, laer){
    //check for animation
    var trans = layer.transform;
    var props = [trans.position, trans.rotation, trans.scale, trans.opacity];
    for (var p = 0; p<props.length; p++){
        if (props[p].isTimeVarying){
            if (p==0){
                laer['position'].splice(0, 1);
            }else if (p==1){
                laer['rotation'].splice(0, 1);
            }else if (p==2){
                laer['scale'].splice(0, 1);
            }else if (p==3){
                laer['opacity'].splice(0, 1);
            }else{
                alert('unexpected property: '+ props[p].name);
            }
            if(props[p].expressionEnabled){
            
                //get values at intervals of 1 frame while t<out point
                
                smpleIntvl = layer.containingComp.frameDuration;
                for (var t = layer.inPoint; t<layer.outPoint; t+= smpleIntvl){
                    if (p==0){
                        laer['position'].push({time:t, value:[props[p].valueAtTime(t, false)[0], props[p].valueAtTime(t, false)[1]], isKey:false, interpolateIn: null, interpolateOut: null});
                    }else if (p==1){
                        laer['rotation'].push({time:t, value:props[p].valueAtTime(t, false), isKey:false, interpolateIn: null, interpolateOut: null});
                    }else if (p==2){
                        laer['scale'].push({time:t, value:[props[p].valueAtTime(t, false)[0], props[p].valueAtTime(t, false)[1]], isKey:false, interpolateIn: null, interpolateOut: null});
                    }else if (p==3){
                        laer['opacity'].push({time:t, value:props[p].valueAtTime(t, false)[0], isKey:false, interpolateIn: null, interpolateOut: null});
                    }else{
                        alert('unexpected property: '+ props[p].name);
                    }
                    writelayerinfo(laer);
                }
                
            }else{
            
                //loop through keys getting time from keyTime()
                
                var ver =  app.version;
                if (ver.split('.')[0] == '13'){
                    var intObj = {'6212':'linear', '6213':'bezier', '6214':'hold'};
                }else if (ver.split('.')[0] == '14'){
                    var intObj = {'6612':'linear', '6613':'bezier', '6614':'hold'};
                }else if (Number(ver.split('.')[0]) > 14){
                    var intObj = {'6612':'linear', '6613':'bezier', '6614':'hold'};
                }else{
                    alert('missing keyframe interpolation value enumeration dictionary, values will be ommitted.');
                }
                var intIn = new String();
                var intOut = new String();

                for (var k = 1; k<=props[p].numKeys; k++){
                	var kin = props[p].keyInInterpolationType(k);
                	var kout = props[p].keyOutInterpolationType(k);
                	//writeLn(kin);
                    //writeLn(kout);
                    intIn = intObj[kin];
                    intOut = intObj[kout];
                    if (p==0){
                        laer['position'].push({time:props[p].keyTime(k), value:[props[p].valueAtTime(props[p].keyTime(k), false)[0], props[p].valueAtTime(props[p].keyTime(k), false)[1]], isKey:true, interpolateIn: intIn, interpolateOut: intOut});
                    }else if (p==1){
                        laer['rotation'].push({time:props[p].keyTime(k), value:props[p].valueAtTime(props[p].keyTime(k), false), isKey:true, interpolateIn: intIn, interpolateOut: intOut});
                    }else if (p==2){
                        laer['scale'].push({time:props[p].keyTime(k), value:[props[p].valueAtTime(props[p].keyTime(k), false)[0], props[p].valueAtTime(props[p].keyTime(k), false)[1]], isKey:true, interpolateIn: intIn, interpolateOut: intOut});
                    }else if (p==3){
                        laer['opacity'].push({time:props[p].keyTime(k), value:props[p].valueAtTime(props[p].keyTime(k), false), isKey:true, interpolateIn: intIn, interpolateOut: intOut});
                    }else{
                        alert('unexpected property: '+ props[p].name);
                    }
                }
            }
        }
    }
}
function layerVal(layer, obj){
    obj['position'] = [{time:0, value:[layer.transform.position.value[0],layer.transform.position.value[1]]}];
    obj['rotation'] = [{time:0, value:layer.transform.rotation.value}];
    obj['scale'] = [{time:0, value:[layer.transform.scale.value[0],layer.transform.scale.value[1]]}];
    obj['opacity'] = [{time:0, value:layer.transform.opacity.value}];
}
function mkfn(){
    var projname  = new String();
    if (app.project.file){
        projname = app.project.file.displayName.split('.')[0];
    }else{
        projname = 'unsavedProject';
    }
    return projname;
}
function writelayerinfo(laer, indx){
    indx = indx || 0;
    writeLn('layer name: ' + laer['name'] + 
                        ' layer index: ' + laer['index'] + ' / ' + 
                        'coords: [' +  laer['position'][indx]['value'][0] + ',' + laer['position'][indx]['value'][1] + '] / ' + 
                        'rotation: ' + laer['rotation'][indx]['value'] + ' / ' + 
                        'scale: ' + laer['scale'][indx]['value'] + ' / ' +
                        'opacity: ' + laer['opacity'][indx]['value']);
}
function save(text, fn){
    //save text as fn in current directory
    filename = fn + '_coords.json';
    var tfile = new File(filename);
    file = tfile.saveDlg();
    try {
        file.open('w');
        file.encoding = "UTF-8";
        file.write(JSON.stringify(text, undefined, 2));
        file.close();
        if(file.exists){
            alert(file.displayName + ' saved @ ' + file.fsName.split(file.displayName)[0]);
        }else{
            alert('something went wrong: file does not exist');
        }
    }catch(err){
        alert('something went wrong: ' + err.message);
    }

}  
