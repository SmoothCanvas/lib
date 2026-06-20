
 
import { Colors } from "./Colors.js"
  import { Path } from "./Pathline.js"
  import { shortId } from "./utli.js"

  // background: radial-gradient(ellipse at center, #1a0a2e 0%, #0d0d1a 60%, #050508 100%);
  const container = document.querySelector(".container")
  const Layer1 = document.querySelector("#Layer1")
  const Layer2 = document.querySelector("#Layer2")
  const Layer3 = document.querySelector("#Layer3")
  
  const ctx = Layer1.getContext("2d")
  const ctx2 = Layer2.getContext("2d")
  const ctx3 = Layer3.getContext("2d")
  
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

// point for caash this good idea you going to do it 
// transalate this to svg
// ---------------------------------------------------State---------------------------------------------
// upp
  let state = {
    draw : false , 
    points : [], 
    oldx : 0 , 
    oldy : 0 ,
    sizeLine :8, 
    colorline :"#000000",
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
    DefaultSizex : 100,
    DefaultSizey : 100,
    EdgesShapes : new Map(),

    // start draw entite
    StartCurveEntiteIndex : -1 ,
    isStartCurve : false ,
    startCurve : {x:0,y:0},
    oldPointToCurve : {x:0,y:0},

    // detective state
    FollowState : new Map()
   
    
  }

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
function Paint(currentx,currenty){
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
      
      state.points.push({x :x , y : y , color : state.colorline , size :  state.sizeLine  })
    
      state.oldx = x
      state.oldy = y
}
function applyTransform(){
      ctx.setTransform(
        Camera.zoom * ratio,
        0,
        0,
        Camera.zoom * ratio,
        Camera.x * ratio,
        Camera.y * ratio
      );

       ctx2.setTransform(
        Camera.zoom * ratio,
        0,
        0,
        Camera.zoom * ratio,
        Camera.x * ratio,
        Camera.y * ratio
      );

       ctx3.setTransform(
        Camera.zoom * ratio,
        0,
        0,
        Camera.zoom * ratio,
        Camera.x * ratio,
        Camera.y * ratio
      );


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
         
        applyTransform()   
      
        RenderStrokes()
        RenderShapes()
        
        // drawOctagon(400, 250, 50);  
        // drawPolygon(400, 150, 60, 3, "red");
        // drawStar(800, 350, 70, 35, 5, "gold");
        // drawHeart(150, 100, 50, "red");
        // roundedRect(rc, 120, 15, 80, 80, 15, { fill: 'red' });
}
function RenderStrokes (){
  
     for(let item of state.strokes){
       

         if(item.view){
         for(let i =1 ;i<item.points.length;i++){
              const prev = item.points[i-1]
              const curr  = item.points[i]
              ctx.beginPath();
              ctx.moveTo(prev.x, prev.y);
              ctx.quadraticCurveTo((prev.x+curr.x)/2, (prev.y+curr.y)/2, curr.x, curr.y)
            
              ctx.strokeStyle= item.points[i].color;
              ctx.lineWidth = item.points[i].size;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.stroke();
          }

         }
         

        
        
        }

        

}

