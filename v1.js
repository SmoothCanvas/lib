
import { Colors } from "./Colors.js"

 
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


let state = {
  draw : false , 
  points : [], 
  oldx : 0 , 
  oldy : 0 ,
  sizeLine :12, 
  colorline :"#000",
  timer : null , 
  alpha : 0.186,
  dx :0 ,
  dy : 0 ,
  strokes  : [] , 
  cursormode : false
}

 
const Camera = {
  x : 0 , 
  y : 0 ,  
  zoom :1
}

 
 
//  colorline :"#f81788",
 
 


let SaveOldest =  {x : 0 , y :0}

container.style.cursor = 'url("./controllers/gg.png") 4 32, auto';

   
resetOptions.addEventListener("click",()=>{
  state.alpha =  0.186
  state.colorline = "#000"
  state.sizeLine = 12
  document.getElementById("percentage").innerText = `${0}%` 

  document.getElementById("size-v").innerHTML = 8
  document.getElementById("smoothing-v").innerHTML = 0.29
  const slider = document.getElementById("size");
  slider.value = slider.defaultValue;
  const slider2 = document.getElementById("smoothing");
  slider2.value = slider2.defaultValue;
 

})

 

function UpdateBoundries() {
  const refBound = container.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  Layer1.width = refBound.width * ratio;
  Layer1.height = refBound.height * ratio;
 
  
  ctx.setTransform(Camera.zoom,0,0,Camera.zoom,Camera.x,Camera.y)
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



 
 
 
function redraw(){

     
      ctx.save()
      ctx.setTransform(1,0,0,1,0,0)
      ctx.clearRect(0,0,Layer1.width,Layer1.height)
      ctx.restore()

   
      for(let i= 1;i<state.strokes.length;i++){
        const prev = state.strokes[i-1]
        const curr =  state.strokes[i]
        
        if(state.strokes[i]==="#")  continue
   
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.quadraticCurveTo((prev.x+curr.x)/2, (prev.y+curr.y)/2, curr.x, curr.y)
          
            ctx.strokeStyle= state.strokes[i].color;
            ctx.lineWidth = state.strokes[i].size;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.stroke();

      }

 


  
 


}

 
container.addEventListener("mousemove",(e)=>{
 
 

  
 
      const {clientX,clientY} = e 
      const rect = e.currentTarget.getBoundingClientRect();



      if(state.draw){
    
          
          const CurrentX  =  ((clientX-rect.left)-Camera.x)/Camera.zoom
          const CurrentY  =  ((clientY-rect.top)-Camera.y)/Camera.zoom

 

          Paint(CurrentX,CurrentY)
      }
      


 })





const observer = new ResizeObserver(() => {
 
 
  UpdateBoundries()
  redraw()


});


container.addEventListener("mousedown",(e)=>{
     const {clientX,clientY} = e 
    if(e.button==0)   {


    const contSize = e.currentTarget.getBoundingClientRect();
    const x  =(( clientX-contSize.left)-Camera.x)  /Camera.zoom
    const y =  ((clientY-contSize.top)-Camera.y)  /Camera.zoom
   
    state.points.push({x :x , y : y , color : state.colorline , size :  state.sizeLine  })
   
    
    state.oldx = x 
    state.oldy = y 
    state.draw = true
      
    }else{
      const contSize = e.currentTarget.getBoundingClientRect();
      const x  =( clientX-contSize.left)
      const y =  (clientY-contSize.top)
      state.cursormode   = true
      SaveOldest.x  = x 
      SaveOldest.y  = y
      state.oldx = x 
      state.oldy = y 
       
    }
   
})
container.addEventListener("mouseup",(e)=>{
    
     state.draw = false
     state.cursormode = false   
   
  
     state.strokes.push(...state.points ,"#")
   
     state.points = []
     console.log(state.strokes)
 
   

})


observer.observe(container)


 

 

function HandelZoom(zom  , camerax , cameray){
      
     
      ctx.save()
      ctx.setTransform(1,0,0,1,0,0)
      ctx.clearRect(0,0,Layer1.width,Layer1.height)
      ctx.restore()
      ctx.setTransform(zom,0,0,zom,camerax,cameray)
}
 
 
 
  
 
 

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
  console.log(newZoom*100,"%")
  document.getElementById("percentage").innerText = `${newZoom.toFixed(2)}%`
  // keep mouse fixed in world
  Camera.x = mx - wx * Camera.zoom
  Camera.y = my - wy * Camera.zoom

  ctx.setTransform(Camera.zoom, 0, 0, Camera.zoom, Camera.x, Camera.y)

  redraw()
})

 
 
 

window.getcolor  =  (color)=>{
 state.colorline =  color
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