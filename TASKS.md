# SafeSound.ai – Tasks

- Add _dmarc TXT per spec
- Add robots.txt and sitemap.xml
- Add /og.png and push
- Turn on Netlify form email notifications to hello@safesound.ai
- (Optional) Add netlify/functions/submission-created.js and set HBUK_* envs

## DMARC TXT

Host: _dmarc

Value:

v=DMARC1; p=none; rua=mailto:hello@safesound.ai; ruf=mailto:hello@safesound.ai; fo=1; adkim=s; aspf=s

Later: switch p=none → quarantine/reject after monitoring.
