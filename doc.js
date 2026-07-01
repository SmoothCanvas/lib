    RestartCanvas(ctx1.current,Layer1.current)
        
   
        let v = State.Strokes[0].points
        // for smooth you can add alpha 0.45
        v.forEach(offset => {
            offset.x+=dx*0.45
            offset.y+=dy*0.45
            
        });

        
        for(let i=1;i<v.length;i++){

            let prev = v[i-1]
            let curr = v[i]
            HandelDraw(
                ctx1.current,
                prev.x,
                curr.x,
                prev.y,
                curr.y,
                State.ParamsStroke.PenColor,
                State.ParamsStroke.sizePen,
                
                
            )
        }