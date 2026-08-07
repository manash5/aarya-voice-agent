"""livekit-plugins-assemblyai==1.6.8 json.dumps()'s language_codes into a
JSON-array string before urlencoding it, but AssemblyAI's v3 streaming API
expects a plain comma-separated value there - the server rejects the JSON
form with a 3006 (invalid message) close code. Patches the module's
urlencode call to fix just that one field. Import this before constructing
assemblyai.STT with language_codes.
"""

import json
from urllib.parse import urlencode as _real_urlencode
from livekit.plugins.assemblyai import stt as _assemblyai_stt


def _fixed_urlencode(params, *args, **kwargs):
    fixed = dict(params)
    if "language_codes" in fixed:
        try:
            fixed["language_codes"] = ",".join(json.loads(fixed["language_codes"]))
        except (TypeError, ValueError):
            pass
    return _real_urlencode(fixed, *args, **kwargs)


_assemblyai_stt.urlencode = _fixed_urlencode
