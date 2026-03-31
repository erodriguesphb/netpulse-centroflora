const http=require('http'),fs=require('fs'),path=require('path'),net=require('net'),dns=require('dns'),os=require('os'),{exec}=require('child_process'),crypto=require('crypto');
const PORT=process.env.PORT||8080,isWin=process.platform==='win32',isMac=process.platform==='darwin';
const PUBLIC=path.join(__dirname,'public');
const hosts=new Map();let nextId=1;const wsClients=new Set();

const SAVE_FILE = path.join(__dirname, 'hosts.json');

function saveHosts() {
  var data = Array.from(hosts.values()).map(function(h) {
    return { name:h.name, addr:h.addr, probeType:h.probeType, port:h.port, interval:h.interval, warnMs:h.warnMs, paused:h.paused||false };
  });
  try { fs.writeFileSync(SAVE_FILE, JSON.stringify(data, null, 2)); } catch(e) { console.error('Erro ao salvar:', e.message); }
}

function loadHosts() {
  if (!fs.existsSync(SAVE_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8')); } catch(e) { console.error('Erro ao carregar:', e.message); return null; }
}


function doPing(addr,tout){tout=tout||2000;return new Promise(function(ok){var sec=Math.ceil(tout/1000);var cmd=isWin?'ping -n 1 -w '+tout+' '+addr:isMac?'ping -c 1 -W '+sec+' -t '+sec+' '+addr:'ping -c 1 -W '+sec+' '+addr;var t0=Date.now();exec(cmd,{timeout:tout+2000},function(err,out){var el=Date.now()-t0;if(err||!out){ok({alive:false,ms:0,out:'Request timed out.'});return;}var m=out.match(/[Tt]ime[<=](\d+\.?\d*)\s*ms/)||out.match(/(\d+\.?\d*)\s*ms/);var ms=m?Math.round(parseFloat(m[1])):el;var dead=out.indexOf('100%')>=0||out.toLowerCase().indexOf('unreachable')>=0;ok({alive:!dead&&ms>0,ms:dead?0:ms,out:out.trim().split('\n').pop()||''});});});}
function doTcp(addr,port,tout){tout=tout||3000;return new Promise(function(ok){var t0=Date.now(),s=new net.Socket();s.setTimeout(tout);s.on('connect',function(){var ms=Date.now()-t0;s.destroy();ok({alive:true,ms:ms,out:'Port '+port+' OPEN ('+ms+'ms)'});});s.on('timeout',function(){s.destroy();ok({alive:false,ms:0,out:'Port '+port+' timed out'});});s.on('error',function(e){s.destroy();ok({alive:false,ms:0,out:'Port '+port+' '+(e.code==='ECONNREFUSED'?'CLOSED':'UNREACHABLE')});});s.connect(port,addr);});}
function doDns(h){return new Promise(function(ok){var t0=Date.now();dns.lookup(h,{all:true},function(err,a){var ms=Date.now()-t0;if(err){ok({alive:false,ms:0,out:'DNS falhou: '+err.message});return;}var r=(a||[]).map(function(x){return x.address;}).join(', ');ok({alive:true,ms:ms,out:h+' -> '+r+' ('+ms+'ms)'});});});}

function probe(host){var p=host.probeType==='TCP'?doTcp(host.addr,host.port,host.timeout):host.probeType==='DNS'?doDns(host.addr):doPing(host.addr,host.timeout);p.then(function(r){var prev=host.status,next=!r.alive?'down':r.ms>host.warnMs?'warn':'up';host.ms=r.ms;host.status=next;host.lastOut=r.out;host.hist.push({ms:r.ms,ts:Date.now()});if(host.hist.length>300)host.hist.shift();host.sent++;if(!r.alive)host.lost++;if(r.alive)host.lastSeen=Date.now();if(prev!=='check'&&prev!==next){host.changes.push({from:prev,to:next,ts:Date.now()});if(host.changes.length>50)host.changes.shift();bcast({e:'alert',id:host.id,name:host.name,addr:host.addr,from:prev,to:next,ts:Date.now()});}bcast({e:'update',host:snap(host)});}).catch(function(e){host.status='down';host.ms=0;host.lastOut='Erro: '+e.message;host.hist.push({ms:0,ts:Date.now()});host.sent++;host.lost++;bcast({e:'update',host:snap(host)});});}
function snap(h){return{id:h.id,name:h.name,addr:h.addr,probeType:h.probeType,port:h.port,status:h.status,ms:h.ms,sent:h.sent,lost:h.lost,lastOut:h.lastOut,lastSeen:h.lastSeen,hist:h.hist.slice(-60),changes:h.changes.slice(-10),interval:h.interval,warnMs:h.warnMs,paused:h.paused||false};}
function makeHost(d){return{id:nextId++,name:d.name||d.addr,addr:d.addr,probeType:d.probeType||'ICMP',port:parseInt(d.port)||80,status:'check',ms:0,sent:0,lost:0,lastOut:'',lastSeen:null,hist:[],changes:[],interval:parseInt(d.interval)||2000,timeout:parseInt(d.timeout)||2000,paused:d.paused||false,warnMs:parseInt(d.warnMs||d.warnThreshold)||150,_t:null};}
function startLoop(h){if(h._t)clearInterval(h._t);if(h.paused)return;probe(h);h._t=setInterval(function(){probe(h);},h.interval);}

// WebSocket puro
function wsHandshake(req,sock){var acc=crypto.createHash('sha1').update(req.headers['sec-websocket-key']+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+acc+'\r\n\r\n');}
function wsEncode(str){var p=Buffer.from(str,'utf8'),len=p.length,h;if(len<126){h=Buffer.alloc(2);h[0]=0x81;h[1]=len;}else if(len<65536){h=Buffer.alloc(4);h[0]=0x81;h[1]=126;h.writeUInt16BE(len,2);}else{h=Buffer.alloc(10);h[0]=0x81;h[1]=127;h.writeBigUInt64BE(BigInt(len),2);}return Buffer.concat([h,p]);}
function wsDecode(buf){if(buf.length<2)return null;var op=buf[0]&0x0f;if(op===8)return{type:'close'};var masked=(buf[1]&0x80)!==0,len=buf[1]&0x7f,off=2;if(len===126){len=buf.readUInt16BE(2);off=4;}else if(len===127){len=Number(buf.readBigUInt64BE(2));off=10;}if(buf.length<off+(masked?4:0)+len)return null;var data;if(masked){var mask=buf.slice(off,off+4);off+=4;data=Buffer.alloc(len);for(var i=0;i<len;i++)data[i]=buf[off+i]^mask[i%4];}else{data=buf.slice(off,off+len);}return{type:'message',data:data.toString('utf8')};}
function bcast(obj){var b=wsEncode(JSON.stringify(obj));wsClients.forEach(function(s){try{s.write(b);}catch(e){}});}
function wsSend(sock,obj){try{sock.write(wsEncode(JSON.stringify(obj)));}catch(e){}}

var MIME={'html':'text/html','js':'application/javascript','css':'text/css','ico':'image/x-icon'};
var srv=http.createServer(function(req,res){
  if(req.url==='/api/hosts'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(Array.from(hosts.values()).map(snap)));return;}
  if(req.url.startsWith('/api/hosts/')&&req.method==='DELETE'){var id=parseInt(req.url.split('/')[3]),h=hosts.get(id);if(h){clearInterval(h._t);hosts.delete(id);bcast({e:'removed',id:id});}res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}');return;}
  var fp=req.url==='/'?path.join(PUBLIC,'index.html'):path.join(PUBLIC,req.url.split('?')[0]);
  fs.readFile(fp,function(err,data){if(err){res.writeHead(404);res.end('Not found');return;}var ext=path.extname(fp).slice(1);res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream'});res.end(data);});
});

srv.on('upgrade',function(req,sock){
  if(req.headers['upgrade']!=='websocket'){sock.destroy();return;}
  wsHandshake(req,sock);wsClients.add(sock);
  wsSend(sock,{e:'init',hosts:Array.from(hosts.values()).map(snap)});
  var buf=Buffer.alloc(0);
  sock.on('data',function(chunk){
    buf=Buffer.concat([buf,chunk]);
    var frame=wsDecode(buf);if(!frame)return;buf=Buffer.alloc(0);
    if(frame.type==='close'){sock.destroy();return;}
    if(frame.type!=='message')return;
    try{
      var msg=JSON.parse(frame.data),action=msg.action;
      if(action==='add_host'){var nh=makeHost(msg);hosts.set(nh.id,nh);startLoop(nh);bcast({e:'added',host:snap(nh)});saveHosts();}
      else if(action==='remove_host'){var rh=hosts.get(msg.id);if(rh){clearInterval(rh._t);hosts.delete(msg.id);bcast({e:'removed',id:msg.id});saveHosts();}}
      else if(action==='edit_host'){var eh=hosts.get(msg.id);if(eh){clearInterval(eh._t);eh.name=msg.name||eh.name;eh.addr=msg.addr||eh.addr;eh.probeType=msg.probeType||eh.probeType;eh.port=parseInt(msg.port)||eh.port;eh.status='check';eh.ms=0;eh.hist=[];eh.sent=0;eh.lost=0;startLoop(eh);saveHosts();bcast({e:'edited',host:snap(eh)});}}
      else if(action==='traceroute'){var th=hosts.get(msg.id);if(th){var cmd=isWin?'tracert -h 15 -w 2000 '+th.addr:'traceroute -m 15 -w 2 '+th.addr;var pr=exec(cmd,{timeout:30000});pr.stdout.on('data',function(d){bcast({e:'trace_data',data:d.trim()});});pr.on('close',function(){bcast({e:'trace_done'});});}}
      else if(action==='ping_now'){var ph=hosts.get(msg.id);if(ph)probe(ph);}
      else if(action==='pause_host'){var pah=hosts.get(msg.id);if(pah){clearInterval(pah._t);pah._t=null;pah.paused=true;bcast({e:'paused',id:pah.id});saveHosts();}}
      else if(action==='resume_host'){var rsh=hosts.get(msg.id);if(rsh){rsh.paused=false;startLoop(rsh);bcast({e:'resumed',id:rsh.id});saveHosts();}}
      else if(action==='set_interval'){var sih=hosts.get(msg.id);if(sih){sih.interval=parseInt(msg.interval)||2000;if(!sih.paused){startLoop(sih);}saveHosts();bcast({e:'update',host:snap(sih)});}}
    }catch(x){console.error('WS:',x.message);}
  });
  sock.on('close',function(){wsClients.delete(sock);});
  sock.on('error',function(){wsClients.delete(sock);});
});

// Hosts padrao
var saved = loadHosts();
if (saved && saved.length > 0) {
  console.log('  Carregando ' + saved.length + ' host(s) salvos...');
  saved.forEach(function(d){ var h=makeHost(d); hosts.set(h.id,h); startLoop(h); });
} else {
  var defs=[{addr:'8.8.8.8',name:'DNS Google',probeType:'ICMP'},{addr:'1.1.1.1',name:'DNS Cloudflare',probeType:'ICMP'},{addr:'google.com',name:'google.com',probeType:'DNS'},{addr:'google.com',name:'HTTPS google.com',probeType:'TCP',port:443}];
  var ifaces=os.networkInterfaces();
  outer:for(var k in ifaces){for(var i=0;i<ifaces[k].length;i++){var iface=ifaces[k][i];if(iface.family==='IPv4'&&!iface.internal){defs.unshift({addr:iface.address.split('.').slice(0,3).join('.')+'.1',name:'Gateway Local',probeType:'ICMP'});break outer;}}}
  defs.forEach(function(d){var h=makeHost(d);hosts.set(h.id,h);startLoop(h);});
  saveHosts();
}

srv.listen(PORT,function(){console.log('\n  NetPulse rodando em http://localhost:'+PORT+'\n  Pressione Ctrl+C para parar\n');});
