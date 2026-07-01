// VERSION  v2.1.5
// TITLE fix follow curve 
// AUTHOR devtunis 
// GITHUB contributer https://github.com/devtunis 
// FEATURES 
// [draw the lineCurve in other layer  to avoid perfomance issue ,  and draw other layer ]
// 14 /06/2026




// new Featurss zid wa7da wrha tsal7 ll5at and make him smmoth so much
 

 
  import { Colors } from "./Colors.js"
  import { Path } from "./Pathline.js"
  import { shortId } from "./utli.js"

  // background: radial-gradient(ellipse at center, #1a0a2e 0%, #0d0d1a 60%, #050508 100%);
  const container = document.querySelector(".container")
  const Layer1 = document.querySelector("#Layer1")
  const Layer2 = document.querySelector("#Layer2")
  const Layer3 = document.querySelector("#Layer3")
  const Layer4 = document.querySelector("#Layer4")
  const Layer5 = document.querySelector("#Layer5")
  const Layer6 = document.querySelector("#Layer6")

  const ctx = Layer1.getContext("2d")
  const ctx2 = Layer2.getContext("2d")
  const ctx3 = Layer3.getContext("2d")
  const ctx4 = Layer4.getContext("2d")
  const ctx5 = Layer5.getContext("2d")
  const ctx6 = Layer6.getContext("2d")


  const zoom = document.querySelector("#zoom")
  const restZoom = document.querySelector("#restZoom")
  const resetOptions = document.querySelector(".sp-btn")
  const menu  = document.getElementById("menu")
  const range  = document.getElementById("size")
  const Smoothing  = document.getElementById("smoothing")
  const clear  = document.getElementById("clear")
  const undo =  document.getElementById("undo")
  const redo =  document.getElementById("redo")
  const erraser =  document.getElementById("erraser")
  const pen =  document.getElementById("pen")
  const usingPath = new Path()
  const SelectCursor  = document.getElementById("SelectCursor")
  const download  = document.getElementById("download")
  const downloadlink = document.getElementById("downloadlink")
  const circle = document.getElementById("circle")
  const square = document.getElementById("square")
  const bb  = document.getElementById("bb")
  const CreateCurveLine =  document.getElementById("CreateCurveLine")
  // const HiddenLayerForStroke =  ...

// point for caash this good idea you going to do it 
// transalate this to svg
// ---------------------------------------------------State---------------------------------------------

  let state = {
    draw : false , 
    points : [], 
    oldx : 0 , 
    oldy : 0 ,
    sizeLine :6, 
    colorline :"#121212",
    alpha :  0.186, 
    dx :0 ,
    dy : 0 ,
    strokes  : [] , 
    Shapes : [], 
    cursormode : false,
    errasermode : false,
    SelectMode :  false ,

    // new work
    LEFTBUTTONMOUSE : 0 ,
    RIGHTBUTTONMOUE : 2 , 
    dragMode  : false ,
    currentEntite  : -1,
    dragAspectIetms :  false ,
    // for shapes 

    isShapeCreationEnabled: false,
    currentShapeType: null,
    firstCordShapes : {x : 0 ,y : 0 },
    DefaultSizex : 50,
    DefaultSizey : 50,
    EdgesShapes : new Map(),

    // start draw entite
    StartCurveEntiteIndex : -1 ,
    isStartCreationLine : false ,
    // Curve params start 

    ConnectionCurves : new Map(),

    startLove :   {
      head  : {x : 0 , y : 0 , Fhead : new Set()} , 
      middle : 0 , 
      tail  : {x : 0 , y : 0 , Ftail : new Set()}

    }  , 
    sequence :-1 ,
    oldxx   : 0  ,
    oldyy  :  0,

    // start cash for curvesLines 
     
    CashLines  : new Map(),
    isContainKey : null ,  // type : isContainKey <String>,
    IndexingLine : new Map() , 
    firstEdge :  null , 
    endEdge : null ,
    register : new Map(),
    currentPosition :  null ,
    currentId  :  null,
    swapMode :  false 
     

    
    
   
     
   

   
   
 


   
    
  }
// lll
  let SaveOldest =  {x : 0 , y :0}
  let ratio  = 1   ;
  
  const Camera = {
    x : 0 , 
    y : 0 ,  
    zoom :1
  }

   
    
    
// ---------------------------------------------------State---------------------------------------------

 
const rc = rough.canvas(document.getElementById('Layer1'));
const rc2 = rough.canvas(document.getElementById('Layer2'));
const rc3 = rough.canvas(document.getElementById('Layer3'));
   
container.style.cursor = 'crosshair';



// ---------------------------------------------------functions---------------------------------------------

