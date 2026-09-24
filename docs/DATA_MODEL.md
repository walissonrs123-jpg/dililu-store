# Modelos
```ts
export type Product = {
  id:string; slug:string; name:string; shortDescription:string; description?:string;
  brand?:string; material?:string; category:string; audience:"bebe"|"menina"|"menino"|"unissex";
  price:number; sizes:string[]; prints?:string[]; images:string[]; active:boolean;
  featured?:boolean; newArrival?:boolean; stockMode:"consult"|"available"|"unavailable";
}

export type ContentPlanItem = {
  id:string; date:string; time?:string; format:"feed"|"story"|"reel";
  productId?:string; title:string; caption:string; mediaSuggestion:string;
  callToAction?:string; status:"planned"|"ready"|"scheduled"|"published"|"skipped";
  notes?:string;
}
```
