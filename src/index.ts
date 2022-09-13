import { TSetlin } from './T2Setlin';

const FourWheels =1;
const TransportsPeople=1<< 2
const Wings=1<< 4
const Yellow=1<< 6

const cars=[
  new Uint8Array([FourWheels | TransportsPeople,1]),
  new Uint8Array([FourWheels | TransportsPeople|Yellow,0]),
  new Uint8Array([FourWheels | TransportsPeople|Yellow,0]),
]

const planes=[
  new Uint8Array([FourWheels | TransportsPeople | Wings  ,0]),
  new Uint8Array([FourWheels |  Wings | Yellow ,1]),
  new Uint8Array([TransportsPeople|Wings ,1])
]


const TAM = new TSetlin(0.9,0.1,5);

TAM.typeIFeedback(cars[0]);
/*TAM.increase(0,false);
TAM.increase(1,false);
TAM.increase(2,true);*/

TAM.train(cars,[planes],1000);
const finalRules = TAM.getConditionMask();
cars.forEach((e)=>{
  console.log("IsACar",TAM.evaluateCondition(e,finalRules));
})
planes.forEach((e)=>{
  console.log("IsACar",TAM.evaluateCondition(e,finalRules));
})
TAM.debugPrintConditionMask(finalRules);
