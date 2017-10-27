var laerz = lairz = compz = [],
    selcomps = ':\n';

main();

function chooseLayers(comp){
    laerz = [];
    //choose selected or all layers
    if (comp.selectedLayers[0]){
        lairz = comp.selectedLayers;
        //check for 3D layers
        for (var l=0; l< lairz.length; l++){
            if (lairz[l].threeDLayer == false){
                laerz.push(lairz[l]);
            }
        }
        if (lairz.length != laerz.length){
            alert('3D Layers were selected, but will be ignored');
        }
        if (confirm('selected '+ laerz.length +' layer(s)')){
            return 1;
        }else{
            return 0;
        }
    }else{
        alert('please select layer(s) and try again');
        return 0;
    }
}
function centerAnchorPoint(layer){
    var trans = layer.transform;
    var props = [trans.position, trans.rotation, trans.scale];
    var rect = layer.sourceRectAtTime(layer.time, true);
    var lsize = [rect['width']*props[2].valueAtTime(layer.time, false)[0]/100, rect['height']*props[2].valueAtTime(layer.time, false)[1]/100];
    var cPos = props[0].value,
        cAnc = trans.anchorPoint.value,
        cScl = props[2].value;
    var nAnc = [rect['left']+(lsize[0]/2)/(cScl[0]/100), rect['top']+(lsize[1]/2)/(cScl[1]/100)]; 
    var offset = [(cAnc[0]-nAnc[0]), (cAnc[1]-nAnc[1])];
    var posA, ma, mb, rM, tM;
    var aniChk = [],
        transTM = [];
    var smpleIntvl = layer.containingComp.frameDuration;
    
    if (trans.anchorPoint.isTimeVarying){
        alert('centering an animated anchor point is not supported\nconsider ' + layer.name + ' and try again');
    }else{
        for (var p = 0; p<props.length; p++){
            if (props[p].isTimeVarying){
                aniChk.push(true);
            }else{
                aniChk.push(false);
            }
        }
        if (aniChk[0] == false && aniChk[1] == false && aniChk[2] == false){
            props[0].setValue([cPos[0]-offset[0], cPos[1]-offset[1]]);
            writeLn('position set - no animation');
        }else{
            //sample frames
            posA = sampleFrames(layer, props[0], props[1], props[2], smpleIntvl, cPos, aniChk);
            //get transform matrix per frame
            for (var p = 0; p<props.length; p++){
                transTM[p] = [];
                for (var k = 0; k<posA.length; k++){
                    if (p== 0){
                            transTM[p].push(transMtx(-offset[0], -offset[1]));
                    }else if (p == 1 ){;
                        if (aniChk[p]){
                            tM = mtxMult(mtxMult(transMtx(-posA[k][4][0], -posA[k][4][1]), rotMtx(posA[k][1])), transMtx(posA[k][4][0], posA[k][4][1]));
                            transTM[p].push(tM);
                        }else{
                            transTM[p].push(idMtx());
                        }
                    }else if (p == 2){
                        cScl = [props[p].valueAtTime(posA[k][3], false)[0], props[p].valueAtTime(posA[k][3], false)[1]];
                        var dScl=[null, null];
                        for (var n=0; n<dScl.length; n++){
                            dScl[n] = cScl[n]/100;
                        }
                        tM = mtxMult(mtxMult(transMtx(-posA[k][4][0], -posA[k][4][1]), sclMtx(dScl[0], dScl[1])), transMtx(posA[k][4][0], posA[k][4][1]));
                        transTM[p].push(tM);
                    }
                }
            }
            for (var k = 0; k<posA.length; k++){
                tM = mtxMult(mtxMult(transTM[0][k], transTM[1][k]), transTM[2][k]);
                posA[k][2] = vecTrans(posA[k][0], tM);
                props[0].setValueAtTime(posA[k][3], posA[k][2]);
            }
        }
        //offset anchor
        trans.anchorPoint.setValue(nAnc);
    }
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
function sampleFrames(l, p, r, s, frameDur, g, ac){
    var a = [];
    var gOff, cScl;
    var cRot = (Math.PI/180)*r.value;
    var oPos = p.valueAtTime(l.inPoint, false);
    for (var k = l.inPoint; k<l.outPoint; k+= frameDur){
        cPos = (ac[0] == true) ? p.valueAtTime(k, false) : oPos;
        if (ac[1] == true) {
            cRot = (Math.PI/180)*r.valueAtTime(k, false);
        }
        if (ac[2] == true) {
            cScl = s.valueAtTime(k, false);
        }
        gOff = (k == l.inPoint || ac[0] == false) ? [g[0], g[1]] : [g[0]-(oPos[0]-cPos[0]), g[1]-(oPos[1]-cPos[1])];
        a.push([cPos, cRot, [null,null], k, gOff, cScl]);
    }
    return a;
}
function centerAnchorPoints(comp){
    if(chooseLayers(comp)){
        for (var ill = 0; ill<laerz.length; ill++){
            centerAnchorPoint(laerz[ill]);
        }
    }
}
function main(){
    clearOutput();
    app.beginUndoGroup('centerAnchorPoint');
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
                centerAnchorPoints(compz[ic]);
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
                centerAnchorPoints(compz[0]);
            }
        }
    }
    app.endUndoGroup();
}