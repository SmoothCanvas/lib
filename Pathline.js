export class Path {

    constructor(){
        this.undo = []
    }

    RemoveLastElement(array){
        const element = array.pop()
        if(element!=undefined)  this.undo.push(element)
         
        
        
    }



    AddElement(array){
     
        const element = this.undo.pop()
      
         if(element!=undefined){
              element.view = true
              array.push(element)
              
         } 
        
    }

    
    PushElementFromErraser(el){

        if(el!=undefined){
            const findElement = this.undo.find((item)=>item.id==el.id)
            if(!findElement){
         
            this.undo.push(el)
            }
       
        }
    }

}