function UpdateBoundries() {
    const refBound = container.getBoundingClientRect();
    ratio = window.devicePixelRatio || 1;   
    
    Layer1.width = refBound.width * ratio;
    Layer1.height = refBound.height * ratio;
      
    Layer2.width = refBound.width * ratio;
    Layer2.height = refBound.height * ratio;

    Layer3.width = refBound.width * ratio;
    Layer3.height = refBound.height * ratio;
    

    Layer4.width = refBound.width * ratio;
    Layer4.height = refBound.height * ratio;

    Layer5.width = refBound.width * ratio;
    Layer5.height = refBound.height * ratio;

    Layer6.width = refBound.width * ratio;
    Layer6.height = refBound.height * ratio;

    
    applyTransform()
        
}
function buildPath(points) {

    if (points.length === 0) return "";

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} 
              L ${points[1].x} ${points[1].y}`;
    }

    if (points.length === 3) {
      return `M ${points[0].x} ${points[0].y}
              Q ${points[1].x} ${points[1].y}
              ${points[2].x} ${points[2].y}`;
    }
    if(points.length>=4){
        let d = `M${points[0].x} ${points[0].y}`;
        for (let j = 1; j < points.length; j++) {
          let prev = points[j - 1];
          let curr = points[j];
          d+= `Q${(prev.x + curr.x) / 2} ${(prev.y + curr.y) / 2} ${curr.x} ${curr.y}`;
        }
        return d
    }

  

  
}
function Paint(currentx,currenty  , mode  , ctx ){

  switch(mode){
    case  "insert" : 
              const x = state.oldx + (currentx  -state.oldx) * state.alpha
              const y = state.oldy + (currenty  -state.oldy) *  state.alpha
            

              ctx.beginPath();
              ctx.moveTo(state.oldx, state.oldy);
              ctx.quadraticCurveTo((state.oldx+x)/2, (state.oldy+y)/2, x, y)
            
              ctx.strokeStyle = state.colorline;
              ctx.lineWidth = state.sizeLine;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              
              ctx.stroke();

              let x1 =  currentx  - state.oldx
              let y1 = currenty   -  state.oldy
                



            let distance =  Math.sqrt(x1*x1   + y1*y1)
       
                
                  
              state.points.push({x :x , y : y , 
                color : state.colorline , size :  state.sizeLine  })
              state.oldx = x  
              state.oldy = y

          
     

             break 

     case  "erraserfollow":  
              const x2 = state.oldxx + (currentx  -state.oldxx) *  0.2
              const y2 = state.oldyy + (currenty  -state.oldyy) * 0.2
            

              ctx.beginPath();
              ctx.moveTo(state.oldxx, state.oldyy);
              ctx.quadraticCurveTo((state.oldxx+x2)/2, (state.oldyy+y2)/2, x2, y2)
            
              ctx.strokeStyle = "grey";
              ctx.lineWidth = state.sizeLine;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.stroke();
              


              state.oldxx = x2
              state.oldyy  = y2 
              break
  }

  


}
function applyTransform(){
     let ListofCtx = [ctx ,ctx2,ctx3,ctx4,ctx5 , ctx6]
     ListofCtx.forEach(ctxel => {
      

        ctxel.setTransform(
        Camera.zoom * ratio,
        0,
        0,
        Camera.zoom * ratio,
        Camera.x * ratio,
        Camera.y * ratio
      );

     });
 

      



}
function RestartCanvas(ctx , Layer){
        ctx.save()
        ctx.setTransform(1,0,0,1,0,0)
        ctx.clearRect(0,0,Layer.width,Layer.height)
        ctx.restore()
}
function drawOctagon(cx, cy, size) {
    ctx.beginPath();

    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
}
function drawPolygon(cx, cy, size, sides, color) {
    ctx.fillStyle = color;
    ctx.beginPath();

    for (let i = 0; i < sides; i++) {
        const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
}
function drawStar(cx, cy, outerRadius, innerRadius, points, color) {
    ctx.fillStyle = color;
    ctx.beginPath();

    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * i) / points - Math.PI / 2;

        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
}
function drawHeart(x, y, size, color = "red") {
  // here put int xt2 the hear 
    ctx.fillStyle = color;

    ctx.beginPath();

    ctx.moveTo(x, y);

    ctx.bezierCurveTo(
        x, y - size * 0.5,
        x - size * 0.8, y - size * 0.5,
        x - size * 0.8, y + size * 0.2
    );

    ctx.bezierCurveTo(
        x - size * 0.8, y + size,
        x, y + size * 1.3,
        x, y + size * 2
    );

    ctx.bezierCurveTo(
        x, y + size * 1.3,
        x + size * 0.8, y + size,
        x + size * 0.8, y + size * 0.2
    );

    ctx.bezierCurveTo(
        x + size * 0.8, y - size * 0.5,
        x, y - size * 0.5,
        x, y
    );

    ctx.fill();
}
function roundedRect(rc, x, y, w, h, r, options = {}) {
  const path = `
    M ${x + r} ${y}
    L ${x + w - r} ${y}
    Q ${x + w} ${y} ${x + w} ${y + r}
    L ${x + w} ${y + h - r}
    Q ${x + w} ${y + h} ${x + w - r} ${y + h}
    L ${x + r} ${y + h}
    Q ${x} ${y + h} ${x} ${y + h - r}
    L ${x} ${y + r}
    Q ${x} ${y} ${x + r} ${y}
    Z
  `;

  return rc.path(path, options);
}
function redraw(){

        
        RestartCanvas(ctx  ,Layer1)
        RestartCanvas(ctx2 ,Layer2)
        RestartCanvas(ctx4 ,Layer4)


        applyTransform()   
      
        RenderStrokes()
        RenderShapes()
        RenderCurveLines()
        
        // drawOctagon(400, 250, 50);  
        // drawPolygon(400, 150, 60, 3, "red");
        // drawStar(800, 350, 70, 35, 5, "gold");
        // drawHeart(150, 100, 50, "red");
        // roundedRect(rc, 120, 15, 80, 80, 15, { fill: 'red' });
}
function RenderStrokes (){
  
     for(let item of state.strokes){


              ctx.beginPath();
              ctx.moveTo(item.points[0].x ,item.points[0].y);
              ctx.lineCap = "round";
              ctx.lineJoin = "round";



         if(item.view){

         for(let i =0 ;i<item.points.length-1;i++){
              let midx =( item.points[i].x+ item.points[i+1].x)/2
              let midy = ( item.points[i].y+ item.points[i+1].y)/2
              
               
           
              ctx.quadraticCurveTo(item.points[i].x,
                item.points[i].y ,
                midx,
                midy
              )
            
              ctx.strokeStyle= item.points[i].color;
              ctx.lineWidth = item.points[i].size;
        
             
          }

         }
         
        ctx.stroke();
                
        
        }

        

}
function PaintDrawCircle(ctx ,x,y,r , color="red"){
  //3859FF
        ctx.beginPath();
        ctx.arc(x,y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.lineWidth  =  2
        ctx.fill();
        ctx.stroke();
}
function drawArrowEnd(startX, startY, endX, endY , ctx2) {
  const headLength =10; // size of arrow

  // angle of the line
  const angle = Math.atan2(endY - startY, endX - startX);

  ctx4.beginPath();
  ctx4.moveTo(endX, endY);

  ctx4.lineTo(
    endX - headLength * Math.cos(angle - Math.PI / 6),
    endY - headLength * Math.sin(angle - Math.PI / 6)
  );

  ctx4.lineTo(
    endX - headLength * Math.cos(angle + Math.PI / 6),
    endY - headLength * Math.sin(angle + Math.PI / 6)
  );

  ctx4.closePath();
  ctx4.fillStyle = "#333333";
  ctx4.fill();


}
function DrawStraitghtCurveLine(ctx, startX , startY ,endX  ,  endY , valueOfCurves  = 0){
//here
  if(endX!=0 && endY!=0 && startX!=0 && startY!=0){
     
    let curve = valueOfCurves
    ctx.beginPath()
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#333333"; 
    ctx.moveTo(startX,startY);
    let cp1 = ((startX+endX)/2)+curve
    let cp2= ((startY+endY)/2)-curve
    ctx.quadraticCurveTo(cp1, cp2, endX,endY)
    ctx.stroke();
  }

  

}
function RenderShapes(){
 
  state.Shapes.forEach((item,index)=>{


            switch(item.typeShape){
                case  "rectangle":{

               


              PaintRectangle(ctx2,item.points.x,item.points.y,item.points.width,item.points.height   ,2,"#121212") 


   
          


                // render the shapes here
              if(true){ 
             // top (  (item.points.x+item.points.width) -(item.points.width)/2 , item.point.y)
            // right ((item.points.x+item.points.width) ,  (item.points.y+item.points.height)-(item.points.height)/2)
            //left ((item.points.x,y) , ((item.points.y+item.points.height)-(item.points.height)/2))
            // bottom (((item.points.x+item.points.width) -(item.points.width)/2) ,  item.points.y+item.points.height)
                  

                      const middleTop =    (item.points.x+item.points.width) -(item.points.width)/2
                      const middleBottom = item.points.y+item.points.height
                      const middelHeight = (item.points.y+item.points.height)-(item.points.height)/2
                      const middleRight  = (item.points.x+item.points.width)


                      const marge  = 0
                      // use this if i wanna some curve
                      let FinallyTop = item.points.height>0?item.points.y-marge :item.points.y+marge
                      let FinallyBottom = item.points.height>0?middleBottom + marge:middleBottom -marge
                      let FinallyLeft = item.points.width>0?item.points.x-marge :item.points.x+marge
                      let FinallyRight =item.points.width>0?middleRight+marge : middleRight-marge

                      state.EdgesShapes.set(`top-${index}`,   {index,x :middleTop,y:FinallyTop})
                      // state.EdgesShapes.set(`right-${index}`,   {index,x :middleRight,y:middelHeight})
                      // state.EdgesShapes.set(`left-${index}`,   {index,x :item.points.x,y:middelHeight})
                      // state.EdgesShapes.set(`bottom-${index}`,   {index,x :middleTop,y:middleBottom})

                      PaintDrawCircle(ctx2,middleTop,FinallyTop,5)

                      // PaintDrawCircle(ctx2,middleRight,middelHeight,5)
                      // PaintDrawCircle(ctx2,item.points.x,middelHeight,5)
                      // PaintDrawCircle(ctx2,middleTop,middleBottom,5)
                      
                     ctx2.font = " 30px  'Trebuchet MS', 'Segoe UI', sans-serif";
                     ctx2.fillText(index,middleTop-10,middelHeight);
                } 
             break
      }
                  case "circle":{
                  
                    ctx2.beginPath();
                    ctx2.arc(item.points.x, item.points.y, item.points.radius, 0, 2 * Math.PI);
                
                    ctx2.stroke();
                   
                    break

                }
            }


  })
    

 
}
function getCordWordPoint(e){
   const rect = e.currentTarget.getBoundingClientRect()
   //screnx =e.clientX-rect.left , screeny=(e.clientY-rect.top)-Camera.y)
    return{
      CurrentX :  ((e.clientX-rect.left)-Camera.x)/Camera.zoom , 
      CurrentY :  ((e.clientY-rect.top)-Camera.y)/Camera.zoom
    }
}
function drawImage(ctx,LinkImage , x,y,w,h){

      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, x, y, w, h);
      };

      img.src = LinkImage
} 
const handleStrokeHitDetection = (curx,curry,arrayOfStrokes)=>{
   
  arrayOfStrokes.forEach(element => {

 
   
      if(element.view && element.type=="stroke"){
        for(const p of element.points){
          const dx = p.x - curx
          const dy = p.y - curry
          const radius = 15 /Camera.zoom
        

          const match = Math.sqrt(dx*dx + dy*dy)<=radius
        
          if(match){
           console.log(match,"matching")
            element.view = false
            usingPath.PushElementFromErraser(element)


             RestartCanvas(ctx,Layer1)
             RenderStrokes()
             break
      
      

          }

        }
      }
  
  
        

    }
)}
const vacuum  =  ()=>{
 
  state.strokes = state.strokes.filter((item)=>item.view)
    
}
let getOffsetDxDy = function  (CurrentX ,CurrentY){
  return {
    dx : CurrentX- SaveOldest.x ,
    dy :CurrentY - SaveOldest.y  
  }


}
let DrawBorderToTheObject  = function (ctx ,x,y,w,h){
        ctx.beginPath();
        ctx.lineWidth = "3";
        ctx.strokeStyle = "#9BACFF";
        ctx.rect(x, y, w+2, h+2);
        ctx.stroke();

}
function addShapes(){
  
  state.Shapes.push({
  id: shortId(6),
  
  type: "Shape",
  chosen  : false  ,
  points: { x: 500, y: 400, width: 200, height: 200, color: "green" },
  typeShape:"rectangle",
  view: true
})

 

state.Shapes.push({
  id: shortId(6),
  type: "Shape",
  chosen  : false ,
  points: { x: 700, y: 700, width: 120, height: 120, color: "red"  },
  typeShape:"rectangle",
  view: true
})

 
state.Shapes.push({
  id: shortId(6),
  type: "Shape",
  chosen  : false ,
  typeShape : "circle",
  points: { x: 860, y: 690,radius : 30, color: "blue"  },
  view: true
})
    

  }
// function PaintRectangle(
//   ctx,
//   x,
//   y,
//   w,
//   h,
//   lineWidth = 2,
//   color = "black",
//   radius = 10
// ) {



    
//   ctx.beginPath();
//   ctx.lineWidth = lineWidth;
//   ctx.strokeStyle = color;

//   ctx.moveTo(x + radius, y);
//   ctx.lineTo(x + w - radius, y);
//   ctx.quadraticCurveTo(x + w, y, x + w, y + radius);

//   ctx.lineTo(x + w, y + h - radius);
//   ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);

//   ctx.lineTo(x + radius, y + h);
//   ctx.quadraticCurveTo(x, y + h, x, y + h - radius);

//   ctx.lineTo(x, y + radius);
//   ctx.quadraticCurveTo(x, y, x + radius, y);

//   ctx.closePath();
//   ctx.stroke();




// }




function PaintRectangle(
  ctx,
  x,
  y,
  w,
  h,
  lineWidth = 2,
  color = "black"
) {
  ctx.beginPath();
  // ctx.fillStyle = "#5AC4F6";
  ctx.lineWidth = lineWidth;
  // ctx.strokeStyle = color;
  
  ctx.rect(x, y, w, h);
  //ctx.fill();  
  ctx.stroke();
}



function  HandelShapesDectection(currx, curry, arrayOfStrokes) {

  
  return arrayOfStrokes.findLastIndex((item) => {

    if (item.type !== "Shape") return false;
  

    if (item.typeShape === "rectangle") {

      // console.log("x",currx,"y",curry ,"==>","left",item.points.x,"right",item.points.x+item.points.width,
      //   "top",item.points.y,"bottom",item.points.y+item.points.height
      // )
      
      if(item.points.x>=currx && item.points.y>=curry){
         return  currx>= item.points.x + item.points.width  && 
                 currx<=item.points.x && 
                 curry >=item.points.y + item.points.height  &&
                 curry <= item.points.y  
      }

     
      if(item.points.x>=currx ){
    
         return    currx>= item.points.x + item.points.width  
                   && currx<=item.points.x  
                   && curry >= item.points.y 
                   && curry <= item.points.y + item.points.height 
       
      }

      if(item.points.y>=curry ){
    
         return    currx>= item.points.x 
                   && currx<=item.points.x  + item.points.width  
                   && curry >=item.points.y + item.points.height 
                   && curry <= item.points.y  
       
      }




      return (
        currx >= item.points.x  &&
        currx <= item.points.x + item.points.width  &&
        curry >= item.points.y  &&
        curry <= item.points.y + item.points.height 
      );
    }

    if (item.typeShape === "circle") {
      const dx = currx - item.points.x;
      const dy = curry - item.points.y;

      return dx * dx + dy * dy <= item.points.radius ** 2;
    }

    return false;
  });

}
function addRectangle(x,y,w,h,color){
     
  
    state.Shapes.push({
    id: shortId(6),
    type: "Shape",
    chosen  : false  ,
    points: { x: x, y: y, width: w, height: h, color: color || "black" },
    typeShape:"rectangle",
    ConnectionBetweenShapes :{
      top:{from : {startx:0 , startY :  0 }, to :{endx : 0 , endy: 0 } },
      bottom:{from : {startx:0 , startY :  0 }, to :{endx : 0 , endy: 0 } },
      left:{from : {startx:0 , startY :  0 }, to :{endx : 0 , endy: 0 } },
      right:{from : {startx:0 , startY :  0 }, to :{endx : 0 , endy: 0 } },
 

     },
    INdexOfPatrner : [],
    view: true
    })
   RenderShapes()

}
function addCircle(x,y,r){

    state.Shapes.push({
    id: shortId(6),
    type: "Shape",
    chosen  : false ,
    typeShape : "circle",
    points: { x: x, y: y,radius : r, color: "blue"  },
    view: true
})

RenderShapes()
}
function IsOverTheCircle(x,y,EdgesShapes){

    for(let [key,value] of EdgesShapes){
           
          const dx = x - value.x;
          const dy = y - value.y;

          if(Math.sqrt(dx * dx + dy * dy) <=20){
            return {key, index: value.index}
          }


        }

        return -1
}
function RenderCurveLines(){
    for(let [key, value] of state.ConnectionCurves) {
    DrawStraitghtCurveLine(ctx4, value.head.x , value.head.y , value.tail.x ,  value.tail.y ,value.middle)
    drawPostions(value , key)
  }
}
function addNewCurve(){
        let VALUE  =  structuredClone(state.startLove)
        let dx = VALUE.tail.x   - VALUE.head.x  
        let dy = VALUE.tail.y   - VALUE.head.y  
        let distance =  Math.sqrt(dx*dx +dy *dy )
       

        
        if(
          VALUE.head.x!=0  &&
          VALUE.head.y !=0  && 
          VALUE.tail.x !=0 && 
          VALUE.tail.y != 0 && 
          VALUE.head.x != VALUE.tail.x 
          && VALUE.head.x != VALUE.tail.y &&
           distance>67.00746227100382
        ){
          state.sequence++ 
          state.ConnectionCurves.set(`L${state.sequence}` , {

          index : state.sequence , 
          head:{
           
            x: state.startLove.head.x,
            y: state.startLove.head.y,
            Fhead:new Set(state.startLove.head.Fhead)
          },
          middle: state.startLove.middle,
          tail:{
             
            x: state.startLove.tail.x,
            y: state.startLove.tail.y,
            Ftail:new Set(state.startLove.tail.Ftail)
          }
        }

        )

          
    

         }

         console.log(state.ConnectionCurves)


}



/**
 * Adds two numbers.
 * @param {cx} a - First string
 * @param {cy} b - Second string
 * @returns {string}  head |middle | tail
 */

let isInCurrentPosition = (map , currentx , currenty ) => {
 
  for(let [key, value] of map){
    let dx = currentx - value.x 
    let dy = currenty  -   value.y 

       if (Math.sqrt(dx * dx + dy * dy) <= 20) {
            return key;
        }


 
 

  }
  return -1
 
}
let SeeBezier = (a,b,c,d)=> { 
    ctx4.beginPath();
 
  // Set a start-point
   ctx4.moveTo(a,b);

  // Set an end-point
   ctx4.lineTo(c,d);

  // Stroke it (Do the Drawing)
    ctx4.stroke()
}
let drawPostions = (value , id) =>{



  if(value.head.x    !=0  && value.head.y!= 0  &&  value.tail.x !=0 && value.tail.x !=0){



          let firstLine  = {x : value.head.x , y : value.head.y }
          let endLine = {x  : value.tail.x  , y  : value.tail.y }
          let middle =  { x :(endLine.x+firstLine.x)/2  , y : (endLine.y+firstLine.y)/2 }
          let cpx1  =  ((value.head.x +value.tail.x)/2)+value.middle/2
          let cpx2  = ( (value.head.y +value.tail.y)/2)-value.middle/2




  
          PaintDrawCircle(ctx4  , firstLine.x,firstLine.y, 4.4 ,"#58AAE2")
          PaintDrawCircle(ctx4  ,cpx1,cpx2  , 4.4  ,"#76FA4E")
          PaintDrawCircle(ctx4  , endLine.x ,  endLine.y , 3 , "#58AAE2")
          drawArrowEnd(((firstLine.x+endLine.x)/2)+value.middle, ((firstLine.y+endLine.y)/2)-value.middle, endLine.x, endLine.y ,ctx4);
          

    
    
          ctx4.fillStyle   = "green"
          ctx4.font = " 20px  'Trebuchet MS', 'Segoe UI', sans-serif";
          ctx4.fillText(id, cpx1+5,cpx2-5);



              
          ctx4.fillStyle   = "red"
          ctx4.font = " 15px  'Trebuchet MS', 'Segoe UI', sans-serif";
          ctx4.fillText(`(${value.head.x} ,${value.head.y})`,firstLine.x,firstLine.y);

          ctx4.fillStyle   = "red"
          ctx4.font = " 15px  'Trebuchet MS', 'Segoe UI', sans-serif";
          ctx4.fillText(`(${value.tail.x} ,${value.tail.y})`,endLine.x,endLine.y);


          state.CashLines.set(`head-${id}`,   {id,x : firstLine.x,y : firstLine.y ,pos : "head" })
          state.CashLines.set(`tail-${id}`,   {id,x :  endLine.x,y : endLine.y  , pos : "tail" })
          state.CashLines.set(`middle-${id}`,   {id,x : cpx1 ,y :cpx2  , pos : "middle"})
  
      
    
          //  SeeBezier( firstLine.x,firstLine.y ,cpx1 , cpx2 )
          //  SeeBezier( endLine.x ,  endLine.y ,cpx1 , cpx2 )


  }

  



}
let followLinkers = (ListOfLinkers , pos , p ) =>{
 
 ListOfLinkers.forEach(id =>{
 
    state.ConnectionCurves.get(id)[pos].x = (p.x+p.width) - p.width/2
    state.ConnectionCurves.get(id)[pos].y = p.y
    
 })

}
let Ok = (index) =>{
  return index!=-1 && index!=undefined
}

 


/**
 * Adds two numbers.
 * @param {x} x - First string
 * @param {y} y - Second string
 * @returns {string}  L-n   exmple L0 L1 l2 
 */



let RecognizeLine = (x ,y ) =>{
  console.log({x,y})

  // const ListOfCurves  =  state.ConnectionCurves 
 
  // for(let [key  , value] of ListOfCurves){
   
  //   const {head , tail }  = value 

  //     if (x >= value.head.x && x <= value.tail.x) {
  //         console.log("we match", key);

  //         PaintRectangle(
  //             ctx4,
  //             value.head.x,
  //             value.head.y,
  //             value.tail.x -  value.head.x,
  //             value.tail.y-value.head.y , 
  //             2,
  //             "red"
  //         );
  //     }
  // }
 
}




 
//------------------------------------------------------------------------------------------------

 
// ---------------------------------------------------Events---------------------------------------------
let  velocity = 0
let staticX = 0  
 
container.addEventListener("mousemove",(e)=>{
  
 

        const {CurrentX,CurrentY} = getCordWordPoint(e)
        const {dx,dy}  = getOffsetDxDy(CurrentX,CurrentY)

         



        if(state.draw && !state.errasermode && !state.SelectMode  && !state.isShapeCreationEnabled && !state.isStartCreationLine){
      

            
            //container.style.cursor = 'url("./controllers/b.png") 3 32, auto' 
            container.style.cursor = 'crosshair';
            Paint(CurrentX,CurrentY , "insert"  ,ctx)
             

        }  
        if(state.errasermode  && state.draw){
            

             container.style.cursor = 'url("./eraser.png") 10 32, auto' 
              container.style.cursor = 'Default ' 
             handleStrokeHitDetection(CurrentX,CurrentY,state.strokes)

             Paint(CurrentX,CurrentY  , "erraserfollow" , ctx6)
             //velocity>100 ? (RestartCanvas(ctx6,Layer6) ,velocity = 0 )   : velocity++



     



        
        }
        //  move item
        if(
           !state.isStartCreationLine && 
           !state.isShapeCreationEnabled &&  
            state.draw && state.SelectMode && 
            state.currentEntite!=-1 && 
            state.currentEntite!=undefined  && 
            state.currentEntite !=null
          ){

            
         
            const EntiteMove = state.Shapes[state.currentEntite].points
            const AllEntiteMove =  state.Shapes[state.currentEntite]
           
            EntiteMove.x+=dx
            EntiteMove.y+=dy




            //Bézier curve

            const response = state.register.has(state.currentEntite)
            if(response){
            const getItems = state.register.get(state.currentEntite)

            if(getItems.Ftail.size>0){
                followLinkers([...getItems.Ftail] , "tail" ,EntiteMove)
              }


            if(getItems.Fhead.size>0){
                followLinkers([...getItems.Fhead] , "head" ,EntiteMove)
            }

           
           
         
            RestartCanvas(ctx4,Layer4)
            RenderCurveLines()

            }
            
        
            
               
              
            RestartCanvas(ctx2,Layer2)  
            
            RenderShapes()
            
            SaveOldest.x = CurrentX
            SaveOldest.y = CurrentY
          
    
        }
        if(!state.isStartCreationLine && state.dragAspectIetms && state.currentEntite !=-1  && !state.isShapeCreationEnabled ){
            const EntiteMove = state.Shapes[state.currentEntite]
            const ExactConnectionShapesCord =  state.Shapes[state.currentEntite].ConnectionBetweenShapes
            const AllEntiteMove =  state.Shapes[state.currentEntite]

            if(EntiteMove.typeShape === "rectangle"){
            
                
               dx>0   ?   
               container.style.cursor = 'nesw-resize'   :  
               container.style.cursor = 'nw-resize' 


               EntiteMove.points.width+=dx
               EntiteMove.points.height+=dy


               RestartCanvas(ctx2,Layer2)  
               RenderShapes()
               
              
            }


             if(EntiteMove.typeShape ==="circle"){
                  
                 
                 EntiteMove.points.radius=Math.max(EntiteMove.points.radius+dx,20) 
      

               
             }

            
              
          
            RestartCanvas(ctx2,Layer2) 
            
            RenderShapes()
            
            SaveOldest.x = CurrentX
            SaveOldest.y = CurrentY
        }
        // creation shape
        if(state.isShapeCreationEnabled && state.draw && !state.errasermode){
            let  {x,y}  = state.firstCordShapes
            RestartCanvas(ctx3,Layer3)
            

              if(state.currentShapeType === "square"){ 
                
                  state.DefaultSizex+=dx
                  state.DefaultSizey+=dy
                  PaintRectangle(ctx3,x,y,state.DefaultSizex, state.DefaultSizey,2,"black")
                // rc3.rectangle(x,y,state.DefaultSizex, state.DefaultSizey); 
              }
              

              if(state.currentShapeType === "circle"){
                    
                    state.DefaultSizex+=dx
                    state.DefaultSizex  = Math.max(state.DefaultSizex , 20)
                    ctx3.beginPath();
                    ctx3.arc(x, y, state.DefaultSizex , 0, 2 * Math.PI);
                    ctx3.stroke();
                
                }
              
              
              
             
           
            SaveOldest.x  = CurrentX
            SaveOldest.y = CurrentY
        }




        if(state.isStartCreationLine && state.draw && !state.isShapeCreationEnabled){
           // currentwork
      


          if(state.isContainKey!=null && state.isContainKey!=undefined){
            

                const  {id , pos} = state.CashLines.get(state.isContainKey)
                console.log(id,pos ,"<==")
   
    
                let distance = Math.sqrt(dx*dx + dy*dy);
            

                if(pos=="middle"){
                
                  state.ConnectionCurves.get(id).middle+=-dy*0.10
              
                
                } 

                else{
                // dynamic thing
                state.ConnectionCurves.get(id)[pos].x =CurrentX
                state.ConnectionCurves.get(id)[pos].y =CurrentY

                }



                RestartCanvas(ctx4 , Layer4)            
                RenderCurveLines()

          }
          else{
                // draw noramle curve 

           if(state.startLove.head.x!=0  && state.startLove.head.y!=0){



          
            state.startLove.tail.x  = CurrentX 
            state.startLove.tail.y  = CurrentY 
             
            RestartCanvas(ctx5 , Layer5)

            
            DrawStraitghtCurveLine(
            ctx5,
            state.startLove.head.x ,
            state.startLove.head.y,
            state.startLove.tail.x ,
            state.startLove.tail.y ,
            state.startLove.middle
            )

            PaintDrawCircle(ctx5  ,state.startLove.head.x ,state.startLove.head.y, 4.4 , "#58AAE2")
        
            
            let curve = state.startLove.middle
            let cpx1  =  ((state.startLove.head.x +state.startLove.tail.x)/2)+(state.startLove.middle)/2
            let cpx2  = ( (state.startLove.head.y +state.startLove.tail.y)/2)-(state.startLove.middle)/2
            PaintDrawCircle(ctx5  ,cpx1,cpx2  , 5  ,"#76FA4E")

            
            // PaintDrawCircle(ctx5  , state.startLove.tail.x,   state.startLove.tail.y , 4.4)

 





 
           
       
          }
        
        }



        }



        

  })




 
 


container.addEventListener("mousedown",(e)=>{
     
      const {CurrentX,CurrentY} = getCordWordPoint(e)
     
      SaveOldest.x  = CurrentX
      SaveOldest.y  = CurrentY


      if(e.button==state.LEFTBUTTONMOUSE)   {


            if(!state.SelectMode && !state.errasermode && !state.isShapeCreationEnabled && !state.isStartCreationLine)  state.points.push({x :CurrentX , y : CurrentY , color : state.colorline , size :  state.sizeLine  })
            state.draw = true
            state.oldx = CurrentX 
            state.oldy = CurrentY
            state.oldxx = CurrentX
            state.oldyy = CurrentY

      
            
 
      }

 

      if(state.errasermode ){
         
        handleStrokeHitDetection(CurrentX,CurrentY,state.strokes)
      }
      
      if(state.SelectMode  && state.draw){

        
       
    
        const IndexEntite =  HandelShapesDectection(CurrentX,CurrentY,state.Shapes)
        state.currentEntite = IndexEntite   
       
        if(IndexEntite!=-1){




          
          console.log(IndexEntite,"<== this Select  normalle mode  item")
          // state.Shapes[IndexEntite].chosen = true 
          // RenderShapes()
          container.style.cursor = 'grabbing'



    
        }else{

          RecognizeLine(CurrentX ,CurrentY)
          console.log("not detect any thing" , IndexEntite)
        }
        

      }

      if(e.button === state.RIGHTBUTTONMOUE &&  state.SelectMode ){
        
        const IndexEntite =  HandelShapesDectection(CurrentX,CurrentY,state.Shapes)
        state.currentEntite = IndexEntite   
        state.dragAspectIetms = true 
        // console.log("We catch new item",IndexEntite)
        
      }

      if(state.isShapeCreationEnabled){
        
        // console.log("we should save point")
        state.firstCordShapes.x  = CurrentX
        state.firstCordShapes.y  = CurrentY
      }



       
   
      
   
      if(state.isStartCreationLine ){


   
           const  {key , index} = IsOverTheCircle( CurrentX, CurrentY, state.EdgesShapes ) 
           
           if(Ok(index)){
           

                state.firstEdge =  index
               

                const response =  state.register.get(index)
                const key  =   isInCurrentPosition(state.CashLines,CurrentX , CurrentY) 

                if(response){



                    if(response.Fhead.size>0){
                      
                      /// its here

                      let LastIndex = [...response.Fhead].length
                      const CustomKey    = [...response.Fhead]
                      state.isContainKey = `head-${CustomKey[LastIndex-1]}`
                      state.swapMode =  true
                      state.currentId  ="head"
                    }





          

                    else if (response.Ftail.size>0){
                      
                      /// its here

                      let LastIndex = [...response.Ftail].length
                      const CustomKey    = [...response.Ftail]
                      state.isContainKey = `tail-${CustomKey[LastIndex-1]}`
                      state.swapMode =  true
                      state.currentId  ="tail"
                    }
                    

                    





                // return this else if happend an issue
                    else{
                        state.startLove.head.x = CurrentX 
                        state.startLove.head.y = CurrentY
                        }

                


               
                 }


            
           else{

           
             state.startLove.head.x = CurrentX 
             state.startLove.head.y = CurrentY

             }




    
   

      


         


         

           }
           
           else{







              const key  =   isInCurrentPosition(state.CashLines,CurrentX , CurrentY) 

              if(key!=undefined && key!=-1)  {
 
                console.log(key , "<== Hey i Find Line lost 🎉🎉")
                
                state.currentPosition = key.split("-")[0]
                state.isContainKey = key
              }else{
              
           
                state.startLove.head.x = CurrentX 
                state.startLove.head.y = CurrentY
           
              
              }






           }



    
           
        
       
      }


 
    
  })




















 
  container.addEventListener("mouseup",(e)=>{
      const {CurrentX,CurrentY} = getCordWordPoint(e)
      RestartCanvas(ctx6,Layer6)
      
      state.draw = false
      state.cursormode = false   
      state.dragAspectIetms = false



    
   

      
       


     if(state.isShapeCreationEnabled){
       RestartCanvas(ctx3,Layer3)
        switch(state.currentShapeType){
            case "square":{
                
                addRectangle(state.firstCordShapes.x,state.firstCordShapes.y,state.DefaultSizex,state.DefaultSizey)
       

                break
            }
            case "circle":{
                
                addCircle(state.firstCordShapes.x,state.firstCordShapes.y,state.DefaultSizex)
                break
            }
        }

     }


      state.DefaultSizex = 70
      state.DefaultSizey  = 70
      state.firstCordShapes.x = 0 
      state.firstCordShapes.y = 0 

  
      if(!state.errasermode && state.points.length>1 && !state.isShapeCreationEnabled){
        state.strokes.push({
          id:shortId(6),
          type :"stroke",
          points : state.points,
          view : true
        })
        state.points = []
       
        
  
      }
       
      
       
      if(state.errasermode){
       
         vacuum()
      }



      if(state.SelectMode){
        container.style.cursor = 'default' 
      }



      // console.log("--------")
      // console.log(state.Shapes)


      if(state.isStartCreationLine){
       
        
       addNewCurve()
       RestartCanvas(ctx4,Layer4)
       RestartCanvas(ctx5,Layer5)
        
     

        const data = IsOverTheCircle(CurrentX , CurrentY   ,state.EdgesShapes )

  

      // for Creation things
     
       if(state.firstEdge != null && data.index==undefined && state.swapMode == false ){


        // so fix this it can't be handel many heads just the taill very much can handel
        //fazt 2 person
  
        // if(state.register.get(state.firstEdge)){
        //    state.register.get(state.firstEdge).Fhead.add(`L${state.sequence}`)
        // }
        //  else{
          state.register.set(state.firstEdge ,{pos : "head"   , Fhead :  new Set() , Ftail : new Set()})
          state.register.get(state.firstEdge).Fhead.add(`L${state.sequence}`)
          // }
    


     


        
       }
       // in that case push multpile
 
       if(state.firstEdge==null && data.index!=-1 && data.index!=undefined && state.swapMode == false ){
  

            // do this as function
            if(state.currentPosition ==="head"){
              if(state.register.has(data.index)){
              
                state.register.get(data.index).Fhead.add(state?.isContainKey?.split("-")[1] ||  `L${state.sequence}` )
              }else{
                 state.register.set(data.index ,{pos : "head"   , Fhead :  new Set()  , Ftail : new Set()})
                 state.register.get(data.index).Fhead.add(state?.isContainKey?.split("-")[1] ||  `L${state.sequence}` )
              }


            }else{

            if(state.register.has(data.index)){
            

                state.register.get(data.index).Ftail.add(state?.isContainKey?.split("-")[1] ||  `L${state.sequence}`)
              }else{
                state.register.set(data.index ,{pos : "Tail"   , Fhead :  new Set()  , Ftail : new Set()})
                state.register.get(data.index).Ftail.add(state?.isContainKey?.split("-")[1] || `L${state.sequence}`)
              }

            }
            



  
  

       }

       
       // for  creation to shape in same time 
       if(state.firstEdge!= null && data.index!=-1 && data.index!=undefined && state.swapMode == false){
        console.log("yeah boy we gonna link to thing with each other ")


 



        
             state.register.set(state.firstEdge ,{pos : "head"   , Fhead :  new Set()  , Ftail : new Set()})
             state.register.get(state.firstEdge).Fhead.add(state?.isContainKey?.split("-")[1] || `L${state.sequence}`)




        
              if(state.register.has(data.index)){
              
                state.register.get(data.index).Ftail.add(state?.isContainKey?.split("-")[1]  || `L${state.sequence}`)
              }else{
                 state.register.set(data.index ,{pos : "tail"   , Fhead :  new Set()  , Ftail : new Set()})
                 state.register.get(data.index).Ftail.add(state?.isContainKey?.split("-")[1] || `L${state.sequence}` )
              }




       }




       
       // SwapMode  The first if for delte the realtion 
       // sec for add or refresh relation 
       if(state.firstEdge != null && data.index==undefined && state.swapMode ){


      
 

          
        if(state.currentId == "tail"){

          if(!state.isContainKey)
          {
            alert("bigg issue boddy")
          }
          

          state.register.get(state.firstEdge).Ftail.delete(state?.isContainKey?.split("-")[1])
          state.swapMode = false

        }

        if(state.currentId =="head"){
        


            state.register.get(state.firstEdge).Fhead.delete(state?.isContainKey?.split("-")[1])
            state.swapMode = false

        }


       }
       

       if(state.firstEdge!= null  && data.index!=undefined  && state.swapMode && state?.isContainKey?.split("-")[1] )
       {

        console.log("this the custome case we talk about it " , state.currentId)

      

        if(state.register.get(state.firstEdge)){
        state.register.get(state.firstEdge).Ftail.delete(state?.isContainKey?.split("-")[1])
        state.register.get(state.firstEdge).Fhead.delete(state?.isContainKey?.split("-")[1])

        // state.register.get(state.firstEdge).Ftail  =  new Set([...state.register.get(state.firstEdge).Ftail].filter(LineId  => LineId != state?.isContainKey?.split("-")[1] ))
         

        
        }



        if(state.currentId=="head"){

              if(state.register.has(data.index)){
              
                state.register.get(data.index).Fhead.add(state?.isContainKey?.split("-")[1] )
              }else{
                 state.register.set(data.index ,{pos : "head"   , Fhead :  new Set()  , Ftail : new Set()})
                 state.register.get(data.index).Fhead.add(state?.isContainKey?.split("-")[1])
              }




        }
        

        
        if(state.currentId=="tail"){

              if(state.register.has(data.index)){
              
                state.register.get(data.index).Ftail.add(state?.isContainKey?.split("-")[1] )
              }else{
                 state.register.set(data.index ,{pos : "tail"   , Fhead :  new Set()  , Ftail : new Set()})
                 state.register.get(data.index).Ftail.add(state?.isContainKey?.split("-")[1])
              }




        }
        




        state.swapMode  = false 

       }






















       






        console.log(`first edge  ${state.firstEdge}   , connected to the seconde edge  ${data.index} with line storkes id ${state?.isContainKey?.split("-")[1]  || `L${state.sequence}`} `)
        console.log(state.register , "register state")

    

       RenderCurveLines()


     
  
       state.isContainKey =  null
       state.startLove.head.x  = 0 
       state.startLove.head.y = 0 

       state.startLove.tail.x = 0 
       state.startLove.tail.y = 0 
       state.firstEdge  =  null
        // console.log(state.ConnectionCurves)
      }
      
 


  
  })





container.addEventListener("contextmenu",(e)=>{
    e.preventDefault()
  
  
  
  
  })



  
Layer3.addEventListener("wheel", (e) => {
    e.preventDefault()

    const zoomSpeed = 0.001
    
    const newZoom = Math.max(0.1, Camera.zoom + -e.deltaY * zoomSpeed)

    const rect = Layer3.getBoundingClientRect()

    // mouse in screen space
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    // world before zoom
    const wx = (mx - Camera.x) / Camera.zoom
    const wy = (my - Camera.y) / Camera.zoom

    Camera.zoom = newZoom
  
    document.getElementById("percentage").innerText = `${newZoom.toFixed(2)}%`
    // keep mouse fixed in world
    Camera.x = mx - (wx * Camera.zoom)
    Camera.y = my -( wy * Camera.zoom)

    let newBackground   = Math.max( Math.min(40 * Camera.zoom ,87.27272624811852 )  , 36.363636442452425)

 
  
    container.style.backgroundSize = `${newBackground}px ${newBackground}px`;
    applyTransform()
    redraw()
    console.log(Camera ," the secreet")
  })

  



  


  // ---------------------------------------------------Events---------------------------------------------



const observer = new ResizeObserver(() => {
  
 
    UpdateBoundries()
    redraw()
    

  });



observer.observe(container)




  

  
  
  
  
    
  
  



  



  // ---------------------------------------------------Button Events ---------------------------------------------
  

  
  
  

  window.getcolor  =  (color)=>{
  state.colorline =  color
  state.cursormode = false 
  state.errasermode = false 
  state.SelectMode = false
  state.isStartCreationLine = false  
   state.isShapeCreationEnabled  = false 
   
 
  container.style.cursor = 'crosshair';
  }
  
  
  let renderitems = ""

  Colors.map((item)=>{
    renderitems+=`   <div onclick='getcolor("${item}")' class="animation" style="width:24px;height:24px;background-color:${item};border-radius:6px"></div>`
  })


  document.getElementById("stroke-swatches").innerHTML = renderitems



  range.addEventListener("input",(e)=>{
  
    state.sizeLine =  range.value
    document.getElementById("size-v").innerHTML = range.value
  })
  Smoothing.addEventListener("input",(e)=>{
  
    state.alpha =  Smoothing.value
    document.getElementById("smoothing-v").innerHTML = Smoothing.value
  })
  clear.addEventListener("click",()=>{
    state.alpha =  0.186
    state.colorline = "#000"
    state.sizeLine = 12

    document.getElementById("percentage").innerText = `${1}%`
    document.getElementById("size-v").innerHTML = 12
    document.getElementById("smoothing-v").innerHTML = 0.186
    const slider = document.getElementById("size");
    slider.value = slider.defaultValue;
    const slider2 = document.getElementById("smoothing");
    slider2.value = slider2.defaultValue;
    Camera.zoom =  1
    Camera.x = 0 
    Camera.y = 0
    state.strokes = []
    ctx.setTransform(1,0,0,1,0,0)
    redraw()
  
  })
  menu.addEventListener("click",()=>{
    document.getElementById("panel").classList.toggle("d-off")
  })
  undo.addEventListener("click",()=>{
      usingPath.RemoveLastElement(state.strokes)
      redraw()
  })
  redo.addEventListener("click",()=>{
      usingPath.AddElement(state.strokes)
      redraw()
  })
  window.addEventListener("keydown",(ev)=>{
  
    if(ev.key.toLowerCase() =="z" &&  ev.ctrlKey) {
    
      usingPath.RemoveLastElement(state.strokes)
      redraw()
    }
      
    else if(ev.key.toLowerCase() =="y" &&  ev.ctrlKey) {
    
      usingPath.AddElement(state.strokes)
    
      redraw()
    
    }


    if(ev.key ==="&"){
    
    state.isShapeCreationEnabled = false 
    state.SelectMode =  true 
    state.errasermode = false 
    state.dragMode  = false
    state.isStartCreationLine = false
    }

    
  })
  erraser.addEventListener("click",()=>{
    state.errasermode = true
    state.SelectMode = false 

    state.isStartCreationLine = false
    state.isShapeCreationEnabled = false

    container.style.cursor = 'url("./eraser.png") 32 32, auto';
        
          
  })
  pen.addEventListener("click",()=>{
    container.style.cursor = 'crosshair';
    
    state.errasermode = false
    state.SelectMode  = false
    state.isStartCreationLine  = false
    state.isShapeCreationEnabled = false
  })
  SelectCursor.addEventListener("click",()=>{
    
  state.SelectMode = true 
  state.errasermode = false
  state.isShapeCreationEnabled   = false 
  state.isStartCreationLine   = false
  //container.style.cursor = 'grab';
  container.style.cursor = 'Default';
  
  
  
  })
  resetOptions.addEventListener("click",async()=>{
    state.alpha =  0.186
    state.colorline = "#000"
    state.sizeLine = 12
    document.getElementById("percentage").innerText = `${0}%` 

    document.getElementById("size-v").innerHTML = 8
    document.getElementById("smoothing-v").innerHTML =  0.186
    const slider = document.getElementById("size");
    slider.value = slider.defaultValue;
    const slider2 = document.getElementById("smoothing");
    slider2.value = slider2.defaultValue;
    
 

      
   // await zoomLoop();
   


  
    

 
 

  })


// async function delay(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function zoomLoop() {
//    container.style.backgroundSize = `${40}px ${40}px`;
//    console.log(Camera)
//    for (let i = Camera.zoom; i >= 1.0; i -= 0.10) {
//       console.log(i)

//     Camera.zoom = i
 
 
   
//     applyTransform()
//     redraw()
      
//     await delay(16); // wait before next iteration
//   }
//   Camera.zoom = 1 
//   Camera.x = 0
//   Camera.y = 0
//   applyTransform()
//   redraw()
// }




  circle.addEventListener("click",()=>{
    console.log("circle")
    state.isShapeCreationEnabled  = true  
    state.currentShapeType  = "circle"
        container.style.cursor = 'crosshair';

  })

 square.addEventListener("click",()=>{
    
    state.isShapeCreationEnabled  = true  
    state.currentShapeType = "square"
        container.style.cursor = 'crosshair';
  })




download.addEventListener("click",()=>{
    var imagedata = Layer1.toDataURL("image/png");
    downloadlink.href = imagedata;
})




bb.addEventListener("click",()=>{
  //   const startX = 1045;
  // const startY = 576;
   
  // const endX = 1368;
  // const endY = 827; 
  //   DrawStraitghtCurveLine(startX,startY,endX,endY,150)


  for(let [key, value] of state.ConnectionCurves)
  {DrawStraitghtCurveLine(ctx3, value.head.x , value.head.y , value.tail.x ,  value.tail.y ,100)

  }
})
    

// addShapes()

// louta

document.getElementById("color").addEventListener("input",(e)=>{
  console.log(e.target.value)
  state.colorline = e.target.value
  state.isShapeCreationEnabled   = false
  state.isStartCreationLine = false
  
})


CreateCurveLine.addEventListener("click",()=>{
    state.isStartCreationLine  = true
    state.isShapeCreationEnabled  = false

})