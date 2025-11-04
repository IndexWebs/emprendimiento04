# Admin Security Notes

## Firebase custom claims

The admin middleware now expects authenticated users to carry the `admin` custom claim on their Firebase Auth token. Assign the claim from a secure environment (e.g. Cloud Functions or the Firebase CLI):

```bash
firebase auth:users:set-custom-claims USER_UID '{"admin": true}'
```

Users without that claim are automatically signed out and redirected to `/login`.

## Firestore rules (suggested)

Deploy rules that prevent direct client-side writes unless the `admin` claim is present:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pedidos/{pedidoId} {
      allow read: if request.auth != null && request.auth.token.admin == true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Adapt the rules to your project's collections before deployment.

## Storage rules (suggested)

Only allow admins to upload or delete product images:

```storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

If you already use other buckets or folders, extend the rules accordingly.

## Netlify environment variables

Create the following variables so the serverless functions can verify admin tokens:

- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY` (replace newline characters with `\n`)

Optional:

- `ORDER_NOTIFICATION_EMAIL` to override the default recipient for order notifications.

Remember to restart `netlify dev` (and redeploy) after updating environment variables.
