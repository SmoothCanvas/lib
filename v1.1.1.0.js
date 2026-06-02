
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
    cursormode : false,
    errasermode : false,
    SelectMode :  false ,
    LockDragging : false ,
    CurrentItemIndex  : null,
    aspectChange  : false ,
    localIndexSelecting  : null 
    
  }

  let ratio  = 1   ;
  
  const Camera = {
    x : 0 , 
    y : 0 ,  
    zoom :1
  }

 
  // adjust the icon and build magique thing for make your freind study with you 
  // add all touch point addjusment
  const rc = rough.canvas(document.getElementById('Layer1'));
 


  let SaveOldest =  {x : 0 , y :0}

  // container.style.cursor = 'url("./controllers/gg.png") 4 32, auto';
  container.style.cursor = 'crosshair';


        // ctx.beginPath();
        // ctx.lineWidth = "3";
        // ctx.strokeStyle = "#9BACFF";
        // ctx.rect(x, y, width+2, height+2);
        // ctx.stroke();

  
    
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

       console.log("----------")
    
        ctx.save()
        ctx.setTransform(1,0,0,1,0,0)
        ctx.clearRect(0,0,Layer1.width,Layer1.height)
        ctx.restore()
        applyTransform()  // say it here  <div class="toolBar" style="position: absolute; transform: translate(px, 0px);"> 
              
        for(let item of state.strokes){
          if(item.view){

            if(item.type =="Shape"){
         
               rc.rectangle(item.points.x, item.points.y, item.points.width, item.points.height, { fill: item.points.color})
               if(item.isCurrentSelect){
                DrawBorderToTheObject(ctx,item.points.x,item.points.y , item.points.width, item.points.height)
             
                let CreateShape  = `
                <div class="toolBar" id="xxx" style="transform: scale(${Camera.zoom});">
                <button>Duplicate</button><button>edit</button> <button>delete</button>
                </div>`
                
                document.getElementById("tool-bar").innerHTML = CreateShape
                const  tools = document.getElementById("tool-bar")
                const toolsHeight = tools.offsetHeight 
                const toolsWidth  = tools.offsetWidth
                tools.style.top   = `${item.points.y-toolsHeight-8}px`
                tools.style.left = `${item.points.x + (item.points.width / 2) - (toolsWidth / 2)}px`
               }
             
            
            }

            else if(item.type ==="stroke"){

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
         
        }

  //  drawImage(ctx,"https://picsum.photos/id/237/200/300" ,Layer1.width/2 , Layer1.height/2 , 200,200)
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

      if(element.view  && element.type ==="Shape"){
        const {x,y,width,height} = element.points
        const left = x  
        const top = y
        const right = left + width
        const bottom = top + height

         if(curx>=x   && curx<=x+width && curry>=y && curry<=y+height ) {
          usingPath.PushElementFromErraser(element)
          element.view = false
          redraw()
           
         } 


      }
      
   
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
  
  
        

    });
    console.log("------------")
}
const  handleShapeHitDetection =  (CurrentX, CurrentY, StrokesOfArray) => {
   

    
    StrokesOfArray.forEach((element,index)=>{
     

    if(element.view && element.type==="Shape" && !state.LockDragging ){ 
    
      const dx  = element.points.x - CurrentX
      const dy = element.points.y- CurrentY

      
    
      const {x,y,width,height} = element.points
      const left = x  
      const top = y
      const right = left + width
      const bottom = top + height
     // console.log({CurrentX:CurrentX,CurrentY : CurrentY} ,"left",left,"right",right ,"top",top,"bottom",bottom)
  
      if(CurrentX>=left && CurrentX<=right && CurrentY>=top && CurrentY<=bottom ) {
        //console.log("Youn Holding Shape   ✅",element ,"index",index)  
        container.style.cursor = 'grabbing';
        state.CurrentItemIndex = index
        state.LockDragging = true
        

        
      
      } 
    
    } 

    })
} 
const vacuum  =    ()=>{
 
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
//---------------------------------------------------functions---------------------------------------------

 
// next featurrs is bring shapes
// do sext icon
  
container.addEventListener("mousemove",(e)=>{
  
 

        const {CurrentX,CurrentY} = getCordWordPoint(e)
 
        const {dx,dy}  = getOffsetDxDy(CurrentX,CurrentY)

        if(state.draw && !state.errasermode && !state.SelectMode){
            container.style.cursor = 'crosshair';
            Paint(CurrentX,CurrentY)
        }  
        
        else if(state.errasermode  && state.draw){
        
          container.style.cursor = 'url("./eraser.png") 32 32, auto';
          handleStrokeHitDetection(CurrentX, CurrentY, state.strokes)
        

        }
      

        else if(state.SelectMode  && state.draw  && !state.errasermode && state.CurrentItemIndex!=null ) 
        {
        
            //state.CurrentItemIndex!=null  down not working
 
            // ctx.restore()
            // ctx.beginPath();
            // ctx.arc(CurrentX, CurrentY, Camera.zoom, 0, 2 * Math.PI);
            // ctx.stroke();
            // ctx.save()
 
         

   
               
            let {x,y,width,height}   = state.strokes[state.CurrentItemIndex].points 
        
            
            
            handleShapeHitDetection(CurrentX, CurrentY, state.strokes)
      
    

            state.strokes[state.CurrentItemIndex].points.x+=dx
            state.strokes[state.CurrentItemIndex].points.y+=dy
            redraw()
            SaveOldest.x  = CurrentX
            SaveOldest.y = CurrentY


        }
        else if(  state.aspectChange ){
          //For changne aspect width and height
          handleShapeHitDetection(CurrentX, CurrentY, state.strokes)
          
          if( state.CurrentItemIndex!=null){
          
            state.strokes[state.CurrentItemIndex].points.width+=dx
            state.strokes[state.CurrentItemIndex].points.height+=dy
            redraw()
            SaveOldest.x  = CurrentX
            SaveOldest.y = CurrentY
           }


        }
        


  })





  const observer = new ResizeObserver(() => {
  
 
    UpdateBoundries()
    redraw()


  });




  container.addEventListener("mousedown",(e)=>{
 
      const {CurrentX,CurrentY} = getCordWordPoint(e)



      if(e.button==0  )   {

      if(!state.SelectMode && !state.errasermode)  state.points.push({x :CurrentX , y : CurrentY , color : state.colorline , size :  state.sizeLine  })

      state.oldx = CurrentX 
      state.oldy = CurrentY
      state.draw = true
      state.cursormode   = true
      SaveOldest.x  = CurrentX
      SaveOldest.y  = CurrentY
      }else{
        // const contSize = e.currentTarget.getBoundingClientRect();
        // const x =  (e.clientX-contSize.left)
        // const y =  (e.clientY-contSize.top)
        // state.cursormode   = true
        // SaveOldest.x  = x 
        // SaveOldest.y  = y
        // state.oldx = x 
        // state.oldy = y 

        //  const {CurrentX,CurrentY} = getCordWordPoint(e)
        //  console.log(CurrentX,CurrentY,"<=== first thing mount")
        //  state.cursormode   = true
        //  SaveOldest.x  = CurrentX
        //  SaveOldest.y  = CurrentY

        SaveOldest.x  = CurrentX
        SaveOldest.y  = CurrentY
        state.aspectChange = true

        console.log("edit mode here")
      }

      if(state.SelectMode && e.button==0){
           
           handleShapeHitDetection(CurrentX, CurrentY, state.strokes)
        
           if(state.CurrentItemIndex!=null) {

          //  if(state.CurrentItemIndex === state.localIndexSelecting) {
             
          //     state.strokes[state.CurrentItemIndex].isCurrentSelect = true
          //     redraw()
          //     return
          //  }

           if(state.localIndexSelecting!=null )  {
              state.strokes[state.localIndexSelecting].isCurrentSelect = false
              
            }
            
     

            state.strokes[state.CurrentItemIndex].isCurrentSelect = true
            state.localIndexSelecting = state.CurrentItemIndex
            redraw()
           
           }else{
            
                document.getElementById("xxx")?.remove() 
                state.strokes.forEach((item)=>{ item.isCurrentSelect = false })
                redraw()
                  
              
          
           }

           

      state.strokes.map((item)=>console.log(item))
      }

    
      
      
    
    
  })


  container.addEventListener("mouseup",(e)=>{
      
      state.draw = false
      state.cursormode = false   
      state.CurrentItemIndex = null
      state.LockDragging = false
      state.aspectChange = false
  
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

      if(state.SelectMode){
         container.style.cursor = 'grab';
      }

      // haha this inspire from background  PostgreSql
      vacuum()
    
   
  })


  observer.observe(container)



  

  
  
  
  
    
  
  

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

  
  
  

  window.getcolor  =  (color)=>{
  state.colorline =  color
  state.cursormode = false 
  state.errasermode = false 
  state.SelectMode = false
  state.LockDragging = false
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






  function addShapes(){
  
  state.strokes.push({
  id: shortId(6),
  
  type: "Shape",
  isCurrentSelect  : false  ,
  points: { x: 500, y: 400, width: 200, height: 200, color: "green" },
  view: true
})

 

state.strokes.push({
  id: shortId(6),
  type: "Shape",
  isCurrentSelect  : false ,
  points: { x: 260, y: 160, width: 120, height: 120, color: "red"  },
  view: true
})

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 340, y: 190, width: 120, height: 120, color: "orange" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 420, y: 220, width: 120, height: 120, color: "purple" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 500, y: 250, width: 120, height: 120, color: "cyan" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 580, y: 280, width: 120, height: 120, color: "pink" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 660, y: 310, width: 120, height: 120, color: "yellow" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 740, y: 340, width: 120, height: 120, color: "lime" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 820, y: 370, width: 120, height: 120, color: "teal" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 140, y: 420, width: 120, height: 120, color: "brown" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 220, y: 450, width: 120, height: 120, color: "magenta" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 300, y: 480, width: 120, height: 120, color: "navy" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 380, y: 510, width: 120, height: 120, color: "gold" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 460, y: 540, width: 120, height: 120, color: "silver" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 540, y: 570, width: 120, height: 120, color: "coral" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 620, y: 600, width: 120, height: 120, color: "indigo" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 700, y: 630, width: 120, height: 120, color: "violet" },
//   view: true
// })

// state.strokes.push({
//   id: shortId(6),
//   type: "Shape",
//   points: { x: 780, y: 660, width: 120, height: 120, color: "crimson" },
//   view: true
// })

state.strokes.push({
  id: shortId(6),
  type: "Shape",
  isCurrentSelect  : false ,
  points: { x: 860, y: 690, width: 120, height: 120, color: "blue"  },
  view: true
})
    

  }
  


    

addShapes()