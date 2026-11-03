(function(){
  const config = {
    apiKey: 'AIzaSyBN4fzTJ36FTrJ6hqL2z7_eaYfymyi2Wd0',
    authDomain: 'richie-store-d3bbf.firebaseapp.com',
    projectId: 'richie-store-d3bbf',
    storageBucket: 'richie-store-d3bbf.firebasestorage.app',
    messagingSenderId: '784624996649',
    appId: '1:784624996649:web:69914d062668bfc542a738'
  };
  const firebaseSdkBase = 'https://www.gstatic.com/firebasejs/10.12.2/';

  function loadScript(src){
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.appendChild(script);
    });
  }

  function accountLink(){
    const topActions = document.querySelector('.top-actions');
    if(topActions){
      let link = topActions.querySelector('.top-link');
      if(!link){
        link = document.createElement('a');
        link.className = 'top-link';
        const cart = topActions.querySelector('.cart-btn');
        topActions.insertBefore(link, cart || null);
      }
      return link;
    }

    const actions = document.querySelector('.actions');
    if(!actions) return null;
    return actions.querySelector('a[href*="Sign up.html"], a');
  }

  async function initialize(){
    const currentPage = decodeURIComponent(window.location.pathname.split('/').pop() || '').toLowerCase();
    if(currentPage === 'richie online store.html') return;

    if(!window.firebase){
      await loadScript(firebaseSdkBase + 'firebase-app-compat.js');
    }
    if(!window.firebase.auth){
      await loadScript(firebaseSdkBase + 'firebase-auth-compat.js');
    }
    const app = window.firebase.apps.length
      ? window.firebase.app()
      : window.firebase.initializeApp(config);
    const link = accountLink();
    if(!link) return;

    app.auth().onAuthStateChanged(user => {
      if(!user) return;
      const emailName = user.email ? user.email.split('@')[0] : '';
      const displayName = (user.displayName || emailName || 'Account').trim();
      link.textContent = `🧑‍💼 ${displayName}`;
      link.href = 'Main page.html';
      link.title = displayName;
      link.setAttribute('aria-label', `Signed in as ${displayName}`);
      if(link.closest('.actions')){
        link.style.cssText = 'display:inline-flex;align-items:center;max-width:240px;min-height:40px;padding:8px 12px;border-radius:8px;background:#f68b1e;color:#fff;font-size:16px;font-weight:700;overflow-wrap:anywhere;';
      }
    });
  }

  initialize().catch(error => {
    console.error('Could not initialize the store account link:', error);
  });
})();
