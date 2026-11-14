async function clearpickExport(destination) {
 'use strict';
 if(location.protocol!=='https:'||! /^(www\.)?leetcode\.com$/.test(location.hostname)){alert('Open LeetCode and sign in, then run LeetPick sync.');return;}
 const ROOT='clearpick-export';if(document.getElementById(ROOT)){alert('A LeetPick export is already running.');return;}
 const abort=new AbortController();const box=document.createElement('div');box.id=ROOT;
 Object.assign(box.style,{position:'fixed',right:'24px',top:'24px',zIndex:'2147483647',padding:'20px',background:'#282e36',color:'#edf0f4',border:'1px solid #657080',borderRadius:'10px',font:'14px/1.5 system-ui',maxWidth:'340px',boxShadow:'0 12px 40px #0006'});
 const title=document.createElement('strong');title.textContent='LeetPick sync';const status=document.createElement('p');status.textContent='Checking your LeetCode session...';const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.onclick=()=>{abort.abort();box.remove();};box.append(title,status,cancel);document.body.append(box);
 const pause=ms=>new Promise((resolve,reject)=>{if(abort.signal.aborted)return reject(Error('Cancelled'));const t=setTimeout(done,ms);function done(){abort.signal.removeEventListener('abort',stop);resolve();}function stop(){clearTimeout(t);reject(Error('Cancelled'));}abort.signal.addEventListener('abort',stop,{once:true});});
 async function graphql(query,variables={}) {
  for(let attempt=0;attempt<3;attempt++){
   if(abort.signal.aborted)throw Error('Cancelled');const ctl=new AbortController();const stop=()=>ctl.abort();abort.signal.addEventListener('abort',stop,{once:true});const timer=setTimeout(()=>ctl.abort(),20000);
   let response;
   try{const headers={'Content-Type':'application/json','Accept':'application/json'};const csrf=document.cookie.split('; ').find(x=>x.startsWith('csrftoken='));if(csrf)headers['x-csrftoken']=decodeURIComponent(csrf.slice(10));response=await fetch('/graphql/',{method:'POST',credentials:'same-origin',headers,body:JSON.stringify({query,variables}),signal:ctl.signal,cache:'no-store'});}
   catch(e){if(abort.signal.aborted)throw Error('Cancelled');if(attempt<2){await pause(700*(attempt+1));continue;}throw Error('LeetCode could not be reached. Please retry.');}
   finally{clearTimeout(timer);abort.signal.removeEventListener('abort',stop);}
   if(response.status===429||response.status>=500){if(attempt<2){await pause(1200*(attempt+1));continue;}throw Error('LeetCode is busy or rate-limiting requests. Try again later.');}
   if(!response.ok)throw Error('LeetCode returned HTTP '+response.status+'. Sign in and try again.');
   const json=await response.json();if(json.errors?.length||!json.data)throw Error('LeetCode’s API response changed. No progress was exported.');return json.data;
  }
 }
 try {
  const userQuery='query { userStatus { isSignedIn username } }';const user=(await graphql(userQuery)).userStatus;
  if(!user?.isSignedIn||typeof user.username!=='string'||! /^[a-zA-Z0-9_.-]{1,100}$/.test(user.username))throw Error('Sign in to LeetCode before running LeetPick sync.');
  const query='query LeetPickProgress($filters:QuestionFilterInput,$limit:Int,$skip:Int,$categorySlug:String){problemsetQuestionListV2(filters:$filters,limit:$limit,skip:$skip,categorySlug:$categorySlug){questions{questionFrontendId status} totalLength hasMore}}';
  const filters={filterCombineType:'ALL',statusFilter:{questionStatuses:[],operator:'IS'},difficultyFilter:{difficulties:[],operator:'IS'},languageFilter:{languageSlugs:[],operator:'IS'},topicFilter:{topicSlugs:[],operator:'IS'},acceptanceFilter:{},frequencyFilter:{},frontendIdFilter:{},lastSubmittedFilter:{},publishedFilter:{},companyFilter:{companySlugs:[],operator:'IS'},positionFilter:{positionSlugs:[],operator:'IS'},positionLevelFilter:{positionLevelSlugs:[],operator:'IS'},contestPointFilter:{contestPoints:[],operator:'IS'},premiumFilter:{premiumStatus:[],operator:'IS'}};
  let skip=0,total=null;const seen=new Set(),solved=new Set();
  for(let page=0;page<200;page++){
   const data=(await graphql(query,{filters,skip,limit:100,categorySlug:'all-code-essentials'})).problemsetQuestionListV2;
   if(!data||!Array.isArray(data.questions)||typeof data.hasMore!=='boolean'||!Number.isInteger(data.totalLength)||data.totalLength<0||data.totalLength>20000)throw Error('Unexpected LeetCode pagination. No progress was exported.');
   if(total!==null&&total!==data.totalLength)throw Error('The LeetCode catalog changed during export. Please retry.');total=data.totalLength;
   if(data.questions.length>100||(!data.questions.length&&data.hasMore))throw Error('LeetCode returned an incomplete page. Please retry.');
   for(const row of data.questions){const raw=String(row.questionFrontendId),id=Number(raw);if(!/^\d+$/.test(raw)||!Number.isSafeInteger(id)||id<1||id>1000000||seen.has(id)||!['SOLVED','TO_DO','ATTEMPTED'].includes(row.status))throw Error('LeetCode returned unexpected problem data. No progress was exported.');seen.add(id);if(row.status==='SOLVED')solved.add(id);}
   skip+=data.questions.length;status.textContent=`Checked ${skip} of ${total} problems. Found ${solved.size} solved.`;
   if(skip>total||(!data.hasMore&&skip!==total)||(data.hasMore&&skip>=total))throw Error('LeetCode returned incomplete pagination. Please retry.');
   if(!data.hasMore)break;if(page===199)throw Error('The export exceeded its page limit.');await pause(350);
  }
  const after=(await graphql(userQuery)).userStatus;if(!after?.isSignedIn||after.username!==user.username)throw Error('Your LeetCode account changed during export. Please retry.');
  if(abort.signal.aborted)return;
  const payload={version:1,source:'leetcode.com',username:user.username,exportedAt:new Date().toISOString(),solvedIds:[...solved].sort((a,b)=>a-b)};
  const text=JSON.stringify(payload);const bytes=new TextEncoder().encode(text);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);const encoded=btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');const url=destination+'/#import='+encoded;
  if(url.length>60000){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.download='leetpick-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),10000);status.textContent='Export downloaded. Open LeetPick and choose Sync progress > Import JSON.';cancel.textContent='Close';return;}
  location.assign(url);
 } catch(e){if(abort.signal.aborted)return;status.textContent=e.message||'Export failed. Please retry.';cancel.textContent='Close';}
}
