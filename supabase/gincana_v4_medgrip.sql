-- =====================================================================
-- Health Plus — v4: QR code passa a ser do medGrip
-- Rode no SQL Editor → Ctrl+A → Run.
-- Depois disso, use o pôster novo (qr-medgrip). O QR antigo do RENMAP para de valer.
-- =====================================================================
update public.missoes set codigo = 'MEDGRIP-VC7RQL' where id = 'qr_renmap';
