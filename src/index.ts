import { TSetlin } from './T2Setlin';

const FourWheels =1;
const TransportsPeople=1<< 2
const Wings=1<< 4
const Yellow=1<< 6
const NGRAMS     = 4
const NCHARACTERS='Z'.charCodeAt(0)-'0'.charCodeAt(0);
const NUMBEROFLITERALS=Math.ceil(NCHARACTERS**NGRAMS*2/8)
const INPUTSIZE       = Math.ceil(NCHARACTERS**NGRAMS/8)
const cars=[
  new Uint8Array([FourWheels | TransportsPeople,1]),
  new Uint8Array([FourWheels | TransportsPeople|Yellow,0]),
  new Uint8Array([FourWheels | TransportsPeople|Yellow,0]),
]

const planes=[
  new Uint8Array([FourWheels | TransportsPeople | Wings  ,0]),
  new Uint8Array([FourWheels |  Wings | Yellow ,1]),
  new Uint8Array([TransportsPeople|Wings ,1])
];
const CarsTAM = new TSetlin(0.9,0.1,5);
CarsTAM.train(cars,[planes],100);

cars.forEach((e)=>{
  console.log("IsAcAAr",CarsTAM.evaluateCondition(e));
});
planes.forEach((e)=>{
  console.log("IsAcAAr",CarsTAM.evaluateCondition(e));
});


process.exit(0);

const NATURAL=[
  'CARS','DOGS','PERS','ZONE','SAVE','GERA','RATO','MOTO',
  'MONK', 'EAGL', 'EGEL','SOAP', 'VOLT', 'AMPE','ZONZ',
  'SOUN', 'OUND','GROU','ELEC','PRIS','FIGU', 'GURE',
  'AURA','ZOOM'
]
const UNATURAL=[
  '1111','DGGL','RSTS', 'AAXZ', 'SSTX','GEEE','RMST','MOXX',
  'CXXA', 'AMDG','TXRX','AZAZ','1123','4332','2311','PRLS',
  'GRMS', 'XZXZ',
]
let right :any[]=[];
let wrong :any[]=[];

let input = new Uint8Array(INPUTSIZE)
const TAM = new TSetlin(0.9,0.1,NGRAMS*NCHARACTERS);
const TAMNegative = new TSetlin(0.9,0.1,NGRAMS*NCHARACTERS);

const STARTCHAR = '0'.charCodeAt(0);
function convertTextIntoGrams(text:string){  
  let ret = new Uint8Array(Math.ceil(NCHARACTERS/8)*NGRAMS);
  for(let c=0; c!= text.length; c++){
    const charCode = text.charCodeAt(c)-STARTCHAR; //to start from 0
    const nByte = Math.floor(c*6+charCode/8);
    const nBit  = charCode%8;
    ret[nByte]  = 1 << nBit; 
  }
  return ret;
}
NATURAL.forEach((e)=>{
  right.push( convertTextIntoGrams(e));
});
UNATURAL.forEach((e)=>{
  wrong.push( convertTextIntoGrams(e));
});
wrong.forEach((a:any)=>{
  a.forEach((x:any)=>{ 
   process.stdout.write( x.toString(2) + ' ');
  })
  console.log("");
});

console.log("==================");

right.forEach((a:any)=>{
  a.forEach((x:any)=>{ 
   process.stdout.write( x.toString(2) + ' ');
  })
  console.log("");
});


TAM.train(right,[wrong],1000);
const finalRules = TAM.getConditionMask();

right.forEach((e)=>{
  console.log(TAM.evaluateCondition(e));
})
console.log("=====RIGHTS=======");
wrong.forEach((e:any)=>{
  console.log(TAM.evaluateCondition(e));
})
