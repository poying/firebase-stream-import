import multipipe from 'multipipe';
import splitJson from 'split-json-stream';
import PatchStream from './patch-stream';
import BatchStream from './batch-stream';

export default options => {
  const split = splitJson(options);
  const batch = new BatchStream(options);
  const patch = new PatchStream(options);
  return multipipe(split, batch, patch);
};
