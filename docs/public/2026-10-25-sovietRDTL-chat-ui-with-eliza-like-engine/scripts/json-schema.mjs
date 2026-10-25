// Validator for the explicit JSON Schema subset used by this project.
// It is not a replacement for a general draft-2020-12 validator.
export function validateSchema(schema,value,path='$'){
 const errors=[];const fail=message=>errors.push(`${path}: ${message}`);const type=schema.type;
 const is=type==='object'?value!==null&&typeof value==='object'&&!Array.isArray(value):type==='array'?Array.isArray(value):type==='integer'?Number.isInteger(value):type==='number'?typeof value==='number'&&Number.isFinite(value):!type||typeof value===type;
 if(!is){fail('Expected '+type);return errors;}
 if(schema.enum&&!schema.enum.some(v=>v===value))fail('Not in enum');
 if(type==='object'){
  for(const key of schema.required||[])if(!(key in value))fail('Required '+key);
  for(const[key,item]of Object.entries(value)){const property=schema.properties?.[key];if(property)errors.push(...validateSchema(property,item,path+'.'+key));else if(schema.additionalProperties===false)fail('Unknown property '+key);}
 }
 if(type==='array'){if(value.length<(schema.minItems||0))fail('Too few items');if(schema.uniqueItems&&new Set(value.map(v=>JSON.stringify(v))).size!==value.length)fail('Duplicate item');if(schema.items)value.forEach((v,i)=>errors.push(...validateSchema(schema.items,v,`${path}[${i}]`)));}
 if(type==='string'){if(value.length<(schema.minLength||0))fail('Too short');if(schema.pattern&&!new RegExp(schema.pattern,'u').test(value))fail('Pattern mismatch');}
 if(type==='number'||type==='integer'){if(schema.minimum!==undefined&&value<schema.minimum)fail('Below minimum');if(schema.maximum!==undefined&&value>schema.maximum)fail('Above maximum');if(schema.exclusiveMinimum!==undefined&&value<=schema.exclusiveMinimum)fail('Below exclusive minimum');}
 return errors;
}
