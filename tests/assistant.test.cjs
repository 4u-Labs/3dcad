const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

globalThis.window = globalThis;
require(path.join(__dirname, '../cad_assistant.js'));

test('CadAssistant: loads knowledge base with all essential topics', () => {
  assert(globalThis.CadAssistant);
  assert(Array.isArray(globalThis.CadAssistant.KNOWLEDGE_BASE));
  assert(globalThis.CadAssistant.KNOWLEDGE_BASE.length >= 10);
});

test('CadAssistant: answers drilling/boolean questions in Portuguese', async () => {
  const res = await globalThis.CadAssistant.answerQuestion('como fazer furo na peça com booleana?', 'pt');
  assert.equal(res.found, true);
  assert.equal(res.item.id, 'csg_boolean_drill');
  assert(res.text.includes('Furo por diâmetro') || res.text.includes('Passo a passo'));
});

test('CadAssistant: answers slicer/export questions in English', async () => {
  const res = await globalThis.CadAssistant.answerQuestion('how do I export to Bambu Studio or Cura?', 'en');
  assert.equal(res.found, true);
  assert.equal(res.item.id, 'slicers_export');
  assert(res.text.includes('.STL') || res.text.includes('.3MF'));
});

test('CadAssistant: finds bearing 608 specifications', async () => {
  const res = await globalThis.CadAssistant.answerQuestion('folga do rolamento de skate 608', 'pt');
  assert.equal(res.found, true);
  assert.equal(res.item.id, 'bearing_608');
  assert(res.text.includes('22,2') || res.text.includes('22.2'));
});

test('CadAssistant: returns helpful fallback for unknown queries', async () => {
  const res = await globalThis.CadAssistant.answerQuestion('xyzqwerty inexistente 12345', 'pt');
  assert.equal(res.found, false);
  assert(res.text.includes('Não encontrei uma resposta'));
});
