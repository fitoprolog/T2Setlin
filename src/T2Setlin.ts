const INITIAL_MEMORY_STATE =85;

class TSetlin{
  /*
   *On this implementation Low Nibble will represent the positive literal
   *and High Nibble the negation value
   */
  private memory    : Uint8Array; 
  private forgetTh  : number;
  private memorizeTh: number; 
  private numberOfPositiveLiterals:number;
  private literalBits :Uint8Array;
  private forgetMask  :Uint8Array; 
  
  constructor(forgetTh : number , memorizeTh : number , numberOfPositiveLiterals:number){
    this.memory = new Uint8Array( 
            [...new Array(numberOfPositiveLiterals)].map(()=>INITIAL_MEMORY_STATE)
    );
    this.literalBits = new Uint8Array(Math.ceil(numberOfPositiveLiterals*2/8));
    this.forgetMask  = new Uint8Array(this.literalBits.length); 
    this.forgetTh   = forgetTh;
    this.memorizeTh = memorizeTh;
    this.numberOfPositiveLiterals = numberOfPositiveLiterals;
  }

  private literalIsValid(literal : number){
    return literal < this.numberOfPositiveLiterals && literal >= 0;
  }
  getLiteralMemoryValue(literal: number){
    if (!this.literalIsValid(literal)){
      return null;
    }
    const cbyte = this.memory[literal];
    return [cbyte &0x0F, cbyte >> 4  ]
  }

  operate(literal : number,negative : boolean,decrease  : boolean){
    const v = this.getLiteralMemoryValue(literal);
    if(!v){
      return false;
    }
    const f = v[negative ?  1 : 0 ] ;
    if (f ==10 && !decrease || f==0 && decrease) {
      return false;
    }
    const s= decrease ? -1 : 1;
    if (negative){
      this.memory[literal] = (this.memory[literal] & 0x0F) | ((f+s) <<4);
    }else{
      this.memory[literal] = (this.memory[literal] & 0xF0) | (f+s);
    }
    return true;
  }

  decrease(literal : number,negative : boolean){
    return this.operate(literal, negative, true);
  }

  increase(literal : number,negative : boolean){
    return this.operate(literal, negative, false);
  }

  memorize(literal : number, negative: boolean){
    if (Math.random() >  this.memorizeTh) {
      return false;
    }
    return this.increase(literal,negative);
  }

  forget(literal: number , negative : boolean){
    if (Math.random() > this.forgetTh) return false;
    return this.decrease(literal,negative);
  }


  getConditionMask(){
    this.iterateOverLiterals((cByte:number,mask:number,nomask:number,l:number,cBit :number)=>{
      const literal = this.getLiteralMemoryValue(l);
      if (literal){
        this.literalBits[cByte] |= ((literal[0] >= 6 ? 1:0) << cBit*2) | ((literal[1] >=6 ? 1:0) << (cBit*2+1)); 
      }
      return true;
    });
    return this.literalBits;
  }

  typeIFeedback(observation : Uint8Array){

    let   forgetMask    =  this.forgetMask;
    for(let b=0; b != forgetMask.length; b++){
      forgetMask[b] = 0xff;
    }
    this.getConditionMask();

    if (this.evaluateCondition(observation)){
      this.iterateOverLiterals((cByte:number,mask:number,nomask:number,l:number)=>{
        if ((observation[cByte] & mask)  == mask){
          this.memorize(l,false);
          forgetMask[cByte] ^=mask;
        }else {
          this.memorize(l,true);
          forgetMask[cByte] ^=nomask;
        }
        return true;
      });
    }
    this.iterateOverLiterals((cByte:number,mask:number,nomask:number,l:number)=>{
      if ((forgetMask[cByte] & mask)  == mask){
        this.forget(l,false);
      }
      if ((forgetMask[cByte] & nomask)  == nomask){
        this.forget(l,true);
      }
      return true;
    });
    this.getConditionMask();
  }
  
  typeIIFeedback(observation:Uint8Array){
    this.getConditionMask();
    if (!this.evaluateCondition(observation)) return;
    this.iterateOverLiterals((cByte:number,mask:number,nomask:number,l:number)=>{
      if ((observation[cByte] & mask) !=mask){
        this.increase(l,false); //memorize_always equivalent
      }else{
        this.increase(l,true);
      }
    });
    this.getConditionMask();
  }
  /*
   * The callback function should return false if want to break the iteration
   */
  iterateOverLiterals(callback:Function){
    for(let l=0; l != this.numberOfPositiveLiterals;l++){
      const cByte   = Math.floor(l/4);
      const cBit    = l%4;
      const mask    = 1 << (cBit*2);
      const notmask = 1 << (cBit*2+1);
      if (!callback(cByte,mask,notmask,l,cBit))
        return false;
    }
    return true;
  }
  evaluateCondition(observation : Uint8Array){
    const ret=this.iterateOverLiterals((cByte:number,mask:number,notmask:number)=>{
      if ((this.literalBits[cByte] & mask) == mask && (observation[cByte] & mask)  != mask)
        return false;
      if ((this.literalBits[cByte] & notmask) == notmask && (observation[cByte] & mask)  == mask)
        return false;
      return true;
    })
    return ret;
  }

  choose(options:number){
    return Math.floor(Math.random()*options);
  }

  train(targetClass : Uint8Array[] ,otherClasses: any,epochs : number ){
    for (let e=0; e !=epochs; e++){
      if (Math.random()>=0.5){
        this.typeIFeedback(targetClass[this.choose(targetClass.length)]);
      }else{
        const other = otherClasses[this.choose(otherClasses.length)];
        this.typeIIFeedback(other[this.choose(other.length)])
      }
      console.log("Epoch ",e);
    }
  }

  debugPrintConditionMask(mask: Uint8Array){
    for(let l=0; l!= this.numberOfPositiveLiterals; l++)
      console.log(this.getLiteralMemoryValue(l))
    mask.forEach((b)=>{
      process.stdout.write(b.toString(2)+ '  ');
    });
    process.stdout.write("\n");
  }
}
export { TSetlin };

