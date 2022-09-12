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

  constructor(forgetTh : number , memorizeTh : number , numberOfPositiveLiterals:number){
    this.memory = new Uint8Array( 
            [...new Array(numberOfPositiveLiterals)].map(()=>INITIAL_MEMORY_STATE)
    );
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
    if (Math.random() > this.memorizeTh) return false;
    return this.increase(literal,negative);
  }

  forget(literal: number , negative : boolean){
    if (Math.random() > this.forgetTh) return false;
    return this.decrease(literal,negative);
  }


  getConditionMask(){
    let literalBits = new Uint8Array(Math.ceil(this.numberOfPositiveLiterals*2/8)); 
    for(let l=0; l != this.numberOfPositiveLiterals;l++){
      const literal = this.getLiteralMemoryValue(l);
      const cByte = Math.floor(l/8);
      const cBit  = l%8;
      if (literal){
        literalBits[cByte] |= ((literal[0] >= 6 ? 1:0) << cBit*2) | ((literal[1] >=6 ? 1:0) << (cBit*2+1)); 
      }
    }
    return literalBits;
  }

  typeIFeedback(observation : Uint8Array){
    const conditionMask = this.getConditionMask();
    let   forgetMask    =   new Uint8Array( 
            [...new Array(conditionMask.length)].map(()=>0xFF)
    );

    if (this.evaluateCondition(observation,conditionMask)){
      for(let l=0; l != this.numberOfPositiveLiterals;l++){
        const cByte = Math.floor(l/8);
        const cBit  = l%8;
        let mask = 1 << cBit*2;
        if ((observation[cByte] & mask)  == mask){
          this.memorize(l,false);
          forgetMask[cByte] ^=mask;
        }else {
          this.memorize(l,true);
          mask = 1 << (cBit*2 +1)
          forgetMask[cByte] ^=mask;
        }
      }
    }
    //this loop is repetitive could be converted into a function 
    for(let l=0; l != this.numberOfPositiveLiterals;l++){
      const cByte = Math.floor(l/8);
      const cBit  = l%8;
      let mask = 1 << cBit*2;
      if ((forgetMask[cByte] & mask)  == mask){
        this.forget(l,false);
      }
      mask = 1 << (cBit*2+1);
      if ((forgetMask[cByte] & mask)  == mask){
        this.forget(l,true);
      }
    }
  }

  evaluateCondition(observation : Uint8Array , conditionOrRule : Uint8Array){
    let ret=true;
    for(let l=0; l != this.numberOfPositiveLiterals;l++){
      const cByte = Math.floor(l/8);
      const cBit  = l%8;
      let mask = 1 << cBit*2;
      if ((conditionOrRule[cByte] & mask) == mask && (observation[cByte] & mask)  != mask){
        return false;
      }
      mask = 1 << (cBit*2+1)
      if ((conditionOrRule[cByte] & mask) == mask && (observation[cByte] & mask)  == mask){
        return false;
      }
    }
    return ret;
  }


  debugPrintConditionMask(mask: Uint8Array){
    console.log("Memory",this.memory);
    mask.forEach((b)=>{
      process.stdout.write(b.toString(2)+ '  ');
    });
    process.stdout.write("\n");
  }
}
export {TSetlin};
