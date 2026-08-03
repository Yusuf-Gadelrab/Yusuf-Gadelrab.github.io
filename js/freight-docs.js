/* Freight Paperwork Generator — 100% client-side. No fetch, no beacon, no
   analytics call carries form data. Everything below reads the DOM, writes
   the DOM, and touches localStorage under one namespaced key. Nothing else. */
(function(){
  'use strict';

  var STORE_KEY='freightdocs.v1.draft';
  var form=document.getElementById('fdForm');
  if(!form) return;

  function $(id){ return document.getElementById(id); }
  function val(id){ var el=$(id); return el? el.value.trim() : ''; }
  function raw(id){ var el=$(id); return el? el.value : ''; }
  function num(id){ var el=$(id); if(!el) return 0; var n=parseFloat(el.value); return isNaN(n)?0:n; }
  function checked(id){ var el=$(id); return !!(el && el.checked); }

  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function money(n){
    n=Math.round((n||0)*100)/100;
    return '$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  }
  function orBlank(v,ph){
    var t=(v==null?'':String(v)).trim();
    if(t) return esc(t);
    return '<span class="fd-doc__blank">['+esc(ph||'not entered')+']</span>';
  }
  function orBlankText(v,ph){
    var t=(v==null?'':String(v)).trim();
    return t? t : '['+(ph||'not entered')+']';
  }
  function fmtDate(v){
    if(!v) return '';
    try{
      var p=v.split('-');
      var d=new Date(parseInt(p[0],10),parseInt(p[1],10)-1,parseInt(p[2],10));
      return d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
    }catch(e){ return v; }
  }
  function cityLine(city,state,zip){
    var s=[city,state].filter(Boolean).join(', ');
    if(zip) s=(s? s+' ':'')+zip;
    return s;
  }

  var LEGAL_HTML='<p class="fd-doc__legal">This document is a generated template for illustrative use only. '
    +'It is not legal advice and does not by itself create a binding agreement between any parties. '
    +'Every rate, date, term and clause on this page is a default until you replace it with your own real figures, '
    +'and the underlying language should be reviewed and adapted by a licensed attorney before you send it, sign it, '
    +'or rely on it in a dispute. Generated at yusuf-gadelrab.github.io/freight-docs.html.</p>';

  var LEGAL_TEXT='This document is a generated template for illustrative use only. It is not legal advice and does '
    +'not by itself create a binding agreement between any parties. Every rate, date, term and clause here is a '
    +'default until replaced with real figures, and the language should be reviewed and adapted by a licensed '
    +'attorney before you send it, sign it, or rely on it in a dispute. Generated at yusuf-gadelrab.github.io/freight-docs.html.';

  var REQUIRED=['fd_loadNumber','fd_originName','fd_originCity','fd_originState',
    'fd_destName','fd_destCity','fd_destState','fd_carrierName'];

  var REQ_DOCS=[
    ['fd_doc_rc','Signed rate confirmation'],
    ['fd_doc_bol','Signed bill of lading'],
    ['fd_doc_pod','Proof of delivery / signed delivery receipt'],
    ['fd_doc_lumper','Lumper receipt(s), if applicable'],
    ['fd_doc_detention','Detention / layover log with in and out times'],
    ['fd_doc_scale','Certified scale ticket, if applicable']
  ];

  var CP_ITEMS=[
    ['fd_cp_w9','Completed IRS Form W-9'],
    ['fd_cp_coi','Certificate of insurance: auto liability and cargo'],
    ['fd_cp_agreement','Signed broker-carrier agreement'],
    ['fd_cp_noa','Notice of assignment acknowledgment, if factoring'],
    ['fd_cp_ach','Voided check or ACH payment authorization'],
    ['fd_cp_authority','Copy of active MC authority / DOT registration'],
    ['fd_cp_safety','Acknowledgment of current FMCSA safety rating']
  ];

  /* ---------- pull every field into one plain object ---------------------- */
  function collectDoc(){
    var linehaul=num('fd_linehaul'), fuel=num('fd_fuel'), acc=num('fd_accessorials');
    var payTerms=val('fd_paymentTerms');
    if(payTerms==='Custom') payTerms=val('fd_paymentCustom')||'Custom terms, see note';
    return {
      brokerName:val('fd_brokerName'), brokerMC:val('fd_brokerMC'), brokerAddr:val('fd_brokerAddr'),
      brokerPhone:val('fd_brokerPhone'), brokerEmail:val('fd_brokerEmail'), brokerContact:val('fd_brokerContact'),

      loadNumber:val('fd_loadNumber'), bolNumber:val('fd_bolNumber'), poNumber:val('fd_poNumber'),

      originName:val('fd_originName'), originAddr:val('fd_originAddr'),
      originCity:val('fd_originCity'), originState:val('fd_originState'), originZip:val('fd_originZip'),
      originDate:raw('fd_originDate'), originWindow:val('fd_originWindow'),
      originContact:val('fd_originContact'), originPhone:val('fd_originPhone'),

      destName:val('fd_destName'), destAddr:val('fd_destAddr'),
      destCity:val('fd_destCity'), destState:val('fd_destState'), destZip:val('fd_destZip'),
      destDate:raw('fd_destDate'), destWindow:val('fd_destWindow'),
      destContact:val('fd_destContact'), destPhone:val('fd_destPhone'),

      equipment:val('fd_equipment'), tempRange:val('fd_tempRange'),
      commodity:val('fd_commodity'), pieces:val('fd_pieces'), weight:val('fd_weight'),
      nmfcClass:val('fd_nmfcClass'), declaredValue:num('fd_declaredValue'),

      linehaul:linehaul, fuel:fuel, accessorials:acc, total:linehaul+fuel+acc,
      accessorialsNote:val('fd_accessorialsNote'), detentionTerms:val('fd_detentionTerms'),
      paymentTerms:payTerms,

      carrierName:val('fd_carrierName'), carrierMC:val('fd_carrierMC'), carrierDOT:val('fd_carrierDOT'),
      carrierDispatch:val('fd_carrierDispatch'), carrierPhone:val('fd_carrierPhone'), carrierEmail:val('fd_carrierEmail'),
      driverName:val('fd_driverName'), driverPhone:val('fd_driverPhone'),
      truckNumber:val('fd_truckNumber'), trailerNumber:val('fd_trailerNumber'),

      billTo:val('fd_billTo'), billToParty:val('fd_billToParty'),
      specialInstructions:val('fd_specialInstructions'),

      cpDueDate:raw('fd_cp_dueDate'), cpReturnTo:val('fd_cp_returnTo')||val('fd_brokerEmail'),

      tenderDeadline:val('fd_tenderDeadline'), tenderNotes:val('fd_tenderNotes')
    };
  }

  /* ---------- HTML renderers ------------------------------------------------ */
  function letterheadHTML(d,docTitle,docSub){
    return ''
      +'<div class="fd-doc__letterhead">'
      +  '<div><div class="fd-eyebrow">Broker</div>'
      +  '<div class="fd-doc__brand">'+orBlank(d.brokerName,'Your company name')+'</div>'
      +  '<div class="fd-doc__brand-sub">'
      +    (d.brokerAddr? esc(d.brokerAddr)+'<br>':'')
      +    [d.brokerPhone,d.brokerEmail].filter(Boolean).map(esc).join(' &middot; ')
      +    (d.brokerMC? '<br>'+esc(d.brokerMC):'')
      +  '</div></div>'
      +  '<div class="fd-doc__doctag"><h1>'+esc(docTitle)+'</h1><p>'+esc(docSub||'')+'</p></div>'
      +'</div><hr class="fd-gold-rule">';
  }

  function partyCard(title,name,addr,city,state,zip,extraLines){
    var lines=(extraLines||[]).filter(Boolean).map(function(l){return '<p>'+l+'</p>';}).join('');
    return '<div class="fd-doc__card"><h3>'+esc(title)+'</h3>'
      +'<div class="name">'+orBlank(name,'not entered')+'</div>'
      +(addr? '<p>'+esc(addr)+'</p>':'')
      +(city||state||zip? '<p>'+esc(cityLine(city,state,zip))+'</p>':'')
      +lines+'</div>';
  }

  function renderRC(d){
    var out=letterheadHTML(d,'Rate Confirmation','Load '+orBlankText(d.loadNumber,'#'));
    out+='<div class="fd-doc__meta">'
      +'<div class="cell"><div class="lbl">Load #</div><div class="val">'+orBlank(d.loadNumber)+'</div></div>'
      +'<div class="cell"><div class="lbl">PO / Ref #</div><div class="val">'+esc(d.poNumber||'—')+'</div></div>'
      +'<div class="cell"><div class="lbl">Equipment</div><div class="val">'+esc(d.equipment||'—')+'</div></div>'
      +'<div class="cell"><div class="lbl">Total rate</div><div class="val">'+money(d.total)+'</div></div>'
      +'</div>';

    out+='<div class="fd-doc__cols">'
      +partyCard('Carrier',d.carrierName,null,null,null,null,[
        d.carrierMC? esc(d.carrierMC):null, d.carrierDOT? esc(d.carrierDOT):null,
        d.carrierDispatch? 'Dispatch: '+esc(d.carrierDispatch):null,
        [d.carrierPhone,d.carrierEmail].filter(Boolean).map(esc).join(' &middot; ')||null
      ])
      +partyCard('Driver &amp; equipment',d.driverName||'Driver TBD',null,null,null,null,[
        d.driverPhone? esc(d.driverPhone):null,
        (d.truckNumber||d.trailerNumber)? ('Truck '+esc(d.truckNumber||'—')+' / Trailer '+esc(d.trailerNumber||'—')):null
      ])
      +'</div>';

    out+='<div class="fd-doc__cols">'
      +'<div class="fd-doc__card"><h3>Pickup</h3>'
      +'<div class="name">'+orBlank(d.originName,'shipper name')+'</div>'
      +(d.originAddr? '<p>'+esc(d.originAddr)+'</p>':'')
      +'<p>'+orBlank(cityLine(d.originCity,d.originState,d.originZip),'city, state')+'</p>'
      +'<div class="window"><b>Date</b> '+(d.originDate? esc(fmtDate(d.originDate)):'not set')
      +' &middot; <b>Window</b> '+esc(d.originWindow||'not set')+'</div>'
      +(d.originContact||d.originPhone? '<p style="margin-top:6px">'+[d.originContact,d.originPhone].filter(Boolean).map(esc).join(' &middot; ')+'</p>':'')
      +'</div>'
      +'<div class="fd-doc__card"><h3>Delivery</h3>'
      +'<div class="name">'+orBlank(d.destName,'consignee name')+'</div>'
      +(d.destAddr? '<p>'+esc(d.destAddr)+'</p>':'')
      +'<p>'+orBlank(cityLine(d.destCity,d.destState,d.destZip),'city, state')+'</p>'
      +'<div class="window"><b>Date</b> '+(d.destDate? esc(fmtDate(d.destDate)):'not set')
      +' &middot; <b>Window</b> '+esc(d.destWindow||'not set')+'</div>'
      +(d.destContact||d.destPhone? '<p style="margin-top:6px">'+[d.destContact,d.destPhone].filter(Boolean).map(esc).join(' &middot; ')+'</p>':'')
      +'</div>'
      +'</div>';

    out+='<div class="fd-doc__card" style="margin-bottom:16px"><h3>Commodity</h3>'
      +'<p>'+orBlank(d.commodity,'commodity description')
      +(d.pieces? ' &middot; '+esc(d.pieces)+' pcs':'')
      +(d.weight? ' &middot; '+esc(d.weight)+' lb':'')
      +(d.nmfcClass? ' &middot; '+esc(d.nmfcClass):'')
      +(d.tempRange? ' &middot; '+esc(d.tempRange):'')
      +'</p>'
      +(d.declaredValue? '<p>Declared value: '+money(d.declaredValue)+'</p>':'')
      +'</div>';

    out+='<table class="fd-doc__table">'
      +'<tr><td>Linehaul</td><td class="num">'+money(d.linehaul)+'</td></tr>'
      +'<tr><td>Fuel surcharge</td><td class="num">'+money(d.fuel)+'</td></tr>'
      +'<tr><td>Accessorials'+(d.accessorialsNote? ' ('+esc(d.accessorialsNote)+')':'')+'</td><td class="num">'+money(d.accessorials)+'</td></tr>'
      +'<tr class="total"><td>Total rate</td><td class="num">'+money(d.total)+'</td></tr>'
      +'</table>';

    out+='<div class="fd-doc__note"><b>Detention / accessorial terms:</b> '+esc(d.detentionTerms||'None stated')+'<br>'
      +'<b>Payment terms:</b> '+esc(d.paymentTerms||'Not stated')+'</div>';

    var reqDocs=REQ_DOCS.filter(function(r){ return checked(r[0]); });
    if(reqDocs.length){
      out+='<h3 style="font-size:9.5px;letter-spacing:1.8px;text-transform:uppercase;color:#8a7328;'
        +'font-family:-apple-system,sans-serif;margin-bottom:8px">Documents required for payment</h3>'
        +'<ul class="fd-doc__list">'+reqDocs.map(function(r){return '<li>'+esc(r[1])+'</li>';}).join('')+'</ul>';
    }

    out+='<p class="fd-doc__terms">By accepting this load, carrier confirms it holds active operating authority, '
      +'current cargo and liability insurance, and agrees to the rate, terms and required documents stated above. '
      +'Rate is not valid until this confirmation is signed by both parties; any change to rate, equipment or '
      +'schedule must be confirmed in writing before the load is picked up.</p>';

    out+='<div class="fd-doc__sig-grid">'
      +'<div><div class="fd-doc__sig-line"></div><div class="fd-doc__sig-label">Broker signature / date</div></div>'
      +'<div><div class="fd-doc__sig-line"></div><div class="fd-doc__sig-label">Carrier signature / date</div></div>'
      +'</div>';

    out+=LEGAL_HTML;
    return out;
  }

  function renderBOL(d){
    var out=letterheadHTML(d,'Bill of Lading','Straight bill, not negotiable');
    out+='<div class="fd-doc__meta">'
      +'<div class="cell"><div class="lbl">BOL #</div><div class="val">'+esc(d.bolNumber||'—')+'</div></div>'
      +'<div class="cell"><div class="lbl">Load / PO #</div><div class="val">'+esc([d.loadNumber,d.poNumber].filter(Boolean).join(' / ')||'—')+'</div></div>'
      +'<div class="cell"><div class="lbl">Ship date</div><div class="val">'+(d.originDate? esc(fmtDate(d.originDate)):'—')+'</div></div>'
      +'<div class="cell"><div class="lbl">Freight charges</div><div class="val">'+esc(d.billTo||'Prepaid')+'</div></div>'
      +'</div>';

    out+='<div class="fd-doc__cols">'
      +'<div class="fd-doc__card"><h3>Shipper</h3>'
      +'<div class="name">'+orBlank(d.originName,'shipper name')+'</div>'
      +(d.originAddr? '<p>'+esc(d.originAddr)+'</p>':'')
      +'<p>'+orBlank(cityLine(d.originCity,d.originState,d.originZip),'city, state')+'</p></div>'
      +'<div class="fd-doc__card"><h3>Consignee</h3>'
      +'<div class="name">'+orBlank(d.destName,'consignee name')+'</div>'
      +(d.destAddr? '<p>'+esc(d.destAddr)+'</p>':'')
      +'<p>'+orBlank(cityLine(d.destCity,d.destState,d.destZip),'city, state')+'</p></div>'
      +'</div>';

    out+='<div class="fd-doc__card" style="margin-bottom:16px"><h3>Carrier</h3>'
      +'<div class="name">'+orBlank(d.carrierName,'carrier legal name')+'</div>'
      +'<p>'+[d.carrierMC,d.carrierDOT].filter(Boolean).map(esc).join(' &middot; ')+'</p>'
      +(d.truckNumber||d.trailerNumber? '<p>Truck '+esc(d.truckNumber||'—')+' / Trailer '+esc(d.trailerNumber||'—')+'</p>':'')
      +'</div>';

    out+='<table class="fd-doc__table">'
      +'<tr><td>Commodity</td><td class="num">'+orBlank(d.commodity,'not entered')+'</td></tr>'
      +'<tr><td>NMFC / class</td><td class="num">'+esc(d.nmfcClass||'—')+'</td></tr>'
      +'<tr><td>Pieces</td><td class="num">'+esc(d.pieces||'—')+'</td></tr>'
      +'<tr><td>Weight (lb)</td><td class="num">'+esc(d.weight||'—')+'</td></tr>'
      +'<tr><td>Declared value</td><td class="num">'+(d.declaredValue? money(d.declaredValue):'—')+'</td></tr>'
      +'</table>';

    if(d.billTo==='Third Party' && d.billToParty){
      out+='<div class="fd-doc__note"><b>Bill freight charges to:</b> '+esc(d.billToParty)+'</div>';
    }
    if(d.specialInstructions){
      out+='<div class="fd-doc__note"><b>Special instructions:</b> '+esc(d.specialInstructions)+'</div>';
    }

    out+='<p class="fd-doc__terms">This shipment is received subject to the shipper\'s and carrier\'s applicable '
      +'transportation agreements, tariffs and the rate confirmation issued for this load, and to applicable state '
      +'and federal law. Carrier acknowledges receipt of the shipment described above in apparent good order, except '
      +'as noted, and agrees to deliver it in the same condition to the consignee named above.</p>';

    out+='<div class="fd-doc__sig-grid">'
      +'<div><div class="fd-doc__sig-line"></div><div class="fd-doc__sig-label">Shipper signature / date</div></div>'
      +'<div><div class="fd-doc__sig-line"></div><div class="fd-doc__sig-label">Driver signature / date</div></div>'
      +'<div><div class="fd-doc__sig-line"></div><div class="fd-doc__sig-label">Consignee signature / date</div></div>'
      +'</div>';

    out+=LEGAL_HTML;
    return out;
  }

  function renderCP(d){
    var out=letterheadHTML(d,'Carrier Packet','Onboarding request');
    out+='<div class="fd-doc__meta">'
      +'<div class="cell"><div class="lbl">Carrier</div><div class="val">'+orBlank(d.carrierName,'not entered')+'</div></div>'
      +'<div class="cell"><div class="lbl">MC / DOT</div><div class="val">'+esc([d.carrierMC,d.carrierDOT].filter(Boolean).join(' / ')||'—')+'</div></div>'
      +'<div class="cell"><div class="lbl">Documents due</div><div class="val">'+(d.cpDueDate? esc(fmtDate(d.cpDueDate)):'—')+'</div></div>'
      +'<div class="cell"><div class="lbl">Return to</div><div class="val">'+esc(d.cpReturnTo||'—')+'</div></div>'
      +'</div>';

    out+='<div class="fd-doc__note">Before we can tender freight to <b>'+orBlank(d.carrierName,'this carrier')+'</b>, '
      +'please return the items checked below'+(d.cpDueDate? ' by <b>'+esc(fmtDate(d.cpDueDate))+'</b>':'')+'.</div>';

    var items=CP_ITEMS.filter(function(i){ return checked(i[0]); });
    out+='<ul class="fd-doc__list">'
      +(items.length? items.map(function(i){return '<li>'+esc(i[1])+'</li>';}).join('')
        : '<li>No items selected — check at least one item in the form to build this checklist.</li>')
      +'</ul>';

    out+='<div class="fd-doc__note"><b>Questions about this request:</b> '
      +[d.brokerContact,d.brokerPhone,d.brokerEmail].filter(Boolean).map(esc).join(' &middot; ')+'</div>';

    out+='<p class="fd-doc__terms">Onboarding is a one-time step completed before a carrier\'s first tendered load. '
      +'Documents are held for compliance and payment-setup purposes only and are not shared outside the parties '
      +'named on this load.</p>';

    out+=LEGAL_HTML;
    return out;
  }

  function renderTender(d){
    var lane=cityLine(d.originCity,d.originState,'')+' &rarr; '+cityLine(d.destCity,d.destState,'');
    var out=letterheadHTML(d,'Load Tender','Email + SMS');

    var subject='Load tender: '+cityLine(d.originCity,d.originState,'')+' to '+cityLine(d.destCity,d.destState,'')
      +' / '+(d.equipment||'equipment TBD')+' / Ref '+orBlankText(d.loadNumber,'#');
    var body='Hi '+orBlankText(d.carrierDispatch,'there')+',\n\n'
      +'We have a load available and wanted to offer it to you first.\n\n'
      +'Load #: '+orBlankText(d.loadNumber)+'\n'
      +'Pickup: '+orBlankText(d.originName)+', '+cityLine(d.originCity,d.originState,d.originZip)
      +(d.originDate? ' on '+fmtDate(d.originDate):'')+(d.originWindow? ' ('+d.originWindow+')':'')+'\n'
      +'Delivery: '+orBlankText(d.destName)+', '+cityLine(d.destCity,d.destState,d.destZip)
      +(d.destDate? ' on '+fmtDate(d.destDate):'')+(d.destWindow? ' ('+d.destWindow+')':'')+'\n'
      +'Equipment: '+orBlankText(d.equipment)+'\n'
      +'Commodity: '+orBlankText(d.commodity)+(d.weight? ', '+d.weight+' lb':'')+(d.pieces? ', '+d.pieces+' pcs':'')+'\n'
      +'All-in rate: '+money(d.total)+'\n\n'
      +'Please reply '+orBlankText(d.tenderDeadline,'as soon as you can')+' to accept. '
      +'A written rate confirmation follows immediately once you accept.\n'
      +(d.tenderNotes? '\n'+d.tenderNotes+'\n':'')
      +'\nThanks,\n'+orBlankText(d.brokerContact,'Dispatch')+'\n'+orBlankText(d.brokerName,'')
      +'\n'+[d.brokerPhone,d.brokerEmail].filter(Boolean).join(' / ');

    var sms='Load avail: '+lane.replace('&rarr;','->')+', '+(d.equipment||'equip TBD')
      +(d.originDate? ', picks up '+fmtDate(d.originDate):'')+'. '+money(d.total)+' all-in. '
      +'Reply YES to accept'+(d.tenderDeadline? ', by '+d.tenderDeadline:'')+'. '
      +'- '+orBlankText(d.brokerContact,'Dispatch')+(d.brokerName? ', '+d.brokerName:'');

    window.__fdTenderSms=sms;

    out+='<div class="fd-doc__tenderblock"><h3>Email</h3>'
      +'<div style="margin-bottom:8px"><b>Subject:</b> '+esc(subject)+'</div>'
      +esc(body)+'</div>';
    out+='<div class="fd-doc__tenderblock"><h3>SMS blurb</h3>'
      +'<div class="fd-doc__tendersms">'+esc(sms)+'</div>'
      +'<div style="margin-top:6px;font-size:10.5px;color:#6b675c">'+sms.length+' characters</div></div>';

    out+=LEGAL_HTML;
    return out;
  }

  /* ---------- plain-text renderers (for "Copy as text") -------------------- */
  function textRC(d){
    var reqDocs=REQ_DOCS.filter(function(r){ return checked(r[0]); });
    return [
      'RATE CONFIRMATION — Load '+orBlankText(d.loadNumber),
      '',
      'Broker: '+orBlankText(d.brokerName)+(d.brokerMC? ' ('+d.brokerMC+')':''),
      d.brokerAddr, [d.brokerPhone,d.brokerEmail].filter(Boolean).join(' / '),
      '',
      'Carrier: '+orBlankText(d.carrierName)+' '+[d.carrierMC,d.carrierDOT].filter(Boolean).join(' / '),
      'Dispatch: '+orBlankText(d.carrierDispatch,'not entered')+' '+[d.carrierPhone,d.carrierEmail].filter(Boolean).join(' / '),
      'Driver: '+orBlankText(d.driverName,'not entered')+' '+(d.driverPhone||''),
      'Truck / trailer: '+orBlankText(d.truckNumber,'—')+' / '+orBlankText(d.trailerNumber,'—'),
      '',
      'PICKUP',
      orBlankText(d.originName)+', '+d.originAddr, cityLine(d.originCity,d.originState,d.originZip),
      'Date: '+(d.originDate? fmtDate(d.originDate):'not set')+'   Window: '+orBlankText(d.originWindow,'not set'),
      '',
      'DELIVERY',
      orBlankText(d.destName)+', '+d.destAddr, cityLine(d.destCity,d.destState,d.destZip),
      'Date: '+(d.destDate? fmtDate(d.destDate):'not set')+'   Window: '+orBlankText(d.destWindow,'not set'),
      '',
      'Commodity: '+orBlankText(d.commodity)+(d.pieces? ', '+d.pieces+' pcs':'')+(d.weight? ', '+d.weight+' lb':'')+(d.nmfcClass? ', '+d.nmfcClass:''),
      d.declaredValue? 'Declared value: '+money(d.declaredValue):'',
      '',
      'RATE',
      'Linehaul: '+money(d.linehaul),
      'Fuel surcharge: '+money(d.fuel),
      'Accessorials'+(d.accessorialsNote? ' ('+d.accessorialsNote+')':'')+': '+money(d.accessorials),
      'TOTAL: '+money(d.total),
      '',
      'Detention / accessorial terms: '+orBlankText(d.detentionTerms,'none stated'),
      'Payment terms: '+orBlankText(d.paymentTerms,'not stated'),
      '',
      reqDocs.length? 'Documents required for payment:\n'+reqDocs.map(function(r){return '  - '+r[1];}).join('\n') : '',
      '',
      LEGAL_TEXT
    ].filter(function(l){return l!==null && l!==undefined;}).join('\n');
  }

  function textBOL(d){
    return [
      'BILL OF LADING (straight, not negotiable)',
      'BOL #: '+orBlankText(d.bolNumber,'not entered')+'   Load/PO #: '+[d.loadNumber,d.poNumber].filter(Boolean).join(' / '),
      'Ship date: '+(d.originDate? fmtDate(d.originDate):'not set')+'   Freight charges: '+orBlankText(d.billTo,'Prepaid'),
      '',
      'SHIPPER: '+orBlankText(d.originName)+', '+d.originAddr+', '+cityLine(d.originCity,d.originState,d.originZip),
      'CONSIGNEE: '+orBlankText(d.destName)+', '+d.destAddr+', '+cityLine(d.destCity,d.destState,d.destZip),
      'CARRIER: '+orBlankText(d.carrierName)+' '+[d.carrierMC,d.carrierDOT].filter(Boolean).join(' / '),
      '',
      'Commodity: '+orBlankText(d.commodity),
      'NMFC / class: '+orBlankText(d.nmfcClass,'—'),
      'Pieces: '+orBlankText(d.pieces,'—')+'   Weight: '+orBlankText(d.weight,'—')+' lb',
      'Declared value: '+(d.declaredValue? money(d.declaredValue):'—'),
      '',
      d.billTo==='Third Party' && d.billToParty? 'Bill freight charges to: '+d.billToParty : '',
      d.specialInstructions? 'Special instructions: '+d.specialInstructions : '',
      '',
      'Received subject to the shipper\'s and carrier\'s applicable transportation agreements, tariffs and the rate '
        +'confirmation for this load, and to applicable state and federal law. Carrier acknowledges receipt in '
        +'apparent good order except as noted, and agrees to deliver in the same condition to the consignee above.',
      '',
      'Signatures required: shipper / driver / consignee',
      '',
      LEGAL_TEXT
    ].filter(function(l){return l!==null && l!==undefined;}).join('\n');
  }

  function textCP(d){
    var items=CP_ITEMS.filter(function(i){ return checked(i[0]); });
    return [
      'CARRIER PACKET — ONBOARDING REQUEST',
      'Carrier: '+orBlankText(d.carrierName),
      'MC / DOT: '+[d.carrierMC,d.carrierDOT].filter(Boolean).join(' / '),
      'Documents due: '+(d.cpDueDate? fmtDate(d.cpDueDate):'not set'),
      'Return to: '+orBlankText(d.cpReturnTo,'not entered'),
      '',
      'Please return the following before we can tender freight:',
      items.length? items.map(function(i){return '  [ ] '+i[1];}).join('\n') : '  (no items selected)',
      '',
      'Questions: '+[d.brokerContact,d.brokerPhone,d.brokerEmail].filter(Boolean).join(' / '),
      '',
      LEGAL_TEXT
    ].join('\n');
  }

  function textTender(d){
    var subject='Load tender: '+cityLine(d.originCity,d.originState,'')+' to '+cityLine(d.destCity,d.destState,'')
      +' / '+(d.equipment||'equipment TBD')+' / Ref '+orBlankText(d.loadNumber,'#');
    var body='Hi '+orBlankText(d.carrierDispatch,'there')+',\n\n'
      +'We have a load available and wanted to offer it to you first.\n\n'
      +'Load #: '+orBlankText(d.loadNumber)+'\n'
      +'Pickup: '+orBlankText(d.originName)+', '+cityLine(d.originCity,d.originState,d.originZip)
      +(d.originDate? ' on '+fmtDate(d.originDate):'')+(d.originWindow? ' ('+d.originWindow+')':'')+'\n'
      +'Delivery: '+orBlankText(d.destName)+', '+cityLine(d.destCity,d.destState,d.destZip)
      +(d.destDate? ' on '+fmtDate(d.destDate):'')+(d.destWindow? ' ('+d.destWindow+')':'')+'\n'
      +'Equipment: '+orBlankText(d.equipment)+'\n'
      +'Commodity: '+orBlankText(d.commodity)+(d.weight? ', '+d.weight+' lb':'')+(d.pieces? ', '+d.pieces+' pcs':'')+'\n'
      +'All-in rate: '+money(d.total)+'\n\n'
      +'Please reply '+orBlankText(d.tenderDeadline,'as soon as you can')+' to accept. '
      +'A written rate confirmation follows immediately once you accept.\n'
      +(d.tenderNotes? '\n'+d.tenderNotes+'\n':'')
      +'\nThanks,\n'+orBlankText(d.brokerContact,'Dispatch')+'\n'+orBlankText(d.brokerName,'')
      +'\n'+[d.brokerPhone,d.brokerEmail].filter(Boolean).join(' / ');
    return 'Subject: '+subject+'\n\n'+body+'\n\n'+LEGAL_TEXT;
  }

  function smsText(d){
    var lane=cityLine(d.originCity,d.originState,'')+' -> '+cityLine(d.destCity,d.destState,'');
    return 'Load avail: '+lane+', '+(d.equipment||'equip TBD')
      +(d.originDate? ', picks up '+fmtDate(d.originDate):'')+'. '+money(d.total)+' all-in. '
      +'Reply YES to accept'+(d.tenderDeadline? ', by '+d.tenderDeadline:'')+'. '
      +'- '+orBlankText(d.brokerContact,'Dispatch')+(d.brokerName? ', '+d.brokerName:'');
  }

  var RENDERERS={rc:renderRC,bol:renderBOL,cp:renderCP,tender:renderTender};
  var TEXTERS={rc:textRC,bol:textBOL,cp:textCP,tender:textTender};

  var activeTab='rc';
  var preview=$('fdPreview');

  function renderActive(){
    var d=collectDoc();
    var el=$('fdTotalValue');
    if(el) el.textContent=money(d.total);
    if(preview) preview.innerHTML=RENDERERS[activeTab](d);
    var smsBtn=$('fdCopySms');
    if(smsBtn) smsBtn.hidden=(activeTab!=='tender');
  }

  /* ---------- validation (soft: flags, never blocks) ------------------------ */
  function validateField(id){
    var el=$(id);
    if(!el) return true;
    var ok=!!el.value.trim();
    if(ok) el.removeAttribute('aria-invalid'); else el.setAttribute('aria-invalid','true');
    return ok;
  }
  function validateAll(){
    var missing=0;
    REQUIRED.forEach(function(id){ if(!validateField(id)) missing++; });
    var box=$('fdValidation');
    if(box){
      if(missing>0){
        box.hidden=false;
        box.textContent=missing+' required field'+(missing===1?'':'s')+' left blank. The document will still generate, with placeholders where they belong.';
      }else{
        box.hidden=true;
      }
    }
    return missing;
  }

  /* ---------- persistence ---------------------------------------------------- */
  function collectAll(){
    var o={};
    var els=form.querySelectorAll('input,select,textarea');
    els.forEach(function(el){
      if(!el.id) return;
      o[el.id]=(el.type==='checkbox')? el.checked : el.value;
    });
    return o;
  }
  function save(){
    try{ localStorage.setItem(STORE_KEY,JSON.stringify(collectAll())); }catch(e){}
  }
  function restore(){
    try{
      var raw=localStorage.getItem(STORE_KEY);
      if(!raw) return false;
      var o=JSON.parse(raw);
      Object.keys(o).forEach(function(id){
        var el=$(id);
        if(!el) return;
        if(el.type==='checkbox') el.checked=!!o[id]; else el.value=o[id];
      });
      return true;
    }catch(e){ return false; }
  }

  /* ---------- copy to clipboard, with fallback ------------------------------- */
  function copyText(text,noteEl){
    function ok(){ noteEl.textContent='Copied'; setTimeout(function(){ noteEl.textContent=''; },2200); }
    function fail(){ noteEl.textContent='Copy failed — select the text and copy manually.'; }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(ok,fail);
    }else{
      var ta=document.createElement('textarea');
      ta.value=text; ta.setAttribute('readonly','');
      ta.style.position='fixed'; ta.style.top='-1000px';
      document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); ok(); }catch(e){ fail(); }
      document.body.removeChild(ta);
    }
  }

  /* ---------- wire up --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded',function(){
    form.addEventListener('input',function(){ renderActive(); save(); });
    form.addEventListener('change',function(){ renderActive(); save(); });

    REQUIRED.forEach(function(id){
      var el=$(id);
      if(el) el.addEventListener('blur',function(){ validateField(id); });
    });

    var tabs=[].slice.call(document.querySelectorAll('.fd-tab'));
    tabs.forEach(function(btn){
      btn.addEventListener('click',function(){
        tabs.forEach(function(b){ b.classList.remove('is-active'); b.setAttribute('aria-selected','false'); });
        btn.classList.add('is-active'); btn.setAttribute('aria-selected','true');
        activeTab=btn.getAttribute('data-doc');
        if(preview) preview.setAttribute('aria-labelledby',btn.id);
        renderActive();
      });
    });

    var printBtn=$('fdPrint');
    if(printBtn) printBtn.addEventListener('click',function(){ window.print(); });

    var copyBtn=$('fdCopy');
    var copiedNote=$('fdCopiedNote');
    if(copyBtn) copyBtn.addEventListener('click',function(){
      var d=collectDoc();
      copyText(TEXTERS[activeTab](d),copiedNote);
    });

    var copySmsBtn=$('fdCopySms');
    if(copySmsBtn) copySmsBtn.addEventListener('click',function(){
      var d=collectDoc();
      copyText(smsText(d),copiedNote);
    });

    var clearBtn=$('fdClearAll');
    if(clearBtn) clearBtn.addEventListener('click',function(){
      if(!window.confirm('Clear every field and restore the sample defaults? This cannot be undone.')) return;
      try{ localStorage.removeItem(STORE_KEY); }catch(e){}
      form.reset();
      renderActive();
      validateAll();
      var note=$('fdSaveNote');
      if(note){ note.textContent='Cleared. Sample defaults restored.'; setTimeout(function(){note.textContent='';},3000); }
      save();
    });

    var restored=restore();
    renderActive();
    validateAll();
    if(restored){
      var note=$('fdSaveNote');
      if(note){ note.textContent='Draft restored from this browser.'; setTimeout(function(){note.textContent='';},3500); }
    }
  });
})();
