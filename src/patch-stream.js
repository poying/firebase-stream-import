import https from 'https';
import assert from 'assert';
import { Writable } from 'stream';

export default class PatchStream extends Writable {
  constructor(options) {
    options = Object.assign({}, options, { objectMode: true });
    super(options);
    this._path = options.path || '/';
    this._accessToken = options.accessToken;
    this._secret = options.secret;
    this._projectId = options.projectId;
    this._concurrent = options.concurrent || 5;
    this._processing = 0;
    this._wait = null;
    this._log = options.log || (() => {});
    assert(this._accessToken || this._secret);
    assert(this._projectId);
  }

  _write(chunk, env, cb) {
    if (this._processing < this._concurrent) {
      this._processing += 1;
      let patchCb = () => {
        this._processing -= 1;
        if (this._wait) {
          this._write(this._wait.chunk, this._wait.env, this._wait.cb);
        }
      };
      this._patch(chunk, patchCb);
      cb();
    } else {
      this._wait = { chunk, env, cb };
    }
  }

  _patch(data, cb) {
    data = new Buffer(JSON.stringify(data));
    this._log('info', 'Send API Request (size: %s)', Buffer.byteLength(data));

    // prepare request options
    let options = {
      method: 'PATCH',
      host: this._projectId + '.firebaseio.com',
      path: this._path + '.json' + (this._secret ? '?auth=' + this._secret : '')
    };
    if (this.accessToken) {
      options.headers = {
        Authorization: 'Bearer ' + this._accessToken
      };
    }

    // send request & handle response
    let body = '';
    let req = https.request(options, res => {
      res.on('data', data => body += data.toString());
      res.on('end', () => {
        this._log('info', 'API Response');
        if (res.statusCode !== 200) {
          let err = new Error('Call Firebase API Failed: ' + body);
          err.data = data;
          this.emit('error', err);
        }
        data = null;
        cb();
      });
    });
    req.on('error', err => {
      cb();
      this.emit('error', err);
    });
    req.end(data);
  }
}
