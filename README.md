# Stamp

Creator platform where every AI-made file carries a verifiable origin (Monad Metropolis, Track 04).

## How it works
- Layer 1: invisible watermark (Adobe TrustMark, 40-bit stampId, built-in ECC)
- Layer 2: pHash fingerprint, 8 bands x 8 bits (lookup guaranteed up to Hamming 7)
- Registry: ProvenanceRegistry on Monad testnet, indexed by Envio

## Status
- Watermark + pHash spike: done (worker/stampcore.py has stamp_image() and verify_image())
- Transform test results table: being rerun on an AI-generated test set, will be added here
- ProvenanceRegistry contract: in progress
- Envio indexer, gateway, Verify page, Privy login: next

## Run the worker
Python 3.10. On Windows run this first in PowerShell: $env:PYTHONUTF8="1"
Then: pip install -r worker/requirements.txt
Put test images in imgs/ (not committed), then: python worker/spike2.py
