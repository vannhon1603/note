const fs = require('fs');
let js = fs.readFileSync('dist/assets/index-D9JME9Hm.js', 'utf8');

const target = 'onSave({...base,expr,expr2,axis,a:av!=null?av:-2,b:bv!=null?bv:2,nSlices,volume:vol});';
const replacement = 'onSave({...base,expr,expr2,axis,a:av!=null?av:-2,b:bv!=null?bv:2,nSlices,volume:vol,sweepAngle:(item&&item.sweepAngle!=null)?item.sweepAngle:360,viewYaw:(item&&item.viewYaw!=null)?item.viewYaw:0.42,viewPitch:(item&&item.viewPitch!=null)?item.viewPitch:0.32,showSlice:item?!!item.showSlice:false});';

if (!js.includes(target)) throw new Error('Target not found in handleSave');
js = js.replace(target, replacement);

fs.writeFileSync('dist/assets/index-D9JME9Hm.js', js, 'utf8');
console.log('✓ Updated VolumeDialog handleSave with default 3D rotation params');
