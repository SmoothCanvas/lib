
  import { Colors } from "./Colors.js"
  import { Path } from "./Pathline.js"
  import { shortId } from "./utli.js"

  // background: radial-gradient(ellipse at center, #1a0a2e 0%, #0d0d1a 60%, #050508 100%);
  const container = document.querySelector(".container")
  const Layer1 = document.querySelector("#Layer1")
  const ctx = Layer1.getContext("2d")
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
 
// point for caash this good idea you going to do it 

// ---------------------------------------------------State---------------------------------------------

  let state = {
    draw : false , 
    points : [], 
    oldx : 0 , 
    oldy : 0 ,
    sizeLine :8, 
    colorline :"#000",
    alpha :  0.183, 
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
    currentEntite  : -1
   
    
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
container.style.cursor = 'crosshair';



// ---------------------------------------------------functions---------------------------------------------

function UpdateBoundries() {
    const refBound = container.getBoundingClientRect();
    ratio = window.devicePixelRatio || 1;   
    
    Layer1.width = refBound.width * ratio;
    Layer1.height = refBound.height * ratio;
  
    
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
}
function redraw(){

    
    
        ctx.save()
        ctx.setTransform(1,0,0,1,0,0)
        ctx.clearRect(0,0,Layer1.width,Layer1.height)
        ctx.restore()
        applyTransform()   
        // RendersStrokes
        RenderStrokes()
        RenderShapes()
      

 
}


function RenderStrokes (){
  
     for(let item of state.strokes){
       

 
         
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
          }}

        

}

function RenderShapes(){
     for(let item of state.Shapes){
      rc.rectangle(item.points.x, item.points.y, item.points.width,item.points.height); 
    } 

 
}

function getCordWordPoint(e){
   const rect = e.currentTarget.getBoundingClientRect()
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
          const radius = 17 /Camera.zoom
          

          const match = Math.sqrt(dx*dx + dy*dy)<=radius
        
          if(match){
          
            element.view = false
            usingPath.PushElementFromErraser(element)
            redraw()

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
  isCurrentSelect  : false  ,
  points: { x: 500, y: 400, width: 200, height: 200, color: "green" },
  view: true
})

 

state.Shapes.push({
  id: shortId(6),
  type: "Shape",
  isCurrentSelect  : false ,
  points: { x: 700, y: 700, width: 120, height: 120, color: "red"  },
  view: true
})

 
// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   isCurrentSelect  : false ,
//   points: { x: 860, y: 690, width: 120, height: 120, color: "blue"  },
//   view: true
// })
    

  }
let  HandelShapesDectection = function(currx,curry,arrayOfStrokes){


 
return arrayOfStrokes.findIndex((item)=>item.type=="Shape" &&  (currx>=item.points.x  && currx<=item.points.x+item.points.width  && curry>=item.points.y && curry<=item.points.y+item.points.height))


  
}



//------------------------------------------------------------------------------------------------

 

// ---------------------------------------------------Events---------------------------------------------
 
container.addEventListener("mousemove",(e)=>{
  
 

        const {CurrentX,CurrentY} = getCordWordPoint(e)
 
        const {dx,dy}  = getOffsetDxDy(CurrentX,CurrentY)

        if(state.draw && !state.errasermode && !state.SelectMode ){
            container.style.cursor = 'crosshair';
            Paint(CurrentX,CurrentY)
        }  
        
         if(state.errasermode  && state.draw){
          container.style.cursor = 'url("./eraser.png") 32 32, auto' 
          handleStrokeHitDetection(CurrentX,CurrentY,state.strokes)
        
        }
     // tell chatgpt about this 
         
        if(state.draw && state.SelectMode && state.currentEntite!=-1 && state.currentEntite!=undefined   && state.currentEntite !=null){
            
            console.log({CurrentX,CurrentY})
            const EntiteMove = state.Shapes[state.currentEntite].points
            EntiteMove.x+=dx
            EntiteMove.y+=dy
            
            
            // ctx.clearRect(EntiteMove.x, EntiteMove.y,EntiteMove.width,EntiteMove.height);
            rc.rectangle(EntiteMove.x, EntiteMove.y,EntiteMove.width,EntiteMove.height);  
              
                ctx.save()
                ctx.setTransform(1,0,0,1,0,0)
                ctx.clearRect(0,0,Layer1.width,Layer1.height)
                ctx.restore()

                RenderShapes()
            
            SaveOldest.x = CurrentX
            SaveOldest.y = CurrentY
          
    
        }
         
        


  })








container.addEventListener("mousedown",(e)=>{
 
      const {CurrentX,CurrentY} = getCordWordPoint(e)
      SaveOldest.x  = CurrentX
      SaveOldest.y  = CurrentY


      if(e.button==state.LEFTBUTTONMOUSE)   {


            if(!state.SelectMode && !state.errasermode)  state.points.push({x :CurrentX , y : CurrentY , color : state.colorline , size :  state.sizeLine  })
            state.draw = true
            state.oldx = CurrentX 
            state.oldy = CurrentY
            
 
      }

 

      if(state.errasermode ){
     
        handleStrokeHitDetection(CurrentX,CurrentY,state.strokes)
      }
      
      if(state.SelectMode  && state.draw){
    
    
        const IndexEntite =  HandelShapesDectection(CurrentX,CurrentY,state.Shapes)
        state.currentEntite = IndexEntite  // i did this for dynamic take the right index or -1 and in 
        console.log(IndexEntite)
        //  mouse down do the check ahhha it come to my mind for the first time when the mouse up 
        // make the indexEnttite  -1 and i get this idea and do it dynamiclly 

        // if(IndexEntite!=-1){
        //   console.log("we catch item",IndexEntite)
        //   state.currentEntite = IndexEntite
        // }
        // else{
        //   console.log("you   click in wrong state ?")
        // }
      }




 
    
  })

  container.addEventListener("mouseup",(e)=>{
      
      state.draw = false
      state.cursormode = false   
   
      // container.style.cursor = 'grab' 
  
      if(!state.errasermode && state.points.length>1){
        state.strokes.push({
          id:shortId(6),
          type :"stroke",
          points : state.points,
          view : true
        })
        state.points = []
        console.log(state.strokes)
        
  
      }

  

       
      vacuum()
      redraw()
     
   
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
    Camera.x = mx - wx * Camera.zoom
    Camera.y = my - wy * Camera.zoom
  
    
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

    document.getElementById("percentage").innerText = `${0}%`
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
    container.style.cursor = 'url("./eraser.png") 32 32, auto';
        
          
  })
  pen.addEventListener("click",()=>{
  container.style.cursor = 'crosshair';
    state.errasermode = false
    state.SelectMode  = false
  })
  SelectCursor.addEventListener("click",()=>{
  state.SelectMode = true 
  state.errasermode = false
  container.style.cursor = 'grab';
  
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









    

addShapes()