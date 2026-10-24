const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('dist/assets/index-D9JME9Hm.js');
let code = fs.readFileSync(targetFile, 'utf8');

const oldPv = 'function pv(e,t,n,u){if(t.type==="volume"){const isFocused=Boolean(u&&u.has(t.id));drawVolume3D(e,{...t,expr:t.expr||"",expr2:t.expr2||"",a:t.a!=null?t.a:-2,b:t.b!=null?t.b:2,axis:t.axis||"ox",nSlices:t.nSlices||30},isFocused);return;}';

const newPv = 'function pv(e,t,n,u){if(t.type==="volume"){const isFocused=Boolean(u&&u.has(t.id));const _vObj={...t,expr:t.expr||"",expr2:t.expr2||"",a:t.a!=null?t.a:-2,b:t.b!=null?t.b:2,axis:t.axis||"ox",nSlices:t.nSlices||30};drawVolume3D(e,_vObj,isFocused);t._quickFormulaRect=_vObj._quickFormulaRect;t._solutionRect=_vObj._solutionRect;t._cutHandle=_vObj._cutHandle;t._rotHandle=_vObj._rotHandle;return;}';

if (!code.includes(oldPv)) {
  throw new Error('oldPv not found');
}

code = code.replace(oldPv, newPv);
fs.writeFileSync(targetFile, code, 'utf8');
console.log('✓ Successfully attached _quickFormulaRect and _solutionRect back to page item in pv()');
