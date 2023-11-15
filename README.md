## Island Ponder Keeper

Try live [here](https://tygrak.github.io/IslandPonderKeeper/public/)!

### Updating instructions

download oracle-cards.json from here https://scryfall.com/docs/api/bulk-data
uncomment cleandatabase from deckimport and main.ts
open site
put the new downloaded database.json to the data folder
comment stuff in deckimport and main.ts again (IMPORTANT, if you don't do this the file will be too gigantic and github will reject it)

### Building

npm run dev