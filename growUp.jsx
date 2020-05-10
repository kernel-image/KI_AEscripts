//remove layer parenting while preserving global transform
//currently assumes parenting relationship was created at the first frame of the comp

var laerz = lairz = compz = [],
    selcomps = ':\n';

main();

function main(){
    clearOutput();
    app.beginUndoGroup('growUp');
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
                growUp(compz[ic]);
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
                growUp(compz[0]);
            }
        }
    }
    app.endUndoGroup();
}


function chooseLayers(comp){
    laerz = [];
    //choose selected or all layers
    if (comp.selectedLayers[0]){
        lairz = comp.selectedLayers;
        for (var l=0; l< lairz.length; l++){
            laerz.push(lairz[l]);
        }
        return 1;
    }else{
        alert('please select layer(s) and try again');
        return 0;
    }
}


function packBags(layer){
    if (layer.parent != null){
        var cProps = [layer.transform.position, layer.transform.scale, layer.transform.rotation, layer.transform.opacity];
        var parent = layer.parent;
        var parentName = parent.name;
        var pProps = [layer.transform.position, layer.transform.scale, layer.transform.rotation, layer.transform.opacity];
        var pAnim = false;
        for (var i = 1; i < pProps.length - 1; i++){
            if (pProps[i].isTimeVarying){
                pAnim = true;
                break;
            }
        }
        var convert = confirm('convert expressions to keyframes?');
        layer.parent = null;
        for (var i = 0; i<cProps.length; i++){
            var property = cProps[i].name.toLowerCase();
            //handle pre-existing expressions
            if (cProps[i].expressionEnabled){
                if (convert){
                    convertToKeyframes(cProps[i]);
                }else{
                    alert('please handle existing expressions on' + property );
                    continue;
                }
            }
            try{
                if (pAnim && (i != 0 || i != 3)){
                    for(int j = 1; j <= pProps[i].numKeys; j++){
                    
                        var t = cProps[i].keyTime(j);
                        var val = cProps[0].position.valueAtTime(t) * getMatrix(parent.transform.position.valueAtTime(t));
                        cProps[0].position.setValueAtTime(t, val);
                    }
                        
                
                }else{
                    cProps[i].expression = parentingExpression(property, parentName);
                }
                
            }catch(err){
                //alert(property + ' expressions are locked. try another method.');
                alert(err.message);
                break;
            }
            if (convert)
                convertToKeyframes(cProps[i]);
        }
    }
}


function convertToKeyframes(property){
    property.selected = true;
    try{
        app.executeCommand(app.findMenuCommandId("Convert Expression to Keyframes")); 
        //app.executeCommand(2639);
    }catch(err){
        alert(err.message);
    }
    property.selected = false;
}


function parentingExpression(property, parentName){
    return 'transform.'+property+'+thisComp.layer("'+parentName+'").transform.'+property+'-transform.'+property+';';
    //transform.position+thisComp.layer("Shape Layer 2").transform.position-transform.position;
}


function mtxMult(a, b) {
    //multiply two 2D matrices of any number of rows or columns
    var aNumRows = a.length, 
        aNumCols = a[0].length,
        bNumRows = b.length, 
        bNumCols = b[0].length,
        m = new Array(aNumRows);  // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
        m[r] = new Array(bNumCols); // initialize the current row
        for (var c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;             // initialize the current cell
            for (var i = 0; i < aNumCols; ++i) {
                m[r][c] += a[r][i] * b[i][c];
            }
        }
    }
    return m;
}


function vecTrans(v, m){
    //multiplies vector v by matrix
    if (v.length == 2){
        v.push(1);
    }
    var result = new Array(v.length);
    for ( var i = 0; i < 3; ++i ){
       result[i] = v[0] * m[0][i] + v[1] * m[1][i] + v[2] + m[2][i];
    }
    result = [result[0]/result[2],result[1]/result[2]];
    return result;
}


function idMtx(){
    var im = [[1,0,0],[0,1,0],[0,0,1]];
    return im;
}


function transMtx(tx, ty){
    var tm = [[1,0,0],[0,1,0],[tx,ty,1]];
    return tm;
}


function tMtx(tx, ty){
    var tm = [[1,0,tx],[0,1,ty],[0,0,1]];
    return tm;
}


function rotMtx(theta){
    var rm = [[Math.cos(theta), Math.sin(theta), 0], [-Math.sin(theta), Math.cos(theta), 0], [0,0,1]];
    return rm;
}


function sclMtx(factorX, factorY){
    var sm = [[factorX, 0, 0], [0, factorY, 0], [0,0,1]];
    return sm;
}


function growUp(comp){
    if(chooseLayers(comp)){
        for (var ill = 0; ill<laerz.length; ill++){
            packBags(laerz[ill]);
        }
    }
}