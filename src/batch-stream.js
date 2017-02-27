import bytes from 'bytes';
import { Transform } from 'stream';

export default class BatchStream extends Transform {
  constructor(options) {
    options = Object.assign({}, options, { objectMode: true });
    super(options);
    this._chunkSize = bytes(options.chunkSize || '1mb');
    this._chunks = {};
    this._currentSize = 0;
  }

  _transform(chunk, enc, cb) {
    if (!(chunk.value === null || chunk.value === undefined)) {
      let size = chunk ? Buffer.byteLength(JSON.stringify(chunk), 'utf8') : 0;
      if (this._currentSize + size >= this._chunkSize) {
        this._pass();
      } else {
        this._currentSize += size;
        this._chunks[chunk.path.join('/')] = chunk.value;
      }
    }
    cb();
  }

  _flush(cb) {
    this._pass();
    cb();
  }

  _pass() {
    this.push(this._chunks);
    this._currentSize = 0;
    this._chunks = {};
  }
}
