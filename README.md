firebase-stream-import
======================

> This module is for who want to import a large json file to Firebase in Node.js.

```javascript
import fs from 'fs';
import importData from 'firebase-stream-import';

fs.createReadStream('./database.json')
  .pipe(importData({
    projectId: '...', // required

    // one of these options is required
    accessToken: '...', // you can generate an access token by using `firebase-admin`
    secret: '...', // you can find secret in Firebase console
  }));
```
