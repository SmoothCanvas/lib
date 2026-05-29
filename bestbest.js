
  import { Colors } from "./Colors.js"
  import { Path } from "./Pathline.js"
  import { shortId } from "./utli.js"
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
    sizeLine :12, 
    colorline :"#000",
    alpha :  0.186,//0.186
    dx :0 ,
    dy : 0 ,
    strokes  : [] , 
    cursormode : false,
    errasermode : false,
    SelectMode :  false ,
    LockDragging : false 
    
  }

  let ratio   ;
  
  const Camera = {
    x : 0 , 
    y : 0 ,  
    zoom :1
  }

  
  
  const rc = rough.canvas(document.getElementById('Layer1'));
  console.log(rc)
  


  let SaveOldest =  {x : 0 , y :0}

  // container.style.cursor = 'url("./controllers/gg.png") 4 32, auto';
  container.style.cursor = 'crosshair';

    
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

  

  function UpdateBoundries() {
    const refBound = container.getBoundingClientRect();
    ratio = window.devicePixelRatio || 1;
    
    Layer1.width = refBound.width * ratio;
    Layer1.height = refBound.height * ratio;
  
    
    ctx.setTransform(Camera.zoom*ratio,0,0,Camera.zoom*ratio,Camera.x,Camera.y)

    
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

      
        for(let item of state.strokes){

    if(item.view){

        switch(item.type){


           case "Shape":{
             ctx.beginPath()
             ctx.fillStyle = "red";
             ctx.rect(item.points.x, item.points.y, item.points.width, item.points.height);
             ctx.stroke();
             break

          }


           case "stroke":{
              
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
              ctx.stroke() 
           }
             break
          }
         }



         

          }
          
    
        }


  }

  

  const HandelDitectHitting = (curx,curry,arrayOfStrokes)=>{
    console.log(arrayOfStrokes)
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
        

    });

  }

  const  HandelDitectHittingShapes =  (CurrentX, CurrentY, StrokesOfArray) => {


    
    StrokesOfArray.forEach(element=>{

    if(element.view && element.type==="Shape")

    { 
    
      const dx  = element.points.x - CurrentX
      const dy = element.points.y- CurrentY

      
    
    const {x,y,width,height} = element.points
    
      const left = x  
      const top = y
      const right = left + width
      const bottom = top + height
      console.log({CurrentX:CurrentX,CurrentY : CurrentY} ,"left",left,"right",right ,"top",top,"bottom",bottom)
  
      if(CurrentX>left && CurrentX<right && CurrentY>top && CurrentY<bottom ) {
        console.log("Youn Holding Shape")  
      
      }
    
    } 

    })
  } 
  
  
  container.addEventListener("mousemove",(e)=>{
  
  

    
  
        const {clientX,clientY} = e 
        const rect = e.currentTarget.getBoundingClientRect();


        const CurrentX  =  ((clientX-rect.left)-Camera.x)/Camera.zoom
        const CurrentY  =  ((clientY-rect.top)-Camera.y)/Camera.zoom

        if(state.draw && !state.errasermode && !state.SelectMode){
            container.style.cursor = 'crosshair';
            Paint(CurrentX,CurrentY)
        }  
        
        else if(state.errasermode  && state.draw){
          
          container.style.cursor = 'url("./eraser.png") 32 32, auto';
          HandelDitectHitting(CurrentX, CurrentY, state.strokes)
        

        }

        else if(state.SelectMode  && state.draw  && !state.errasermode) 
        {
        
          HandelDitectHittingShapes(CurrentX, CurrentY, state.strokes)

        }
        


  })





  const observer = new ResizeObserver(() => {
  
  
    UpdateBoundries()
    redraw()


  });




  container.addEventListener("mousedown",(e)=>{
      const {clientX,clientY} = e 
      const contSize = e.currentTarget.getBoundingClientRect();
      const x  = (( clientX-contSize.left)-Camera.x)  /Camera.zoom
      const y  =  ((clientY-contSize.top)-Camera.y)  /Camera.zoom

      if(e.button==0)   {

      state.points.push({x :x , y : y , color : state.colorline , size :  state.sizeLine  })
      state.oldx = x 
      state.oldy = y 
      state.draw = true
        
      }else{
        const contSize = e.currentTarget.getBoundingClientRect();
        const x =  (clientX-contSize.left)
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
    
    

  })


  observer.observe(container)


  container.addEventListener("resize",()=>{
    
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
  
    ctx.setTransform(Camera.zoom*ratio, 0, 0, Camera.zoom*ratio, Camera.x, Camera.y)
    
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
    container.style.cursor = 'url("./controllers/cursor.png") 4 32, auto';
  
  })






  function addShapes(){
  
      state.strokes.push({
      id:shortId(6),
      type :"Shape",
      points : {x:600,y:200 ,  width : 200 , height:200 },
      view : true
    })


    
    //   state.strokes.push({
    //   id:shortId(6),
    //   type :"Shape",
    //   points : {x:500,y:799 ,  width : 100 , height:100/2 },
    //   view : true
    // })


  }
  



  //  util function mabe use i 

  // function getScaledCoordinates(x, y, width, height, zoomScale) {
  //     const left = x / zoomScale;
  //     const top = y / zoomScale;
  //     const right = left + (width / zoomScale);
  //     const bottom = top + (height / zoomScale);

  //     return { left, top, right, bottom };
  // }

  // // Example usage:
  // const rectCoords = getScaledCoordinates(100, 100, 200, 150, 2);
  // console.log(rectCoords); 
  // // Output: { left: 50, top: 50, right: 150, bottom: 125 

  addShapes()