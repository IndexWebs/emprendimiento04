import { firebase } from '@/plugins/firebase';

export default function ({ redirect }) {
  return new Promise((resolve) => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        redirect('/login');
        unsubscribe();
        return resolve();
      }

      try {
        const tokenResult = await user.getIdTokenResult(true);
        if (!tokenResult.claims || !tokenResult.claims.admin) {
          await firebase.auth().signOut();
          redirect('/login?error=not_authorized');
        }
      } catch (error) {
        console.error('[middleware/auth] Error validating admin claim', error);
        await firebase.auth().signOut();
        redirect('/login?error=session');
      } finally {
        unsubscribe();
        resolve();
      }
    });
  });
}
