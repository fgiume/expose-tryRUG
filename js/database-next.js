/* EXPOSE – combined coded evidence search and workbook-based matrix.
 * Source material: the team's 69 episode research documents and Database 3.0.
 * No outside evasion examples, network searches or synthetic data.
 */
(function () {
  'use strict';
  var D = window.EXPOSE_CODED;
  var IDX = window.EXPOSE_SEARCH_INDEX;
  var ENGINE = window.ExposeSearch;
  var CODE = window.EXPOSE_CODE_STATUS;
  var $ = function (id) { return document.getElementById(id); };
  if (!D || !IDX || !ENGINE || !CODE) {
    var n = $('evidence-view');
    if (n) n.insertAdjacentText('afterbegin', 'Research data could not load. Please refresh the page.');
    return;
  }

  var validStrategies = ['Ignoring', 'Obfuscating', 'Deceiving'];
  var strategyId = {Ignoring:'V67',Obfuscating:'V68',Deceiving:'V69'};
  // Exact labels from Database 3.0, "irene is working here", V70–V103.
  var tacticNames = [
    'Use of Shell Companies','Third-Party Intermediaries','Trade-Based Money Laundering',
    'False Documentation','Jurisdictional Arbitrage/ Triangulation',
    'Informal Banking (Hawala)','Using Cryptocurrencies','Smuggling',
    'False End-User Certificates','Reflagging and Re-Registering Vessels',
    'Dual-Use Goods','Hiding Beneficial Ownership','Using Unsanctioned Payment Methods',
    'Change in Business Practices','Manipulating Shipping Routes',
    'Establishing Foreign Affiliates','Illicit activities to raise funds',
    'Ghost fleet/ Dark fleet (switching off AIS)','Using Trust Services',
    'Under/over invoicing','Complex Corporate Structures','Use of Family Members',
    'Use of Enablers (i.e. lawyers, accountants, etc)','The use of real estate to hold value',
    'Fail to inform competent authorities','Use of art work and precious metals',
    'Reverse engineering','Ship-to-ship transfer','PMCs','Black Knights','Looting',
    'AIS Manipulation','Cyberattacks','Charitable Funds and Donations'
  ];
  var normal = function (x) { return String(x || '').toLowerCase().replace(/\s+/g,' ').replace(/[‐‑–—]/g,'-').trim(); };
  var tacticCode = new Map(tacticNames.map(function(t,i){return [normal(t),'V'+(i+70)];}));
  var cases = D.cases.slice().sort(function(a,b){return String(a.name).localeCompare(String(b.name));});
  var episodes = D.episodes.slice().sort(function(a,b){
    return Number(a.caseId)-Number(b.caseId) || String(a.id).localeCompare(String(b.id),undefined,{numeric:true});
  });
  var caseMap = new Map(cases.map(function(c){return [String(c.id), c];}));
  var episodeMap = new Map(episodes.map(function(e){return [String(e.id),e];}));
  var sanctionVars = [...new Map(D.variables.filter(function(v){
    var n = Number(String(v.variableId).replace('V',''));
    return n >= 6 && n <= 66;
  }).map(function(v){return [v.variableId,v];})).values()]
    .sort(function(a,b){return Number(a.variableId.slice(1))-Number(b.variableId.slice(1));});
  var variableMap = new Map(sanctionVars.map(function(v){return [v.variableId,v];}));

  function make(tag, text, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = String(text);
    return n;
  }
  function appendOption(select, value, label) { select.add(new Option(label, value)); }
  function unique(xs) { return Array.from(new Set(xs)); }
  function excerptKey(r) { return String(r.caseId)+'|'+String(r.episode)+'|'+String(r.excerptId || r.id); }

  // Merge the multiple coding-variable rows associated with one documented excerpt.
  // This is the unit of analysis for Option B.
  var grouped = new Map();
  D.records.forEach(function(r){
    var key=excerptKey(r), g=grouped.get(key);
    if(!g){
      g={ key:key, caseId:String(r.caseId), caseName:r.case, episode:String(r.episode),
        year:String(r.reportYear || ''), recordType:r.recordType, text:r.example || '',
        strategies:new Set(), tactics:new Set(), variableIds:new Set(), groups:new Set(),
        reports:new Set(), sources:new Set(), rows:[] };
      grouped.set(key,g);
    }
    g.rows.push(r);
    if(r.recordType==='Coded example') g.recordType='Coded example';
    if(r.example && r.example.length > g.text.length) g.text=r.example;
    var variableNum=Number(String(r.variableId).replace('V',''));
    if(variableNum>=6 && variableNum<=66) g.variableIds.add(String(r.variableId));
    if(r.group) g.groups.add(r.group);
    (r.strategies || []).forEach(function(x){g.strategies.add(x);});
    (r.tactics || []).forEach(function(x){g.tactics.add(x);});
    (r.reports || []).forEach(function(x){g.reports.add(x);});
    if(r.sourceFile)g.sources.add(r.sourceFile);
  });
  var evidence = Array.from(grouped.values()).sort(function(a,b){
    return Number(a.caseId)-Number(b.caseId) || a.episode.localeCompare(b.episode,undefined,{numeric:true});
  });
  var codedEvidence = evidence.filter(function(g){return g.recordType==='Coded example';});
  // BM25 index of distinct coded excerpts, built once from EXPOSE research data.
  // Index the evidence text and its own coding labels; never index external material.
  var excerptIndex = ENGINE.build(evidence.map(function(g) {
    return {
      id:g.key, caseId:g.caseId, episode:g.episode, excerpt:g,
      text:[g.text,g.caseName,g.episode,
        Array.from(g.variableIds).map(formatExcerptVariable).join(' '),
        Array.from(g.strategies).join(' '),
        Array.from(g.tactics).join(' '),
        Array.from(g.reports).join(' ')
      ].join(' ')
    };
  }));
  function formatExcerptVariable(id) {
    var v = variableMap.get(id);
    return v ? (v.variableId+' '+v.variable) : id;
  }
  var tacticOptions = tacticNames.slice();
  unique(D.records.flatMap(function(r){return r.tactics || [];})).forEach(function(t){
    if(!tacticOptions.some(function(x){return normal(x)===normal(t);})) tacticOptions.push(t);
  });

  function formatVar(id) { var v=variableMap.get(id); return v?(v.variableId+' · '+v.variable):id; }
  function filterByGroup(id,group){
    var v=variableMap.get(id);
    return !group || (v && v.group===group);
  }
  function selectOptions(id,rows){
    var s=$(id);
    rows.forEach(function(r){appendOption(s,r.value,r.label);});
  }
  selectOptions('ev-case',cases.map(function(c){return {value:String(c.id),label:c.name};}));
  selectOptions('ev-variable',sanctionVars.map(function(v){return {value:v.variableId,label:formatVar(v.variableId)};}));
  selectOptions('ev-strategy',validStrategies.map(function(s){return {value:s,label:s};}).concat([
    {value:'Violation',label:'Violation / strategy undetermined'},
    {value:'Strategy not coded',label:'Strategy not coded'}
  ]));
  selectOptions('ev-tactic',tacticOptions.map(function(t){return {value:t,label:t};}));
  selectOptions('ev-year',unique(D.records.map(function(r){return r.reportYear;}).filter(Boolean))
    .sort(function(a,b){return Number(b)-Number(a);}).map(function(y){return {value:String(y),label:String(y)};}));
  selectOptions('mx-case',cases.map(function(c){return {value:String(c.id),label:c.name};}));

  function updateEpisodes(caseSelect, epSelect) {
    var c=$(caseSelect).value, s=$(epSelect), previous=s.value;
    s.replaceChildren(new Option('All episodes',''));
    episodes.filter(function(e){return !c || String(e.caseId)===c;}).forEach(function(e){
      appendOption(s,e.id,e.id+' · '+(e.case || caseMap.get(String(e.caseId))?.name || 'Case'));
    });
    if(Array.from(s.options).some(function(o){return o.value===previous;}))s.value=previous;
  }
  updateEpisodes('ev-case','ev-episode');
  updateEpisodes('mx-case','mx-episode');

  function matchesPair(g,pair){
    if(!pair)return true;
    return hasValue(g,pair.rowType,pair.rowValue) && hasValue(g,pair.colType,pair.colValue);
  }
  function hasValue(g,dim,value){
    if(dim==='sanctions')return g.variableIds.has(value);
    if(dim==='strategies')return g.strategies.has(value);
    if(dim==='tactics')return Array.from(g.tactics).some(function(t){return normal(t)===normal(value);});
    if(dim==='cases')return g.caseId===String(value);
    if(dim==='episodes')return g.episode===String(value);
    return false;
  }
  var activePair=null;
  function selectedFilters(){
    return {q:$('ev-keyword').value.trim(),caseId:$('ev-case').value,
      episode:$('ev-episode').value,status:$('ev-status').value,group:$('ev-group').value,
      variable:$('ev-variable').value,strategy:$('ev-strategy').value,tactic:$('ev-tactic').value,
      year:$('ev-year').value,match:$('ev-match').value};
  }
  function recordMatches(g,f){
    if(f.caseId && g.caseId!==f.caseId)return false;
    if(f.episode && g.episode!==f.episode)return false;
    if(f.status && g.recordType!==f.status)return false;
    if(f.group && !g.groups.has(f.group))return false;
    if(f.variable && !g.variableIds.has(f.variable))return false;
    if(f.strategy && !g.strategies.has(f.strategy))return false;
    if(f.tactic && !hasValue(g,'tactics',f.tactic))return false;
    if(f.year && g.year!==f.year)return false;
    if(!matchesPair(g,activePair))return false;
    return true;
  }
  function sourceCard(g,compact,score){
    var a=make('article',null,'db-evidence-card');
    var meta=make('div',null,'db-card-meta');
    [g.caseName,'Episode '+g.episode,g.year||'Year unspecified',g.recordType].forEach(function(x){
      meta.appendChild(make('span',x,'badge'));
    });
    if(typeof score==='number'&&Number.isFinite(score)){
      meta.appendChild(make('span','BM25 '+score.toFixed(3),'badge'));
    }
    a.append(meta,make('h4',g.text.slice(0,95)+(g.text.length>95?'…':'')));
    var tags=make('div',null,'db-tags');
    g.variableIds.forEach(function(x){tags.appendChild(make('span',formatVar(x),'db-chip'));});
    g.strategies.forEach(function(x){tags.appendChild(make('span',x,'db-chip strategy'));});
    g.tactics.forEach(function(x){tags.appendChild(make('span',x,'db-chip tactic'));});
    a.appendChild(tags);
    var length=compact?380:460;
    a.appendChild(make('p',g.text.slice(0,length)+(g.text.length>length?'…':''),'db-excerpt'));
    var info=make('details');
    info.appendChild(make('summary','Read full coded excerpt and source'));
    info.appendChild(make('p',g.text,'db-full-excerpt'));
    info.appendChild(make('p','Original coding rows: '+g.rows.length+' · Source: '+Array.from(g.sources).join(', '),'db-source-line'));
    var refs=make('p',null,'db-source-line');
    refs.appendChild(document.createTextNode('UN report references in source: '));
    if(g.reports.size){
      g.reports.forEach(function(symbol){var a=make('a',symbol);a.href='https://docs.un.org/en/'+encodeURIComponent(symbol);
        a.target='_blank';a.rel='noopener noreferrer';refs.appendChild(a);refs.appendChild(document.createTextNode(' '));});
    }else{refs.appendChild(document.createTextNode('Not supplied'));}
    info.appendChild(refs);
    a.appendChild(info);
    return a;
  }
  var recordLimit=15, documentLimit=10, lastEvidence=[],lastDocs=[];
  function renderEvidence(){
    var f=selectedFilters(),list=$('ev-records');
    var scored = ENGINE.search(excerptIndex,f.q,{mode:f.match,sort:'relevance'});
    // BM25 ranks the whole EXPOSE excerpt corpus; filters restrict those ranked results.
    // An empty query keeps the source order instead of claiming any relevance ranking.
    var ranked = f.q ? scored.rows.map(function(hit){
      return {excerpt:hit.document.excerpt,score:hit.score};
    }) : evidence.map(function(g){return {excerpt:g,score:null};});
    lastEvidence=ranked.filter(function(hit){return recordMatches(hit.excerpt,f);});
    list.replaceChildren();
    lastEvidence.slice(0,recordLimit).forEach(function(hit){
      list.appendChild(sourceCard(hit.excerpt,false,hit.score));
    });
    if(!lastEvidence.length)list.appendChild(make('p','No coded excerpts match. Try broader filters or different search words.','empty'));
    $('ev-count').textContent=lastEvidence.length+' distinct excerpts · '+Math.min(lastEvidence.length,recordLimit)+' shown'+
      (f.q?' · BM25 relevance order':' · source order')+
      (activePair?' · Pair filter active':'');
    $('ev-more').hidden=recordLimit>=lastEvidence.length;
    if(activePair){
      var pairDescription=make('p','Selected matrix cell: '+nameFor(activePair.rowType,activePair.rowValue)+
         ' × '+nameFor(activePair.colType,activePair.colValue)+'. Clear filters to remove this combination.','db-active-pair');
      list.prepend(pairDescription);
    }
    renderDocuments(f);
    updateUrl();
  }
  function renderDocuments(f){
    var search;
    try{search=ENGINE.search(IDX,f.q,{caseId:f.caseId,episode:f.episode,mode:f.match,sort:'relevance'});}
    catch(e){search={rows:[],terms:[]};}
    // Scope documents by coding filters; a document qualifies if at least one of its
    // coded excerpts satisfies them, not necessarily the keyword-matching passage.
    var needsCoding=!!(f.status||f.group||f.variable||f.strategy||f.tactic||f.year||activePair);
    var matchingEpisodes=new Set();
    if(needsCoding){
      evidence.filter(function(g){return recordMatches(g,f);}).forEach(function(g){matchingEpisodes.add(g.episode);});
    }
    lastDocs=(search.rows||[]).filter(function(x){
      return !needsCoding||matchingEpisodes.has(String(x.document.id));
    });
    var list=$('ev-documents');list.replaceChildren();
    lastDocs.slice(0,documentLimit).forEach(function(result){
      var doc=result.document;
      var a=make('article',null,'db-document-card');
      a.append(make('span',doc.case+' · Episode '+doc.id,'badge'));
      if(f.q)a.appendChild(make('span','BM25 '+result.score.toFixed(3),'badge'));
      a.appendChild(make('h4',doc.title));
      a.appendChild(make('p',(doc.start||'Start not supplied')+' – '+(doc.end||'End not supplied'),'db-source-line'));
      var preview=String(doc.text||'').slice(0,450);
      if(f.q){
        var pos=String(doc.text||'').toLowerCase().indexOf(f.q.toLowerCase().split(/\s+/)[0]);
        if(pos>=0)preview=String(doc.text||'').slice(Math.max(0,pos-130),pos+340);
      }
      a.appendChild(make('p',(preview.length<doc.text.length?'…':'')+preview+(preview.length<doc.text.length?'…':''),'db-excerpt'));
      var footer=make('div',null,'db-document-actions');
      var download=make('a','Download episode document','btn btn-outline btn-sm');
      download.href=doc.download;download.download=doc.sourceFile;footer.append(download);
      var details=make('details');
      details.appendChild(make('summary','Read complete episode document text'));
      var loaded=false;details.addEventListener('toggle',function(){
        if(details.open&&!loaded){details.appendChild(make('div',doc.text,'db-full-document'));loaded=true;}
      });
      footer.append(details);
      a.appendChild(footer);list.appendChild(a);
    });
    if(!lastDocs.length)list.appendChild(make('p','No episode documents match these filters.','empty'));
    $('doc-count').textContent=lastDocs.length+' episode documents · '+Math.min(documentLimit,lastDocs.length)+' shown'+
      (f.q?' · BM25 relevance order':' · source order');
    $('doc-more').hidden=documentLimit>=lastDocs.length;
  }
  function resetEvidence(){
    ['ev-keyword','ev-case','ev-episode','ev-status','ev-group','ev-variable','ev-strategy',
      'ev-tactic','ev-year'].forEach(function(id){$(id).value='';});
    $('ev-match').value='any';activePair=null;recordLimit=15;documentLimit=10;
    updateEpisodes('ev-case','ev-episode');renderEvidence();
  }
  ['ev-keyword','ev-status','ev-group','ev-variable','ev-strategy','ev-tactic','ev-year','ev-match']
   .forEach(function(id){$(id).addEventListener(id==='ev-keyword'?'input':'change',function(){
     recordLimit=15;documentLimit=10;activePair=null;renderEvidence();
   });});
  $('ev-case').addEventListener('change',function(){updateEpisodes('ev-case','ev-episode');activePair=null;recordLimit=15;documentLimit=10;renderEvidence();});
  $('ev-episode').addEventListener('change',function(){activePair=null;recordLimit=15;documentLimit=10;renderEvidence();});
  $('ev-clear').addEventListener('click',resetEvidence);
  $('ev-more').addEventListener('click',function(){recordLimit+=15;renderEvidence();});
  $('doc-more').addEventListener('click',function(){documentLimit+=10;renderEvidence();});

  var dims={
    sanctions:sanctionVars.map(function(v){return {value:v.variableId,label:formatVar(v.variableId)};}),
    strategies:validStrategies.map(function(s){return {value:s,label:s};}),
    tactics:tacticOptions.map(function(t){return {value:t,label:t};}),
    cases:cases.map(function(c){return {value:String(c.id),label:c.name};}),
    episodes:episodes.map(function(e){return {value:e.id,label:e.id+' · '+(e.case||caseMap.get(String(e.caseId))?.name||'Case')};})
  };
  function nameFor(type,value){
    var list=dims[type]||[];var found=list.find(function(x){return x.value===value;});
    return found?found.label:value;
  }
  function matrixScope(){
    var c=$('mx-case').value,ep=$('mx-episode').value;
    return episodes.filter(function(e){return (!c||String(e.caseId)===c)&&(!ep||String(e.id)===ep);});
  }
  function codeFor(ep,dim,value){
    if(dim==='cases')return String(ep.caseId)===String(value)?1:9;
    if(dim==='episodes')return String(ep.id)===String(value)?1:9;
    var varId=dim==='sanctions'?value:dim==='strategies'?strategyId[value]:tacticCode.get(normal(value));
    var row=CODE.episodeCodes[String(ep.id)];
    return row&&varId&&[0,1,9].includes(row[varId])?row[varId]:9;
  }
  function matchingEvidence(rowType,rowValue,colType,colValue){
    var sc=$('mx-case').value,se=$('mx-episode').value;
    return codedEvidence.filter(function(g){
      return (!sc||g.caseId===sc)&&(!se||g.episode===se)&&
        hasValue(g,rowType,rowValue)&&hasValue(g,colType,colValue);
    });
  }
  function cellValue(rowType,rowValue,colType,colValue){
    var examples=matchingEvidence(rowType,rowValue,colType,colValue);
    if(examples.length)return {code:1,examples:examples};
    var scopes=matrixScope();
    var informative=scopes.some(function(ep){
      return codeFor(ep,rowType,rowValue)!==9 && codeFor(ep,colType,colValue)!==9;
    });
    return {code:informative?0:9,examples:[]};
  }
  var matrixDetailPair=null;
  function renderMatrix(){
    $('mx-details').hidden=true;matrixDetailPair=null;
    var rowType=$('mx-row').value,colType=$('mx-col').value,
      selectedCase=$('mx-case').value,selectedEpisode=$('mx-episode').value,
      rfilter=normal($('mx-row-search').value),cfilter=normal($('mx-col-search').value);
    var table=$('mx-table');table.replaceChildren();
    if(rowType===colType){
      $('mx-summary').textContent='Select two different dimensions to compare.';
      return;
    }

    // Case and Episode are different dimensions. A selected episode has its
    // own scope; it must not show its sibling episodes or other case labels.
    function inScope(dim,item){
      if(dim==='cases'){
        if(selectedCase && item.value!==selectedCase)return false;
        if(selectedEpisode){
          var chosen=episodeMap.get(selectedEpisode);
          if(!chosen || String(chosen.caseId)!==item.value)return false;
        }
      }
      if(dim==='episodes'){
        if(selectedEpisode && item.value!==selectedEpisode)return false;
        if(selectedCase){
          var e=episodeMap.get(item.value);
          if(!e || String(e.caseId)!==selectedCase)return false;
        }
      }
      return true;
    }

    var rows=dims[rowType].filter(function(x){
      return inScope(rowType,x) && normal(x.label).includes(rfilter);
    });
    var cols=dims[colType].filter(function(x){
      return inScope(colType,x) && normal(x.label).includes(cfilter);
    });

    // Evaluate only scoped combinations. NO DATA means code 9 and is never
    // silently changed into 0. The checkbox affects visibility, not coding.
    var cells=rows.map(function(row){
      return cols.map(function(col){
        return cellValue(rowType,row.value,colType,col.value);
      });
    });
    var showEmpty=$('mx-show-empty').checked;
    var rowIndexes=rows.map(function(_,i){return i;});
    var colIndexes=cols.map(function(_,i){return i;});
    if(!showEmpty){
      rowIndexes=rowIndexes.filter(function(i){
        return cells[i].some(function(cell){return cell.code!==9;});
      });
      colIndexes=colIndexes.filter(function(j){
        return rowIndexes.some(function(i){return cells[i][j].code!==9;});
      });
    }
    var hiddenRows=rows.length-rowIndexes.length;
    var hiddenCols=cols.length-colIndexes.length;
    var thead=make('thead'),hrow=make('tr');
    hrow.appendChild(make('th',rowType+' × '+colType,'db-matrix-corner'));
    colIndexes.forEach(function(j){
      var th=make('th',cols[j].label);
      th.scope='col';hrow.appendChild(th);
    });
    thead.appendChild(hrow);table.appendChild(thead);
    var tbody=make('tbody'),count={yes:0,no:0,na:0};
    rowIndexes.forEach(function(i){
      var row=rows[i],tr=make('tr'),rh=make('th',row.label);
      rh.scope='row';tr.appendChild(rh);
      colIndexes.forEach(function(j){
        var col=cols[j],result=cells[i][j];
        var label=result.code===1?'YES':result.code===0?'NO':'NO DATA';
        var td=make('td',null,'db-cell-'+(result.code===1?'yes':result.code===0?'no':'na'));
        if(result.code===1){
          count.yes++;
          var btn=make('button','YES','db-yes-button');
          btn.type='button';
          btn.title='Open '+result.examples.length+' distinct supporting excerpt(s)';
          btn.setAttribute('aria-label','YES: '+row.label+' and '+col.label+'; open '+result.examples.length+' examples');
          btn.addEventListener('click',function(){
            showMatrixExamples(rowType,row.value,colType,col.value,result.examples);
          });
          td.appendChild(btn);
        }else{
          count[result.code===0?'no':'na']++;
          td.appendChild(make('span',label));
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    var scopeLabel=selectedEpisode?'Episode '+selectedEpisode:
      selectedCase?'Case '+selectedCase+' (all its episodes)':'All cases and episodes';
    $('mx-summary').textContent=scopeLabel+' · '+rowIndexes.length+' rows × '+colIndexes.length+
      ' columns · '+count.yes+' YES · '+count.no+' NO · '+count.na+' NO DATA.'+
      (!showEmpty && (hiddenRows||hiddenCols) ?
        ' Hidden because exclusively NO DATA: '+hiddenRows+' rows, '+hiddenCols+' columns. Use the checkbox to reveal them.' : '')+
      (!rowIndexes.length || !colIndexes.length ?
        ' No informative comparisons for this selection; enable "Show NO DATA-only rows and columns" to inspect unavailable coding.' : '')+
      ' YES shows co-coded excerpts, not necessarily unique evasion incidents.';
  }
  function showMatrixExamples(rowType,rowValue,colType,colValue,examples){
    matrixDetailPair={rowType:rowType,rowValue:rowValue,colType:colType,colValue:colValue};
    $('mx-details-title').textContent=nameFor(rowType,rowValue)+' × '+nameFor(colType,colValue);
    $('mx-details-count').textContent=examples.length+' distinct matching coded excerpts · first '+Math.min(15,examples.length)+' shown';
    var list=$('mx-examples');list.replaceChildren();
    examples.slice(0,15).forEach(function(g){list.appendChild(sourceCard(g,true));});
    $('mx-details').hidden=false;
    $('mx-details').scrollIntoView({behavior:'smooth',block:'start'});
  }
  $('mx-close').addEventListener('click',function(){$('mx-details').hidden=true;});
  $('mx-all').addEventListener('click',function(){
    if(!matrixDetailPair)return;
    activePair=matrixDetailPair;
    ['ev-keyword','ev-case','ev-episode','ev-status','ev-group','ev-variable','ev-strategy','ev-tactic','ev-year']
      .forEach(function(id){$(id).value='';});
    $('ev-match').value='any';
    $('ev-case').value=$('mx-case').value;
    updateEpisodes('ev-case','ev-episode');
    $('ev-episode').value=$('mx-episode').value;
    recordLimit=15;documentLimit=10;
    activate('search');
    renderEvidence();
    $('evidence-view').scrollIntoView({behavior:'smooth',block:'start'});
  });
  ['mx-row','mx-col','mx-row-search','mx-col-search'].forEach(function(id){
    $(id).addEventListener(id.endsWith('-search')?'input':'change',renderMatrix);
  });
  $('mx-case').addEventListener('change',function(){updateEpisodes('mx-case','mx-episode');renderMatrix();});
  $('mx-episode').addEventListener('change',renderMatrix);
  $('mx-show-empty').addEventListener('change',renderMatrix);

  var currentView='search';
  function activate(view){
    currentView=view==='matrix'?'matrix':'search';
    var matrix=currentView==='matrix';
    $('evidence-view').hidden=matrix;$('matrix-view').hidden=!matrix;
    $('tab-evidence').setAttribute('aria-selected',String(!matrix));
    $('tab-matrix').setAttribute('aria-selected',String(matrix));
    if(matrix)renderMatrix();
    updateUrl();
  }
  function updateUrl(){
    var q=new URLSearchParams();
    q.set('view',currentView);
    if(currentView==='search'){
      var f=selectedFilters();
      var pairs={q:f.q,case:f.caseId,episode:f.episode,status:f.status,group:f.group,
        variable:f.variable,strategy:f.strategy,tactic:f.tactic,year:f.year};
      Object.entries(pairs).forEach(function(pair){if(pair[1])q.set(pair[0],pair[1]);});
    }
    try{history.replaceState(null,'',location.pathname+'?'+q.toString());}catch(e){}
  }
  $('tab-evidence').addEventListener('click',function(){activate('search');});
  $('tab-matrix').addEventListener('click',function(){activate('matrix');});

  var params=new URLSearchParams(location.search);
  var fields=[['q','ev-keyword'],['case','ev-case'],['status','ev-status'],['group','ev-group'],
    ['variable','ev-variable'],['strategy','ev-strategy'],['tactic','ev-tactic'],['year','ev-year']];
  fields.forEach(function(pair){
    var v=params.get(pair[0]),s=$(pair[1]);
    if(v!==null&&(s.tagName==='INPUT'||Array.from(s.options).some(function(o){return o.value===v;})))s.value=v;
  });
  updateEpisodes('ev-case','ev-episode');
  if(params.has('episode')&&Array.from($('ev-episode').options).some(function(o){return o.value===params.get('episode');}))
    $('ev-episode').value=params.get('episode');
  activate(params.get('view')==='matrix'?'matrix':'search');
  renderEvidence();
})();