function PaintDrawCircle(ctx ,x,y,r){
        ctx.beginPath();
        ctx.arc(x,y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.lineWidth  =  2
        ctx.fill();
        ctx.stroke();
}

 


// function drawArrowEnd(startX, startY, endX, endY , ctx2) {
//   const headLength = 13; // size of arrow

//   // angle of the line
//   const angle = Math.atan2(endY - startY, endX - startX);

//   ctx2.beginPath();
//   ctx2.moveTo(endX, endY);

//   ctx2.lineTo(
//     endX - headLength * Math.cos(angle - Math.PI / 6),
//     endY - headLength * Math.sin(angle - Math.PI / 6)
//   );

//   ctx2.lineTo(
//     endX - headLength * Math.cos(angle + Math.PI / 6),
//     endY - headLength * Math.sin(angle + Math.PI / 6)
//   );

//   ctx2.closePath();
//   ctx2.fillStyle = "black";
//   ctx2.fill();
//drawArrowEnd(((startX+endX)/2)+curve, ((startY+endY)/2)-curve, endX, endY ,ctx2);

// }


function DrawStraitghtCurveLine(startX , startY ,endX  ,  endY , valueOfCurves){

  if(endX!=0 && endY!=0){
     
    let curve = valueOfCurves
    ctx2.beginPath()
    ctx2.lineWidth = 2;
    ctx2.lineCap = "round";
    ctx2.strokeStyle = "black"; 
    ctx2.moveTo(startX,startY);
    let cp1 = ((startX+endX)/2)+curve
    let cp2= ((startY+endY)/2)-curve
    ctx2.quadraticCurveTo(cp1, cp2, endX,endY)
    ctx2.stroke();
  }

  

}
function CreateHtmlElement(x = 0, y = 0) {
  const div = document.createElement("div");

  div.classList.add("Point");
  div.style.position = "absolute";
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
  div.style.transform = `scale(${Camera.zoom})`;
  
  document.body.appendChild(div);

  console.log(div);

 
}
 
  

// sound of drad and drop
function RenderShapes(){

  state.Shapes.forEach((item,index)=>{


            switch(item.typeShape){
                case  "rectangle":{

               


              PaintRectangle(ctx2,item.points.x,item.points.y,item.points.width,item.points.height   ,2,"black") 


              DrawStraitghtCurveLine(
                item.ConnectionBetweenShapes.top.from.startx,
                item.ConnectionBetweenShapes.top.from.startY,
                item.ConnectionBetweenShapes.top.to.endx,
                item.ConnectionBetweenShapes.top.to.endy,
                100)
           // item.chosen
              if(true){ 

                      // PaintRectangle(ctx2,item.points.x-2,item.points.y-2,item.points.width+4,item.points.height+4 ,2,"#3859FF") 

                      const middleTop =    (item.points.x+item.points.width) -(item.points.width)/2
                      const middleBottom = item.points.y+item.points.height
                      const middelHeight = (item.points.y+item.points.height)-(item.points.height)/2
                      const middleRight  = (item.points.x+item.points.width)


                      const marge  = 12
                      let FinallyTop = item.points.height>0?item.points.y-marge :item.points.y+marge
                      let FinallyBottom = item.points.height>0?middleBottom + marge:middleBottom -marge
                      let FinallyLeft = item.points.width>0?item.points.x-marge :item.points.x+marge
                      let FinallyRight =item.points.width>0?middleRight+marge : middleRight-marge
                      
                      // top and bottom
                      PaintDrawCircle(ctx2,middleTop,FinallyTop,20)
                  
                      // PaintDrawCircle(ctx2,middleTop,FinallyBottom,20)
                      // // left and right 
                      // PaintDrawCircle(ctx2,FinallyLeft,middelHeight,20)
                      // PaintDrawCircle(ctx2,FinallyRight,middelHeight,20)
    
                      state.EdgesShapes.set(`top-${index}`,   {index,x :middleTop,y:FinallyTop})
                      // state.EdgesShapes.set(`bottom-${index}`,{index,x :middleTop,y:FinallyBottom})
                      // state.EdgesShapes.set(`left-${index}` , {index,x :FinallyLeft,y:middelHeight})                                  
                      // state.EdgesShapes.set(`right-${index}`, {index,x :FinallyRight,y:middelHeight})

                    //  CreateHtmlElement(middleTop,FinallyTop)

                      
                    
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
function PaintRectangle(ctx,x,y,w,h,lineWidth = 2 , color ="black"){
  
//  rc2.rectangle(item.points.x, item.points.y, item.points.width,item.points.height);
//     ctx.fillStyle = "#87CEEB";
   //   ctx.fillRect(x, y, w, h);
     ctx.beginPath();
     ctx.lineWidth = lineWidth;
     ctx.strokeStyle = color;
     ctx.rect(x,y,w,h);
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
            return value.index
          }


        }

        return -1
}

function oK(v){
  return v!=-1
}
function HasFollow(array){
  return array.length>0
}

const FollowLinkers = (ArrayOfLinkers,stateOfShapes,Currentx , Currenty  ,CurrentEntite , margin)=>{
 //EntiteMove.height>0 ?EntiteMove.y-margin :EntiteMove.y+margin
  ArrayOfLinkers.forEach((LinkId)=>{
    stateOfShapes[LinkId].ConnectionBetweenShapes.top.to.endx = (CurrentEntite.points.x+CurrentEntite.points.width) - (CurrentEntite.points.width/2)
    stateOfShapes[LinkId].ConnectionBetweenShapes.top.to.endy = CurrentEntite.points.height>0?CurrentEntite.points.y - margin  :  CurrentEntite.points.y+margin
  })

}
//------------------------------------------------------------------------------------------------

 
// ---------------------------------------------------Events---------------------------------------------
 
container.addEventListener("mousemove",(e)=>{
  
 

        const {CurrentX,CurrentY} = getCordWordPoint(e)
        const {dx,dy}  = getOffsetDxDy(CurrentX,CurrentY)



        if(state.draw && !state.errasermode && !state.SelectMode  && !state.isShapeCreationEnabled){

            //container.style.cursor = 'url("./controllers/b.png") 3 32, auto' 
            container.style.cursor = 'crosshair';
            Paint(CurrentX,CurrentY)

        }  
        

         if(state.errasermode  && state.draw){
            

             container.style.cursor = 'url("./eraser.png") 32 32, auto' 
             handleStrokeHitDetection(CurrentX,CurrentY,state.strokes)
        
        }
       
        
        //  move item
         
        if(!state.isStartCurve &&!state.isShapeCreationEnabled &&  state.draw && state.SelectMode && state.currentEntite!=-1 && state.currentEntite!=undefined   && state.currentEntite !=null){
            
         
            const EntiteMove = state.Shapes[state.currentEntite].points
            const AllEntiteMove =  state.Shapes[state.currentEntite]
            const ExactConnectionShapesCord =  state.Shapes[state.currentEntite].ConnectionBetweenShapes
            EntiteMove.x+=dx
            EntiteMove.y+=dy
            //Bézier curve
            let margin = 12
            ExactConnectionShapesCord.top.from.startx  = (EntiteMove.x+EntiteMove.width) -  (EntiteMove.width)/2 
            ExactConnectionShapesCord.top.from.startY  = EntiteMove.height>0 ?EntiteMove.y-margin :EntiteMove.y+margin
            
            if(HasFollow(AllEntiteMove.INdexOfPatrner)){
              
              FollowLinkers(AllEntiteMove.INdexOfPatrner ,state.Shapes ,CurrentX,CurrentY  , AllEntiteMove ,margin)
            }
            
               
              
            RestartCanvas(ctx2,Layer2)  
            
            RenderShapes()
            
            SaveOldest.x = CurrentX
            SaveOldest.y = CurrentY
          
    
        }

        if(!state.isStartCurve && state.dragAspectIetms && state.currentEntite !=-1  && !state.isShapeCreationEnabled ){
            const EntiteMove = state.Shapes[state.currentEntite]
            const ExactConnectionShapesCord =  state.Shapes[state.currentEntite].ConnectionBetweenShapes
            const AllEntiteMove =  state.Shapes[state.currentEntite]

            if(EntiteMove.typeShape === "rectangle"){
            
                
               dx>0   ?   
               container.style.cursor = 'nesw-resize'   :  
               container.style.cursor = 'nw-resize' 


               EntiteMove.points.width+=dx
               EntiteMove.points.height+=dy
               //Bézier curve
               let margin = 12
               ExactConnectionShapesCord.top.from.startx  = (EntiteMove.points.x+EntiteMove.points.width) -  (EntiteMove.points.width)/2 
               ExactConnectionShapesCord.top.from.startY  = EntiteMove.points.height>0 ?EntiteMove.points.y-margin :EntiteMove.points.y+margin
                
               if(HasFollow(AllEntiteMove.INdexOfPatrner)){
               
                FollowLinkers(AllEntiteMove.INdexOfPatrner ,state.Shapes ,CurrentX,CurrentY  , AllEntiteMove ,margin)
               }
              

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


        // start curve
        
        if(state.isStartCurve && state.draw){
          const DistanceX = Math.abs(CurrentX - state.startCurve.x);
      
          const curve = Math.max(40, Math.min(150, DistanceX * 0.5));

          RestartCanvas(ctx2,Layer2)
         // DrawStraitghtCurveLine(state.startCurve.x,state.startCurve.y,CurrentX,CurrentY,curve)
          
          state.Shapes[state.StartCurveEntiteIndex].ConnectionBetweenShapes.top.to.endx  = CurrentX
          state.Shapes[state.StartCurveEntiteIndex].ConnectionBetweenShapes.top.to.endy  = CurrentY

          state.oldPointToCurve.x = CurrentX
          state.oldPointToCurve.y = CurrentY

       
          
          RenderShapes()
        }
        

  })




 


container.addEventListener("mousedown",(e)=>{
 // work
      const {CurrentX,CurrentY} = getCordWordPoint(e)
     
      SaveOldest.x  = CurrentX
      SaveOldest.y  = CurrentY


      if(e.button==state.LEFTBUTTONMOUSE)   {


            if(!state.SelectMode && !state.errasermode && !state.isShapeCreationEnabled)  state.points.push({x :CurrentX , y : CurrentY , color : state.colorline , size :  state.sizeLine  })
            state.draw = true
            state.oldx = CurrentX 
            state.oldy = CurrentY
            
 
      }

 

      if(state.errasermode ){
         
        handleStrokeHitDetection(CurrentX,CurrentY,state.strokes)
      }
      
      if(state.SelectMode  && state.draw){
       
    
        const IndexEntite =  HandelShapesDectection(CurrentX,CurrentY,state.Shapes)
        state.currentEntite = IndexEntite   
       
        if(IndexEntite!=-1){
          console.log(IndexEntite,"<== this Select  Normalle mode  item")
          state.Shapes[IndexEntite].chosen = true 
          RenderShapes()
          container.style.cursor = 'grabbing'
        }
        

      }

      if(e.button === state.RIGHTBUTTONMOUE &&  state.SelectMode ){
        
        const IndexEntite =  HandelShapesDectection(CurrentX,CurrentY,state.Shapes)
        state.currentEntite = IndexEntite   
        state.dragAspectIetms = true 
       
        
      }

      if(state.isShapeCreationEnabled){
        
       
        state.firstCordShapes.x  = CurrentX
        state.firstCordShapes.y  = CurrentY
      }



       
      // for Handel that small circle
      
   
      if(state.SelectMode){
           const IndexEntite2 = IsOverTheCircle( CurrentX, CurrentY, state.EdgesShapes)
           
           if(IndexEntite2!=-1){


             console.log(IndexEntite2,"<== this current item by red circle")
 
           
 
            state.Shapes[IndexEntite2].ConnectionBetweenShapes.top.from.startx  = CurrentX
            state.Shapes[IndexEntite2].ConnectionBetweenShapes.top.from.startY  = CurrentY
          

             // and redraw all this in this case
            state.startCurve.x = CurrentX
            state.startCurve.y = CurrentY
            state.isStartCurve = true
            state.StartCurveEntiteIndex = IndexEntite2
           }

           
           else{
                  state.isStartCurve =false
           }
           
        
       
      }

  
 
    
  })
  function isDuplicate(v,arr){
     
    for(let i = 0;i<arr.length;i++){
      if(arr[i]==v){
        return false 
      }
    }
    return true
  }

function ClearNodesEdges(index){
          state.Shapes[index].ConnectionBetweenShapes.top.from.startx = 0
          state.Shapes[index].ConnectionBetweenShapes.top.from.startY = 0
          state.Shapes[index].ConnectionBetweenShapes.top.to.endx = 0
          state.Shapes[index].ConnectionBetweenShapes.top.to.endy = 0
}

function ClearIndex(FatherIndex,indexOut){
       state.FollowState.delete(FatherIndex)
       state.FollowState.delete(indexOut)
}

function CleanUpNodes(FatherIndex , indexOut){
       state.Shapes[FatherIndex].INdexOfPatrner = state.Shapes[FatherIndex].INdexOfPatrner.filter((id)=>id!=indexOut)
       console.log("indexOut",indexOut,"FatherIndex",FatherIndex)
   
       // ClearNodesEdges(FatherIndex)
       ClearIndex(FatherIndex ,indexOut )
 
   
   

  }
  function HasApartner(MapNodes,  indexEntite){
     return MapNodes.has(indexEntite)
  }
  container.addEventListener("mouseup",(e)=>{
    //w2
      const {CurrentX,CurrentY} = getCordWordPoint(e)
      
      state.draw = false
      state.cursormode = false   
      state.dragAspectIetms = false
      if(state.SelectMode){
        container.style.cursor = 'default' 
      } 
    
      if(state.isStartCurve){
     
        const isInTopOfOtherSqaure  = IsOverTheCircle( CurrentX, CurrentY, state.EdgesShapes )

     
        if(oK(isInTopOfOtherSqaure) && (isInTopOfOtherSqaure!=state.StartCurveEntiteIndex)){

         
           if(HasApartner(state.FollowState,state.StartCurveEntiteIndex)){
             const idPartner = state.FollowState.get(state.StartCurveEntiteIndex)
             CleanUpNodes(idPartner ,state.StartCurveEntiteIndex )
         
           }
          
            state.FollowState.set(state.StartCurveEntiteIndex,isInTopOfOtherSqaure)
        
       
       
           if(isDuplicate(state.StartCurveEntiteIndex , state.Shapes[isInTopOfOtherSqaure].INdexOfPatrner )){
                  state.Shapes[isInTopOfOtherSqaure].INdexOfPatrner.push(state.StartCurveEntiteIndex)
            }
            
          

        }
        else{
          console.log(`Current entite ${state.StartCurveEntiteIndex} and Father have you and should remove from it is ${state.FollowState.get(state.StartCurveEntiteIndex)}`)

           CleanUpNodes(state.FollowState.get(state.StartCurveEntiteIndex),state.StartCurveEntiteIndex)
        }
    

        //PaintDrawCircle(ctx2,state.oldPointToCurve.x,state.oldPointToCurve.y,20)
           

        
      
        state.isStartCurve = false
        state.oldPointToCurve.x = 0
        state.oldPointToCurve.y = 0
      }
  

      
       


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


      state.DefaultSizex = 100
      state.DefaultSizey  = 100
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

   

       
      vacuum()
     
    console.log(state.Shapes)
      
  })


container.addEventListener("contextmenu",(e)=>{
    e.preventDefault()
  
  
  
  
  })


Layer1.addEventListener("wheel", (e) => {
    e.preventDefault()

    const zoomSpeed = 0.001
    
    const newZoom = Math.max(0.1, Camera.zoom + -e.deltaY * zoomSpeed)

    const rect = Layer1.getBoundingClientRect()

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
  
    
    applyTransform()
    redraw()
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
    
  })
  erraser.addEventListener("click",()=>{
    state.errasermode = true
    state.SelectMode = false 
    state.isShapeCreationEnabled = false
    container.style.cursor = 'url("./eraser.png") 32 32, auto';
        
          
  })
  pen.addEventListener("click",()=>{
  container.style.cursor = 'crosshair';
    state.errasermode = false
    state.SelectMode  = false
    state.isShapeCreationEnabled = false
  })
  SelectCursor.addEventListener("click",()=>{
    
  state.SelectMode = true 
  state.errasermode = false
  state.isShapeCreationEnabled   = false 
  //container.style.cursor = 'grab';
  container.style.cursor = 'Default';
  
  
  
  })
  resetOptions.addEventListener("click",()=>{
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
  

  })

  circle.addEventListener("click",()=>{
    console.log("circle")
    state.isShapeCreationEnabled  = true  
    state.currentShapeType  = "circle"
        container.style.cursor = 'crosshair';

  })

 square.addEventListener("click",()=>{
    console.log("square")
    state.isShapeCreationEnabled  = true  
    state.currentShapeType = "square"
        container.style.cursor = 'crosshair';
  })




download.addEventListener("click",()=>{
    var imagedata = Layer1.toDataURL("image/png");
    downloadlink.href = imagedata;
})


bb.addEventListener("click",()=>{
    const startX = 1045;
  const startY = 576;
   
  const endX = 1368;
  const endY = 827; 
    DrawStraitghtCurveLine(startX,startY,endX,endY,150)
})
    

// addShapes()

// louta

document.getElementById("color").addEventListener("input",(e)=>{
  console.log(e.target.value)
  state.colorline = e.target.value
})