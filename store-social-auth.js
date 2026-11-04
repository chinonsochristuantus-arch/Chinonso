(function(){
  function authErrorMessage(error){
    switch(error.code){
      case 'auth/operation-not-allowed':
        return 'Google sign-in is not enabled for this store yet. Enable it in Firebase Authentication.';
      case 'auth/popup-blocked':
        return 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.';
      case 'auth/popup-closed-by-user':
        return 'The sign-in window was closed before authentication finished. Please try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already uses this email with another sign-in method. Log in with that method first.';
      case 'auth/unauthorized-domain':
        return 'This site is not authorized for Firebase sign-in. Add its domain in Firebase Authentication settings.';
      case 'auth/operation-not-supported-in-this-environment':
        return 'Social sign-in requires HTTPS. Open the deployed site or use a local HTTPS server and try again.';
      case 'auth/network-request-failed':
        return 'We could not reach Firebase. Check your internet connection and try again.';
      default:
        return error.message || 'We could not continue with Google. Please try again.';
    }
  }

  async function saveUserProfile(user, db){
    const profileRef = db.collection('users').doc(user.uid);
    const existingProfile = await profileRef.get();
    const email = user.email || null;
    const fullName = user.displayName || (email ? email.split('@')[0] : 'Richie Store customer');
    const profile = {
      uid: user.uid,
      full_name: fullName,
      email,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    if(!existingProfile.exists){
      profile.created_at = firebase.firestore.FieldValue.serverTimestamp();
    }

    await profileRef.set(profile, { merge: true });
    return fullName;
  }

  window.storeGoogleAuth = async function(){
    const client = window.firebaseClient;
    if(!client || !client.auth || !client.db){
      const details = window.firebaseInitError && window.firebaseInitError.message;
      throw new Error(details || 'Firebase is unavailable. Check your internet connection and Firebase configuration.');
    }

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const credential = await client.auth.signInWithPopup(provider);
      if(!credential.user) throw new Error('Firebase did not return a signed-in user.');
      const fullName = await saveUserProfile(credential.user, client.db);
      return { user: credential.user, fullName };
    } catch(error) {
      console.error('Google sign-in failed:', error);
      if(error.code && error.code.startsWith('auth/')){
        throw new Error(authErrorMessage(error));
      }
      throw error;
    }
  };
})();
