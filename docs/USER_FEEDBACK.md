# User Feedback and Validation (Level 5)

## Testnet User Cohort (5+)

Verified wallet addresses used for MVP validation:

1. `GCG34N562IX57PLLVKVC6LYQEK7VNX3HBR5KIECNT22MR5P7MOHN7ECW`
2. `GC53LJZ4V2CLF7NTWFKVSFWSPMKSVT7TABLDVZLT7A63HFHAY4DF4MKC`
3. `GAJDI3UZB2JGUCDDHBUQKLXYI5336YSAUIP3SKIM5MZXXHIC3IS2NK46`
4. `GBTHKSSIXQIHXYYTJJWCRYLLMV2GRJGKW4XWSUGVRLKKXJLWIJVLX4AC`
5. `GBSG3YI6RMKZZEYD3LRODO5OCIE54NKC2KBR6MKU5XSDFXBHHUKEIGEW`

## Collected Feedback Summary

- NFT images were not always rendering in gallery/details/profile views.
- Mint flow failed with unclear errors when infra keys or contract simulation failed.
- Profile page needed stronger personalization and owner-owned NFT visibility.

## Iteration Completed (Implemented)

1. **NFT image rendering fixes**
   - Added robust media URL normalization for `ipfs://`, raw CIDs, and gateway links.
   - Added fallback behavior for broken image links.

2. **Minting reliability + error clarity**
   - Pinata/API key errors now return clear, actionable responses.
   - Soroban upload-content call stabilized for registry pipeline edge cases.
   - Tx tracking and finality handling improved to avoid false failures.

3. **Profile UX improvements**
   - Added profile personalization fields (`banner`, `accentColor`, `showcaseTitle`).
   - Added owned NFTs section directly on profile page for creator identity + inventory visibility.

## Current Validation Status

- MVP is functional on Stellar testnet.
- 5+ users validated onboarding and core flows.
- At least one feedback-driven implementation iteration has been completed.
