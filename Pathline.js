export class Path {

    constructor(){
        this.undo = []
    }

    RemoveLastElement(array){
        const element = array.pop()
        if(element=="#" && element!=undefined){
            array.pop()
            this.undo.push(element)
     
        }else{
            
            
          if(element!=undefined)  this.undo.push(element)
          
        } 
        
    }



    AddElement(array){
        const element = this.undo.pop()
        if(element=="#"  && element!=undefined){
        array.push(element)
        const Otherone = this.undo.pop()
        array.push(Otherone)
        }else{
           if(element!=undefined) array.push(element)
        }
    }

}