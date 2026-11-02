/* 1X4 — محفظة موحدة (نسخة تجريبية محلية)
   كل الصفحات (الرئيسية، الألعاب، الإيداع، السحب، الأدمن) تقرأ وتكتب من نفس المفاتيح في localStorage.
   لازم الحزمتين تتفتحوا من نفس الخادم/الأصل (مثلاً من المجلد الأب) عشان يشوفوا بعض. */
(function(){
  var L=localStorage;
  function J(k,d){try{var v=JSON.parse(L.getItem(k));return v==null?d:v}catch(e){return d}}
  function r2(n){return Math.round(n*100)/100}
  var X4={
    accounts:function(){return J('accounts',{})},
    session:function(){return L.getItem('session')},
    uidOf:function(login){var a=X4.accounts(),u=a[login];if(!u)return null;if(u.playerId!==login){u.playerId=login;L.setItem('accounts',JSON.stringify(a))}return login},
    uid:function(){var s=X4.session();return s&&X4.accounts()[s]?X4.uidOf(s):null},
    loginByUid:function(uid){return X4.accounts()[uid]?uid:null},
    hasUid:function(uid){return !!X4.loginByUid(uid)},
    balance:function(uid){return r2(Number(L.getItem('wallet_'+uid)||0))},
    setBalance:function(uid,v){L.setItem('wallet_'+uid,String(r2(v)))},
    add:function(uid,d){var c=X4.balance(uid),n=r2(c+d);if(n<-1e-9)return false;X4.setBalance(uid,Math.max(0,n));return true},
    requests:function(kind){return J(kind==='deposit'?'demo_deposits':'demo_withdrawals',[])},
    addRequest:function(kind,o){
      var login=X4.session(),uid=X4.uid();if(!login||!uid)return null;
      var amt=Number(o.amount);if(!isFinite(amt)||amt<=0)return null;
      if(kind==='withdrawal'&&!X4.add(uid,-amt))return null; // حجز المبلغ لحين المراجعة
      var key=kind==='deposit'?'demo_deposits':'demo_withdrawals',arr=X4.requests(kind);
      var req={id:kind[0]+Date.now().toString(36)+Math.random().toString(36).slice(2,5),uid:uid,player:login,amount:r2(amt),method:o.method||'',phone:o.phone||'',status:'قيد المراجعة',createdAt:Date.now()};
      arr.unshift(req);L.setItem(key,JSON.stringify(arr));return req;
    },
    isBanned:function(uid){return J('demo_banned',[]).indexOf(uid)>=0},
    setBanned:function(uid,b){var a=J('demo_banned',[]).filter(function(x){return x!==uid});if(b)a.push(uid);L.setItem('demo_banned',JSON.stringify(a))},
    gameOff:function(g){return L.getItem('demo_'+g+'_off')==='1'},
    stat:function(g,fn){var all=J('demo_gameStats',{}),s=all[g]||{bets:0,payouts:0,rounds:0};fn(s);all[g]=s;L.setItem('demo_gameStats',JSON.stringify(all))}
  };
  // تصفير كل الأرصدة الحالية مرة واحدة (الرصيد الابتدائي = 0)
  if(!L.getItem('x4_zero_v1')){
    Object.keys(L).forEach(function(k){if(k.indexOf('wallet_')===0)L.setItem(k,'0')});
    L.setItem('x4_zero_v1','1');
  }
  window.X4=X4;
})();
