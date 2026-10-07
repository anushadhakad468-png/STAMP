# Stamp

Creator platform where every AI-made file carries a verifiable origin (Monad Metropolis, Track 04).

## How it works
- Layer 1: invisible watermark (Adobe TrustMark, 40-bit stampId, built-in ECC)
- Layer 2: pHash fingerprint, 8 bands x 8 bits (lookup guaranteed up to Hamming 7)
- Registry: ProvenanceRegistry on Monad testnet, indexed by Envio

## Watermark test results
10 AI-generated images (mixed styles), each stamped, then attacked. Single run, random IDs, n=10: results moved by 1-4 images between runs.

| Attack | TrustMark decoded | invisible-watermark (best variant) | pHash median distance |
|---|---|---|---|
| none | 10/10 | 10/10 | 0 |
| JPEG q40 | 8/10 | 0/10 | 0 |
| resize 50% | 10/10 | 10/10 | 0 |
| crop 20% | 9/10 | 0/10 | 22 |
| screenshot (75% shrink + blur + JPEG 70) | 9/10 | 0/10 | 0 |
| crop + JPEG q40 | 4/10 | 0/10 | 22 |
| crop + screenshot | 7/10 | 0/10 | 22 |
| resize 50% + crop + JPEG q40 | 1/10 | 0/10 | 22 |

- Unrelated images sit 20-44 apart in pHash. Match threshold: 7.
- pHash does not survive crops (22 is inside the stranger range), so cropped copies rely on the watermark.
- Known limits: stacked attacks (crop + JPEG, resize + crop + JPEG) often defeat the watermark. This is a provenance signal, not proof of authenticity.
- False positives on never-stamped images: 0/30.

## Status
- Watermark + pHash spike: done (worker/stampcore.py has stamp_image() and verify_image())
- ProvenanceRegistry contract: in progress
- Envio indexer, gateway, Verify page, Privy login: next

## Run the worker
Python 3.10. On Windows run this first in PowerShell: $env:PYTHONUTF8="1"
Then: pip install -r worker/requirements.txt
Put test images in imgs/ (not committed), then: python worker/spike2.py
