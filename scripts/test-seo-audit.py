"""Prove the audit rejects broken builds; no network requests."""
import importlib.util
import shutil
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('seo', Path(__file__).with_name('audit-seo.py'))
seo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seo)


class AuditContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.dist = Path(cls.temp.name) / 'dist'
        shutil.copytree(seo.DIST, cls.dist)
        cls.home = cls.dist / 'index.html'
        cls.original = cls.home.read_text(encoding='utf-8')

    @classmethod
    def tearDownClass(cls): cls.temp.cleanup()

    def tearDown(self): self.home.write_text(self.original, encoding='utf-8')

    def test_current_build(self): self.assertTrue(seo.audit(self.dist)['passed'])

    def test_wrong_canonical_rejected(self):
        self.home.write_text(self.original.replace('rel="canonical" href="https://armanhomes.in/"', 'rel="canonical" href="https://example.test/"'), encoding='utf-8')
        self.assertTrue(any('self-canonical' in issue for issue in seo.audit(self.dist)['issues']))

    def test_broken_asset_rejected(self):
        self.home.write_text(self.original.replace('/images/brand/logo-reversed.webp', '/images/missing-logo.webp'), encoding='utf-8')
        self.assertTrue(any('missing-logo' in issue for issue in seo.audit(self.dist)['issues']))

    def test_sitemap_mismatch_rejected(self):
        self.home.write_text(self.original.replace('index, follow, max-image-preview:large', 'noindex, follow'), encoding='utf-8')
        issues = seo.audit(self.dist)['issues']
        self.assertTrue(any('noindex page has canonical' in issue for issue in issues))
        self.assertTrue(any('URLs differ' in issue for issue in issues))

    def test_wrong_contact_rejected(self):
        self.home.write_text(self.original.replace('tel:+919354210824', 'tel:+919999999999').replace('wa.me/919354210824', 'wa.me/919999999999'), encoding='utf-8')
        issues = seo.audit(self.dist)['issues']
        self.assertTrue(any('incorrect phone' in issue for issue in issues))
        self.assertTrue(any('incorrect WhatsApp' in issue for issue in issues))

    def test_email_endpoint_rejected(self):
        self.home.write_text(self.original.replace('</main>', '<form action="https://formsubmit.co/example"></form></main>'), encoding='utf-8')
        self.assertTrue(any('obsolete email-form' in issue for issue in seo.audit(self.dist)['issues']))


if __name__ == '__main__': unittest.main()
