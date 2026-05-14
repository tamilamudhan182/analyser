const { JSDOM } = require('jsdom');
const dom = new JSDOM('<form id="f"><textarea id="t"></textarea></form>');
const doc = dom.window.document;
const t = doc.getElementById('t');
t.value = 'hello';
doc.getElementById('f').reset();
console.log("After reset, value is:", t.value);
