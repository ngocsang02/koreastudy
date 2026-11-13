export async function setupAccount(store, reviews) {
  const $ = id => document.getElementById(id);
  const dialog = $('account-dialog');
  let recoveryMode = false;
  let sessionUser = null;
  $('account-button').onclick = () => dialog.showModal();
  $('close-account').onclick = () => dialog.close();
  let authMode = 'login';
  const setAuthMode = mode => {
    authMode = mode;
    dialog.classList.toggle('is-register', mode === 'register');
    dialog.classList.toggle('is-recovery', mode === 'recovery');
    $('account-title').textContent = mode === 'login' ? 'ĐĂNG NHẬP' : mode === 'register' ? 'ĐĂNG KÝ' : 'ĐẶT LẠI MẬT KHẨU';
    $('send-link').textContent = mode === 'login' ? 'Đăng nhập' : mode === 'register' ? 'Đăng ký' : 'Lưu mật khẩu mới';
    $('login-password').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    $('login-form').querySelector('label[for="login-password"]').textContent = mode === 'recovery' ? 'Mật khẩu mới' : 'Mật khẩu';
    $('confirm-password').required = mode === 'register' || mode === 'recovery';
    $('register-name').required = mode === 'register';
    $('accept-terms').required = mode === 'register';
    $('forgot-password').hidden = mode !== 'login';
    $('login-mode').classList.toggle('active', mode === 'login');
    $('register-mode').classList.toggle('active', mode === 'register');
    $('auth-tabs').hidden = mode === 'recovery' || !!sessionUser;
    $('auth-social').hidden = mode === 'recovery' || !!sessionUser;
    $('auth-switch').hidden = mode === 'recovery' || !!sessionUser;
    $('auth-switch').innerHTML = mode === 'login' ? 'Bạn chưa có tài khoản? <button type="button" id="switch-register">Đăng ký tại đây</button>' : 'Bạn đã có tài khoản? <button type="button" id="switch-login">Đăng nhập tại đây</button>';
    $('switch-register')?.addEventListener('click', () => setAuthMode('register'));
    $('switch-login')?.addEventListener('click', () => setAuthMode('login'));
    $('account-message').textContent = '';
  };
  $('login-mode').onclick = () => setAuthMode('login');
  $('register-mode').onclick = () => setAuthMode('register');
  setAuthMode('login');
  document.querySelectorAll('.password-toggle').forEach(button => button.onclick = () => {
    const input = button.parentElement.querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
    button.setAttribute('aria-label', input.type === 'password' ? 'Hiện mật khẩu' : 'Ẩn mật khẩu');
  });
  const statusLabels = {local:'Tiến độ lưu trên thiết bị',syncing:'Đang đồng bộ…',synced:'Đã đồng bộ',pending:'Đang chờ đồng bộ', 'sync-error':'Chưa đồng bộ · thử lại trong Tài khoản','storage-error':'Chưa lưu được trên thiết bị'};
  const updateSyncLabel=()=>{
    const states=[store.status,reviews?.status].filter(Boolean);
    $('sync-status').textContent=states.includes('storage-error')?'Chưa lưu được đầy đủ trên máy':states.includes('sync-error')?'Tiến độ hoặc lịch ôn chưa đồng bộ':states.includes('syncing')?'Đang đồng bộ…':states.every(s=>s==='synced')?'Đã đồng bộ tiến độ & lịch ôn':statusLabels[store.status]||statusLabels.local;
  };
  store.subscribe(updateSyncLabel);reviews?.subscribe(updateSyncLabel);
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    $('account-description').textContent = 'Bạn đang học ở chế độ khách. Tiến độ được lưu trong trình duyệt hiện tại. Chức năng đăng nhập và đồng bộ sẽ xuất hiện khi website được kết nối Supabase.';
    $('auth-social').hidden = true;
    return;
  }
  const {createClient} = await import('@supabase/supabase-js');
  const client = createClient(url, key);
  const adapter = {
    async push(uid, rows) {
      const {error} = await client.from('learning_progress').upsert(Object.entries(rows).map(([grammar_id,row])=>({user_id:uid,grammar_id,...row})), {onConflict:'user_id,grammar_id'});
      if(error) throw error;
    },
    async pull(uid) {
      const {data,error} = await client.from('learning_progress').select('grammar_id,saved,learned').eq('user_id',uid);
      if(error) throw error;
      return data;
    }
  };
  const reviewAdapter={
    async push(uid,rows){
      const payload=Object.entries(rows).map(([word_id,c])=>({user_id:uid,word_id,stage:c.stage,lapses:c.lapses,reviews:c.reviews,last_rating:c.lastRating,interval_minutes:c.intervalMinutes,due_at:new Date(c.dueAt).toISOString(),last_reviewed_at:c.lastReviewedAt===null?null:new Date(c.lastReviewedAt).toISOString()}));
      const {error}=await client.from('review_schedule').upsert(payload,{onConflict:'user_id,word_id'});if(error)throw error;
    },
    async pull(uid){
      const cards={};
      for(let offset=0;;offset+=500){
        const {data,error}=await client.from('review_schedule').select('word_id,stage,lapses,reviews,last_rating,interval_minutes,due_at,last_reviewed_at').eq('user_id',uid).order('word_id').range(offset,offset+499);if(error)throw error;
        for(const c of data)cards[c.word_id]={stage:c.stage,lapses:c.lapses,reviews:c.reviews,lastRating:c.last_rating,intervalMinutes:c.interval_minutes,dueAt:Date.parse(c.due_at),lastReviewedAt:c.last_reviewed_at?Date.parse(c.last_reviewed_at):null};
        if(data.length<500)return cards;
      }
    }
  };
  const syncAll=()=>Promise.all([store.sync(),reviews?.sync()]);
  async function applySession(session) {
    sessionUser = session?.user || null;
    $('login-form').hidden = !!sessionUser && !recoveryMode;
    $('signed-in').hidden = !sessionUser || recoveryMode;
    $('auth-tabs').hidden = !!sessionUser || recoveryMode;
    $('auth-social').hidden = !!sessionUser || recoveryMode;
    $('auth-switch').hidden = !!sessionUser || recoveryMode;
    $('account-button').textContent = sessionUser ? 'Tài khoản ✓' : 'Đăng nhập';
    $('account-email').textContent = sessionUser?.email || '';
    $('account-description').hidden = !sessionUser || recoveryMode;
    $('account-description').textContent = sessionUser ? 'Tiến độ tài khoản được đồng bộ giữa các thiết bị. Tiến độ của chế độ khách được giữ riêng trên máy.' : 'Nhận liên kết đăng nhập qua email để đồng bộ tiến độ giữa các thiết bị. Tiến độ khách và tài khoản được lưu riêng.';
    await reviews?.connect(sessionUser?.id || null,sessionUser?reviewAdapter:null);
    await store.connect(sessionUser?.id || null, sessionUser ? adapter : null);
  }
  // Leave the auth callback synchronous; database calls run outside its lock.
  client.auth.onAuthStateChange((event,session) => { setTimeout(() => { recoveryMode=event==='PASSWORD_RECOVERY'; void applySession(session).then(()=>{if(recoveryMode){setAuthMode('recovery');$('login-form').hidden=false;$('login-password').focus();}}); },0); });
  for (const provider of ['google','apple']) $(provider+'-login').onclick = async () => {
    try { const {error}=await client.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}}); if(error) throw error; }
    catch { $('account-message').textContent='Chưa thể đăng nhập bằng '+(provider==='google'?'Google':'Apple')+'. Kiểm tra cấu hình provider trong Supabase.'; }
  };
  $('forgot-password').onclick = async () => {
    const email=$('login-email').value.trim();
    if(!email){$('account-message').textContent='Nhập email của bạn trước để nhận liên kết đặt lại mật khẩu.';$('login-email').focus();return;}
    $('forgot-password').disabled=true;
    try {const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;$('account-message').textContent='Đã gửi email đặt lại mật khẩu. Hãy kiểm tra hộp thư đến và thư rác.';}
    catch {$('account-message').textContent='Chưa gửi được email đặt lại mật khẩu. Vui lòng thử lại sau.';}
    finally {$('forgot-password').disabled=false;}
  };
  $('login-form').onsubmit = async e => {
    e.preventDefault(); $('send-link').disabled = true; $('account-message').textContent = 'Đang xử lý…';
    const email=$('login-email').value.trim(), password=$('login-password').value;
    try {
      if(authMode==='recovery') {
        if(password!==$('confirm-password').value) throw new Error('Mật khẩu xác nhận chưa khớp.');
        const {error}=await client.auth.updateUser({password}); if(error) throw error;
        recoveryMode=false; await applySession(sessionUser?{user:sessionUser}:null); $('account-message').textContent='Đã cập nhật mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới.';
      } else if(authMode==='register') {
        if(password!==$('confirm-password').value) throw new Error('Mật khẩu xác nhận chưa khớp.');
        if(!$('accept-terms').checked) throw new Error('Vui lòng đồng ý với Điều khoản và Chính sách bảo mật.');
        const {error}=await client.auth.signUp({email,password,options:{data:{full_name:$('register-name').value.trim(),phone:$('register-phone').value.trim()},emailRedirectTo:location.origin+location.pathname}});
        if(error) throw error;
        $('account-message').textContent='Đã tạo tài khoản. Hãy kiểm tra email để xác nhận trước khi đăng nhập.';
      } else {
        const {error}=await client.auth.signInWithPassword({email,password});
        if(error) throw error;
      }
    } catch (error) { $('account-message').textContent=error.message==='Invalid login credentials'?'Email hoặc mật khẩu chưa đúng.':error.message||'Chưa thể xử lý yêu cầu. Vui lòng thử lại.'; }
    finally { $('send-link').disabled = false; }
  };
  $('sync-now').onclick = async () => { $('sync-now').disabled = true; await syncAll(); $('sync-now').disabled = false; $('account-message').textContent = store.status === 'synced'&&(!reviews||reviews.status==='synced') ? 'Đã đồng bộ tiến độ và lịch ôn.' : 'Chưa đồng bộ đầy đủ tiến độ hoặc lịch ôn. Dữ liệu vẫn được giữ trên máy; kiểm tra kết nối và migration Supabase rồi thử lại.'; };
  $('sign-out').onclick = async () => {
    $('sign-out').disabled = true;
    try {const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;await applySession(null);$('account-message').textContent='Đã đăng xuất. Bạn đang ở chế độ khách.';}
    catch {$('account-message').textContent='Chưa đăng xuất được. Vui lòng thử lại.';}
    finally {$('sign-out').disabled=false;}
  };
  window.addEventListener('online',()=>{void syncAll();});
  window.addEventListener('focus',()=>{if(sessionUser)void syncAll();});
}
