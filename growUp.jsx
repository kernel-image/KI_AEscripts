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
        var cProps = [layer.transform.position, layer.transform.rotation, layer.transform.scale, layer.transform.opacity];
        var parent = layer.parent;
        var parentID = parent.index;
        var pProps = [parent.transform.position, parent.transform.rotation, parent.transform.scale, parent.transform.opacity];
        var pAnim = [false, false, false, false];
        var transTM = [];
        var posA, tM;
        var smpleIntvl = layer.containingComp.frameDuration;
        for (var i = 1; i < pProps.length; i++){
            if (pProps[i-1].isTimeVarying){
                //writeLn(pProps[i-1].name + " is animated, writing to pAnim " + i);
                pAnim[i] = true;
                pAnim[0] = true;
            }
        }
        var convert = confirm('convert expressions to keyframes?');
        layer.parent = null;
        //TODO: check for identical world space anchor position and skip frame sampling if true
        
        if (pAnim[2] || pAnim[3]){
            //sample frames
            posA = sampleFrames(layer, pProps, smpleIntvl, pAnim);
            //get transform matrix per frame
            for (var p = 0; p<pProps.length - 1; p++){
                transTM[p] = [];
                for (var k = 0; k<posA.length; k++){
                    if (p== 0){
                         
                         transTM[p].push(idMtx()); // expression will handle this transform
                            
                    }else if (p == 1 ){
                    
                        if (pAnim[p+1]){
                        
                            writeLn("rotate: " + posA[k][1]/Math.PI * 180);
                            tM = mtxMult(mtxMult(transMtx(-posA[k][4][0], -posA[k][4][1]), rotMtx(posA[k][1])), transMtx(posA[k][4][0], posA[k][4][1]));
                            transTM[p].push(tM);
                            
                        }else{
                            
                            transTM[p].push(idMtx()); // no position offset
                        }
                        
                    }else if (p == 2){
                    
                        if (pAnim[p+1]){
                            //writeLn("offset: " + posA[k][5][0] + " " + posA[k][5][1]);
                            tM = mtxMult(mtxMult(transMtx(-posA[k][4][0], -posA[k][4][1]), sclMtx(posA[k][5][0], posA[k][5][1])), transMtx(posA[k][4][0], posA[k][4][1]));
                            transTM[p].push(tM);
                            
                        }else{
                        
                            transTM[p].push(idMtx()); // no position offset
                        }
                    }
                }
            }
            for (var k = 0; k<posA.length; k++){
                tM = mtxMult(mtxMult(transTM[0][k], transTM[1][k]), transTM[2][k]);
                posA[k][2] = vecTrans(cProps[0].valueAtTime(posA[k][3], false), tM);
                //writeLn(posA[k][0][0] + ", " + posA[k][0][1] + " => " + posA[k][2][0] + ", " + posA[k][2][1]);
                cProps[0].setValueAtTime(posA[k][3], posA[k][2]);
            }
        }
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
            try
            {
                cProps[i].expression = parentingExpression(property, parentID);
  
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


function parentingExpression(property, parentID){
    return 'transform.'+property+' - thisComp.layer('+parentID+').transform.'+property+'.valueAtTime(0) + thisComp.layer('+parentID+').transform.'+property+';';
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


function sampleFrames(l, pProps, frameDur, ac){
//function sampleFrames(l, p, r, s, frameDur, g, ac)
    var p = pProps[0];
    var r = pProps[1];
    var s = pProps[2];
    var g = pProps[0].valueAtTime(0, false);
    var a = [];
    var gOff, pPos, pRot, pScl;
    var oScl = s.value/100;
    var oRot = (Math.PI/180)*r.value;
    var oPos = p.valueAtTime(l.inPoint, false);
    for (var k = l.inPoint; k<l.outPoint; k+= frameDur){
        pPos = (ac[1] == true) ? p.valueAtTime(k, false) : oPos;
        pRot = ac[2] == true ? (Math.PI/180)*r.valueAtTime(k, false) : oRot;
        pScl = (ac[3] == true) ? s.valueAtTime(k, false)/100 : oScl;
        gOff = (k == l.inPoint || ac[0] == false) ? [g[0], g[1]] : [g[0]-(oPos[0]-pPos[0]), g[1]-(oPos[1]-pPos[1])];
        a.push([pPos, pRot, [null,null], k, gOff, pScl]);
    }
    return a;
}


function growUp(comp){
    if(chooseLayers(comp)){
        comp.time = 0;
        for (var ill = 0; ill<laerz.length; ill++){
            packBags(laerz[ill]);
        }
    }
}