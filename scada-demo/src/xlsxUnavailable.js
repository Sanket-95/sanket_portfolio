// The public web demo has no Excel import (those set-up pages are hidden), so
// the `xlsx` library — which has unpatched security advisories — is not shipped.
const unavailable = () => { throw new Error('Excel import is not available in the web demo'); };
export const read = unavailable;
export const utils = { sheet_to_json: unavailable };
