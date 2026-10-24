const fs = require('fs');

const file = 'dist/assets/index-D9JME9Hm.js';
fs.copyFileSync(file, file + '.bak_infinite_scroll');
console.log('✓ Backup created: ' + file + '.bak_infinite_scroll');

let js = fs.readFileSync(file, 'utf8');

// Target 1: growAtEnd definition
const t1 = 'growAtEnd(){const t=this.scroller;this.drag&&this.drag.k!=="pan"||t.scrollTop+t.clientHeight<t.scrollHeight-2||(this.doc={...this.doc,pages:[...this.doc.pages,Kr()]},this.layout())}';
const r1 = 'growAtEnd(threshold=900){const t=this.scroller;if(this.drag&&this.drag.k!=="pan")return;if(t.scrollTop+t.clientHeight<t.scrollHeight-threshold)return;const newPage=Kr();this.doc={...this.doc,pages:[...this.doc.pages,newPage]};this.layout();this.emit();if(this.cb&&this.cb.changed)this.cb.changed();if(typeof this._onPageAdded==="function")this._onPageAdded(this.doc);}';

if (!js.includes(t1)) {
  console.error('Target 1 (growAtEnd def) NOT found!');
  process.exit(1);
}
js = js.replace(t1, r1);
console.log('✓ Replaced Target 1 (growAtEnd def)');

// Target 2: wheel listener
const t2 = 't.deltaY>0&&!t.ctrlKey&&!t.shiftKey&&this.growAtEnd(),(t.deltaX>0||t.shiftKey&&t.deltaY>0)&&!t.ctrlKey&&this.growAtRight();';
const r2 = 'if(t.deltaY>0&&!t.ctrlKey&&!t.shiftKey){const wasAtBottom=(this.scroller.scrollTop+this.scroller.clientHeight>=this.scroller.scrollHeight-25);this.growAtEnd(1200);if(wasAtBottom){this.scroller.scrollTop+=Math.min(t.deltaY,120);}}(t.deltaX>0||t.shiftKey&&t.deltaY>0)&&!t.ctrlKey&&this.growAtRight();';

if (!js.includes(t2)) {
  console.error('Target 2 (wheel listener) NOT found!');
  process.exit(1);
}
js = js.replace(t2, r2);
console.log('✓ Replaced Target 2 (wheel listener)');

// Target 3: scroll listener
const t3 = 's("scroll",()=>{this.growAtEnd(),this.growAtRight(),this.redraw(),this.emit()})';
const r3 = 's("scroll",()=>{this.growAtEnd(900),this.growAtRight(),this.redraw(),this.emit()})';

if (!js.includes(t3)) {
  console.error('Target 3 (scroll listener) NOT found!');
  process.exit(1);
}
js = js.replace(t3, r3);
console.log('✓ Replaced Target 3 (scroll listener)');

// Target 4: pan growAtEnd
const t4 = 'i<s.sy&&this.growAtEnd()';
const r4 = 'i<s.sy&&this.growAtEnd(900)';

if (!js.includes(t4)) {
  console.error('Target 4 (pan growAtEnd) NOT found!');
  process.exit(1);
}
js = js.replace(t4, r4);
console.log('✓ Replaced Target 4 (pan growAtEnd)');

// Target 5: Kz polling effect
const t5 = 'H.useEffect(()=>{let B=e.doc,j=performance.now();const K=setInterval(()=>{e.busy()||e.doc!==B?(B=e.doc,j=performance.now()):performance.now()-j>=Fz&&i(A=>A===B?A:B)},300);return()=>clearInterval(K)},[e])';
const r5 = 'H.useEffect(()=>{let B=e.doc,j=performance.now();const update=()=>{if(e.doc.pages.length!==B.pages.length||(e.doc!==B&&!e.busy())){B=e.doc;i(e.doc);}};e._onPageAdded=update;const K=setInterval(()=>{if(e.doc.pages.length!==B.pages.length){B=e.doc;i(e.doc);return;}e.busy()||e.doc!==B?(B=e.doc,j=performance.now()):performance.now()-j>=Fz&&i(A=>A===B?A:B);},100);return()=>{clearInterval(K);if(e._onPageAdded===update)e._onPageAdded=null;};},[e])';

if (!js.includes(t5)) {
  console.error('Target 5 (Kz polling effect) NOT found!');
  process.exit(1);
}
js = js.replace(t5, r5);
console.log('✓ Replaced Target 5 (Kz polling effect)');

// Target 6: pages-list onWheel
const t6 = 'className:`pages-list${d?" dragging":""}`,ref:c,onPointerMove:D,onPointerUp:F,onPointerCancel:S,';
const r6 = 'className:`pages-list${d?" dragging":""}`,ref:c,onPointerMove:D,onPointerUp:F,onPointerCancel:S,onWheel:B=>{if(B.deltaY>0&&c.current){const el=c.current;if(el.scrollTop+el.clientHeight>=el.scrollHeight-40){e.growAtEnd(0);}}},';

if (!js.includes(t6)) {
  console.error('Target 6 (pages-list onWheel) NOT found!');
  process.exit(1);
}
js = js.replace(t6, r6);
console.log('✓ Replaced Target 6 (pages-list onWheel)');

fs.writeFileSync(file, js, 'utf8');
console.log('✓ Successfully wrote modified index-D9JME9Hm.js');
