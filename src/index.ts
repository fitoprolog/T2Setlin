import { TSetlin } from './T2Setlin';

const FourWheels=1;
const TransportsPeople=1<< 2
const Wings=1<< 4
const NotWings=1<< 5
const Yellow=1<< 6
const Blue=1<< 8

const cars=[
  new Uint8Array([FourWheels | TransportsPeople,1]),
  new Uint8Array([FourWheels | TransportsPeople|Yellow,0]),
  new Uint8Array([FourWheels | TransportsPeople|Yellow,0]),
]

const planes=[
  new Uint8Array([FourWheels | TransportsPeople | Wings  ,1]),
  new Uint8Array([FourWheels |  Wings | Yellow ,0]),
  new Uint8Array([TransportsPeople|Wings ,1])
]


const TAM = new TSetlin(0.9,0.1,5);
let mask = TAM.getConditionMask();
TAM.debugPrintConditionMask(mask);
TAM.increase(3,false);
TAM.increase(3,true);
mask = TAM.getConditionMask();
TAM.debugPrintConditionMask(mask);

let exampleCondition= new Uint8Array([FourWheels | TransportsPeople | NotWings,0]);

console.log("ConditionEvaluatesTo",TAM.evaluateCondition(cars[0], exampleCondition))

for(let i=0;i!= 100;i++){
  let observation = cars[Math.floor(Math.random()*3)];
  TAM.typeIFeedback(observation);
}

mask = TAM.getConditionMask();
TAM.debugPrintConditionMask(mask);
