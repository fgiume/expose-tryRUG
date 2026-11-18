/* Lightweight DOM smoke test for the complete EXPOSE research Database. */
const fs=require('fs');
const assert=require('assert');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('database.html','utf8');
const dom=new JSDOM(html,{url:'https://example.org/database.html?view=matrix',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
w.HTMLElement.prototype.scrollIntoView=function(){};
const files=['data/coded-cases.js','data/matrix-codes.js','js/bm25.js','data/episode-search.js','js/main.js','js/database-next.js'];
for(const name of files){
  console.log('Evaluating',name);
  w.eval(fs.readFileSync(name,'utf8'));
}
// Search controls are above both result collections, and every original
// filter remains available after the layout change.
const evidenceView=w.document.getElementById('evidence-view');
const searchPanel=w.document.querySelector('.db-search-panel');
const resultsColumn=w.document.querySelector('.db-results-column');
assert(searchPanel && resultsColumn,'Top search area and results must exist');
assert(Boolean(searchPanel.compareDocumentPosition(resultsColumn) & w.Node.DOCUMENT_POSITION_FOLLOWING),
  'Search controls must precede the results');
for(const id of ['ev-keyword','ev-case','ev-episode','ev-status','ev-group',
                 'ev-variable','ev-strategy','ev-tactic','ev-year','ev-match','ev-clear']){
  assert(searchPanel.querySelector('#'+id),'Search filter missing: '+id);
}
assert(evidenceView.contains(searchPanel)&&evidenceView.contains(resultsColumn));
assert.strictEqual(w.EXPOSE_CODED.episodes.length,69);
assert.strictEqual(w.EXPOSE_SEARCH_INDEX.documents.length,69);
assert.strictEqual(Object.keys(w.EXPOSE_CODE_STATUS.episodeCodes).length,69);
assert(w.document.querySelectorAll('#mx-table tbody tr').length>0,'Matrix should render rows');
assert(w.document.querySelectorAll('#mx-table td').length>0,'Matrix should render cells');
assert(w.document.querySelector('#ev-count').textContent.includes('excerpts'),'Search view should render excerpts');
const query=w.document.getElementById('ev-keyword');
query.value='sanctions';
query.dispatchEvent(new w.Event('input',{bubbles:true}));
assert(w.document.getElementById('ev-count').textContent.includes('BM25 relevance order'),
  'Coded evidence should use BM25 ranking for keyword searches');
assert(w.document.getElementById('doc-count').textContent.includes('BM25 relevance order'),
  'Episode documents should use BM25 ranking for keyword searches');
assert(w.document.querySelector('#ev-records .db-card-meta').textContent.includes('BM25 '),
  'Coded evidence cards should show BM25 relevance scores');
assert(w.document.querySelector('#ev-documents .db-document-card').textContent.includes('BM25 '),
  'Episode document cards should show BM25 relevance scores');
query.value='';
query.dispatchEvent(new w.Event('input',{bubbles:true}));
assert(w.document.getElementById('ev-count').textContent.includes('source order'),
  'Empty keyword search should return to source order');

const yes=w.document.querySelector('#mx-table button.db-yes-button');
assert(yes,'Matrix should include at least one YES from real coded examples');
yes.click();
assert.strictEqual(w.document.getElementById('mx-details').hidden,false);
assert(w.document.querySelectorAll('#mx-examples article').length<=15);
w.document.getElementById('mx-all').click();
assert.strictEqual(w.document.getElementById('evidence-view').hidden,false);
assert.strictEqual(w.document.getElementById('matrix-view').hidden,true);
// The matrix's case and episode scopes must be different. Episode 1.1 must
// never show data or dimension labels for sibling episode 1.2.
w.document.getElementById('tab-matrix').click();
const rowDimension=w.document.getElementById('mx-row');
const colDimension=w.document.getElementById('mx-col');
rowDimension.value='episodes';
colDimension.value='strategies';
rowDimension.dispatchEvent(new w.Event('change',{bubbles:true}));
colDimension.dispatchEvent(new w.Event('change',{bubbles:true}));
const caseFilter=w.document.getElementById('mx-case');
const episodeFilter=w.document.getElementById('mx-episode');
caseFilter.value='1';
caseFilter.dispatchEvent(new w.Event('change',{bubbles:true}));
assert(w.document.getElementById('mx-summary').textContent.includes('Case 1 (all its episodes)'));
episodeFilter.value='1.1';
episodeFilter.dispatchEvent(new w.Event('change',{bubbles:true}));
assert(w.document.getElementById('mx-summary').textContent.includes('Episode 1.1'));
let labels=[...w.document.querySelectorAll('#mx-table tbody th')].map(n=>n.textContent);
assert(labels.every(x=>x.startsWith('1.1 ')),'Episode 1.1 must exclude 1.2');
const showEmpty=w.document.getElementById('mx-show-empty');
showEmpty.checked=true;showEmpty.dispatchEvent(new w.Event('change',{bubbles:true}));
labels=[...w.document.querySelectorAll('#mx-table tbody th')].map(n=>n.textContent);
assert.strictEqual(labels.length,1,'Explicitly showing NO DATA must still keep only episode 1.1');
assert(labels[0].startsWith('1.1 '));
rowDimension.value='sanctions';
colDimension.value='episodes';
rowDimension.dispatchEvent(new w.Event('change',{bubbles:true}));
colDimension.dispatchEvent(new w.Event('change',{bubbles:true}));
const headers=[...w.document.querySelectorAll('#mx-table thead th')].map(n=>n.textContent);
assert(headers.includes('1.1 · ')===false);
assert(headers.some(x=>x.startsWith('1.1 ')),'Only selected episode should appear as a column');
assert(!headers.some(x=>x.startsWith('1.2 ')),'Sibling 1.2 column must not appear');
showEmpty.checked=false;showEmpty.dispatchEvent(new w.Event('change',{bubbles:true}));
assert(!showEmpty.checked,'NO DATA-only categories hidden by default');

console.log('UI smoke test passed: '+w.document.querySelectorAll('#mx-table td').length+' matrix cells and real evidence drill-down.');
w.close();
