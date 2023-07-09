import { GameState } from "./GameState";
import { Card } from "./card";
import { CreateCardFromDatabase } from "./deckImport";
import { Land } from "./land";
import { Mana, RemoveManaForCast } from "./mana";
import { CastabilityRequirement, CheckRuleHasCardsOfType, CheckRuleLandCount, CheckRuleManaProduction, CheckRuleMatchesAllCards, CheckRuleMatchesAnyCard } from "./rules";

export function RunTests() {
    if (window.location.href.indexOf("github.io") == -1) {
        RunManacostTests();
        RunDatabaseTestsLands();
        RunRulesCardTests();
        RunRulesManaTests();
        console.log("tests finished successfully!!!");
    }
}

function RunManacostTests() {
    console.log("Running manacost tests");
    let mana = [Mana.White, Mana.Green, Mana.Red, Mana.Red];
    let card1 = new Card("1", [Mana.White]);
    console.assert(card1.IsCastable(mana));
    let card2 = new Card("2", [Mana.Red, Mana.Colorless, Mana.Red]);
    console.assert(card2.IsCastable(mana));
    let card3 = new Card("3", [Mana.Red, Mana.Colorless, Mana.Red]);
    console.assert(card3.IsCastable(mana));
    let card4 = new Card("4", [Mana.Red, Mana.Colorless, Mana.Red, Mana.Green]);
    console.assert(card4.IsCastable(mana));
    let card5 = new Card("5", [Mana.Colorless]);
    console.assert(card5.IsCastable(mana));
    let card6 = new Card("6", [Mana.Colorless, Mana.Colorless, Mana.White, Mana.Colorless]);
    console.assert(card6.IsCastable(mana));
    let cardUncastable1 = new Card("uncastable1", [Mana.Blue]);
    console.assert(!cardUncastable1.IsCastable(mana));
    let cardUncastable2 = new Card("uncastable2", [Mana.Red, Mana.Red, Mana.Red]);
    console.assert(!cardUncastable2.IsCastable(mana));
    let cardUncastable3 = new Card("uncastable3", [Mana.Colorless, Mana.Colorless, Mana.Colorless, Mana.Colorless, Mana.Colorless]);
    console.assert(!cardUncastable3.IsCastable(mana));
    let availableMana = RemoveManaForCast([Mana.White, Mana.Green, Mana.Red, Mana.Red], [Mana.Red]);
    console.assert(availableMana.length == 3);
    console.assert(availableMana.indexOf(Mana.White) != -1 && availableMana.indexOf(Mana.Green) != -1 && availableMana.indexOf(Mana.Red) != -1);
    availableMana = RemoveManaForCast([Mana.White, Mana.Green, Mana.Red, Mana.Red], [Mana.Red, Mana.Red]);
    console.assert(availableMana.length == 2);
    console.assert(availableMana.indexOf(Mana.White) != -1 && availableMana.indexOf(Mana.Green) != -1 && availableMana.indexOf(Mana.Red) == -1);
    availableMana = RemoveManaForCast([Mana.White, Mana.Green, Mana.Red, Mana.Red], [Mana.Colorless, Mana.Red, Mana.Red, Mana.Colorless]);
    console.assert(availableMana.length == 0);
}

function RunDatabaseTestsLands() {
    console.log("Running database tests");
    let plains = CreateCardFromDatabase("Plains");
    console.assert(plains instanceof Land && plains.produces == Mana.White && plains.IsType("Basic"));
    let island = CreateCardFromDatabase("Island");
    console.assert(island instanceof Land && island.produces == Mana.Blue && island.IsType("Basic"));
    let swamp = CreateCardFromDatabase("Swamp");
    console.assert(swamp instanceof Land && swamp.produces == Mana.Black && swamp.IsType("Basic"));
    let mountain = CreateCardFromDatabase("Mountain");
    console.assert(mountain instanceof Land && mountain.produces == Mana.Red && mountain.IsType("Basic"));
    let forest = CreateCardFromDatabase("Forest");
    console.assert(forest instanceof Land && forest.produces == Mana.Green && forest.IsType("Basic"));
    let wastes = CreateCardFromDatabase("Wastes");
    console.assert(wastes instanceof Land && wastes.produces == Mana.Colorless && wastes.IsType("Basic"));
    let sunkenHollow = CreateCardFromDatabase("Sunken Hollow");
    console.assert(sunkenHollow instanceof Land && sunkenHollow.produces == (Mana.Blue|Mana.Black) && !sunkenHollow.IsType("Basic"));
    let tendoIce = CreateCardFromDatabase("Tendo Ice Bridge");
    console.assert(tendoIce instanceof Land && tendoIce.produces == (Mana.White|Mana.Blue|Mana.Black|Mana.Red|Mana.Green));
}

function RunRulesManaTests() {
    console.log("Running rules mana tests");
    let state = new GameState();
    state.hand = [new Land("Island", Mana.Blue), new Land("Island", Mana.Blue)];
    console.assert(!CheckRuleManaProduction(state, "W") && !CheckRuleManaProduction(state, "B"));
    console.assert(!CheckRuleManaProduction(state, "R") && !CheckRuleManaProduction(state, "G"));
    console.assert(!CheckRuleManaProduction(state, "R,R"));
    console.assert(CheckRuleManaProduction(state, "U"));
    console.assert(CheckRuleManaProduction(state, "W/U"));
    console.assert(CheckRuleManaProduction(state, "1, U"));
    console.assert(CheckRuleManaProduction(state, "U, U"));
    console.assert(CheckRuleManaProduction(state, "2"));
    console.assert(CheckRuleManaProduction(state, "W/U,U/B"));
    console.assert(!CheckRuleLandCount(state, 3, 5));
    console.assert(CheckRuleLandCount(state, 1, 3));
    console.assert(CheckRuleLandCount(state, 2, 2));
    state.hand = [new Land("Caves of Koilos", Mana.White|Mana.Black), new Land("Plains", Mana.White)];
    console.assert(!CheckRuleManaProduction(state, "U"));
    console.assert(!CheckRuleManaProduction(state, "B,B"));
    console.assert(CheckRuleManaProduction(state, "W"));
    console.assert(CheckRuleManaProduction(state, "B"));
    console.assert(CheckRuleManaProduction(state, "W,B"));
    console.assert(CheckRuleManaProduction(state, "B,W"));
    console.assert(CheckRuleManaProduction(state, "W,W"));
    console.assert(CheckRuleManaProduction(state, "1,B"));
    console.assert(CheckRuleLandCount(state, 2, 2));
}

function RunRulesCardTests() {
    console.log("Running rules card tests");
    let state = new GameState();
    state.hand = [CreateCardFromDatabase("Empty the Warrens"), CreateCardFromDatabase("Seething Song"),  CreateCardFromDatabase("Irencrag Feat"), 
                  CreateCardFromDatabase("Desperate Ritual"), CreateCardFromDatabase("Mountain"), CreateCardFromDatabase("Mountain"), 
                  CreateCardFromDatabase("Apex of Power")];
    console.assert(!CheckRuleHasCardsOfType(state, "Creature", CastabilityRequirement.None));
    console.assert(CheckRuleHasCardsOfType(state, "Instant", CastabilityRequirement.None));
    console.assert(CheckRuleHasCardsOfType(state, "Instant, Sorcery", CastabilityRequirement.None));

    console.assert(!CheckRuleMatchesAllCards(state, "Dragonstorm", CastabilityRequirement.None));
    console.assert(!CheckRuleMatchesAllCards(state, "Empty the Warrens|Dragonstorm", CastabilityRequirement.None));
    console.assert(CheckRuleMatchesAllCards(state, "Empty the Warrens", CastabilityRequirement.None));
    console.assert(CheckRuleMatchesAllCards(state, "Irencrag Feat|Empty the Warrens", CastabilityRequirement.None));

    console.assert(!CheckRuleMatchesAnyCard(state, "Dragonstorm", CastabilityRequirement.None));
    console.assert(!CheckRuleMatchesAnyCard(state, "Dragonstorm|Pyretic Ritual", CastabilityRequirement.None));
    console.assert(CheckRuleMatchesAnyCard(state, "Empty the Warrens", CastabilityRequirement.None));
    console.assert(CheckRuleMatchesAnyCard(state, "Irencrag Feat|Empty the Warrens", CastabilityRequirement.None));
    console.assert(CheckRuleMatchesAnyCard(state, "Empty the Warrens|Dragonstorm", CastabilityRequirement.None));
    
    console.assert(!CheckRuleMatchesAllCards(state, "Empty the Warrens", CastabilityRequirement.CastableWithLands));
    console.assert(!CheckRuleMatchesAnyCard(state, "Empty the Warrens", CastabilityRequirement.CastableWithLands));
    console.assert(CheckRuleMatchesAllCards(state, "Desperate Ritual", CastabilityRequirement.CastableWithLands));
    console.assert(CheckRuleMatchesAnyCard(state, "Desperate Ritual", CastabilityRequirement.CastableWithLands));
    
    console.assert(!CheckRuleMatchesAllCards(state, "Apex of Power", CastabilityRequirement.CastableWithRituals));
    console.assert(!CheckRuleMatchesAnyCard(state, "Apex of Power", CastabilityRequirement.CastableWithRituals));
    console.assert(CheckRuleMatchesAllCards(state, "Empty the Warrens", CastabilityRequirement.CastableWithRituals));
    console.assert(CheckRuleMatchesAnyCard(state, "Empty the Warrens", CastabilityRequirement.CastableWithRituals));

    state.hand = [CreateCardFromDatabase("Simian Spirit Guide"), CreateCardFromDatabase("Mountain"),  CreateCardFromDatabase("Swamp"), 
                  CreateCardFromDatabase("Dark Ritual"), CreateCardFromDatabase("Goblin Charbelcher"), CreateCardFromDatabase("Pyretic Ritual"), 
                  CreateCardFromDatabase("Inferno Titan")];
    console.assert(!CheckRuleMatchesAllCards(state, "Inferno Titan", CastabilityRequirement.CastableWithRitualsT1));
    console.assert(CheckRuleMatchesAllCards(state, "Pyretic Ritual", CastabilityRequirement.CastableWithRitualsT1));
    console.assert(CheckRuleMatchesAllCards(state, "Goblin Charbelcher", CastabilityRequirement.CastableWithRitualsT1));
    console.assert(CheckRuleMatchesAnyCard(state, "Goblin Charbelcher", CastabilityRequirement.CastableWithRitualsT1));

    state.hand = [CreateCardFromDatabase("Simian Spirit Guide"), CreateCardFromDatabase("Dark Ritual"),  CreateCardFromDatabase("Cabal Ritual"), 
                  CreateCardFromDatabase("Balustrade Spy"), CreateCardFromDatabase("Undercity Informer"), CreateCardFromDatabase("Strike It Rich"), 
                  CreateCardFromDatabase("Liliana Vess")];
    console.assert(!CheckRuleMatchesAllCards(state, "Liliana Vess", CastabilityRequirement.CastableWithRituals));
    console.assert(CheckRuleMatchesAllCards(state, "Undercity Informer", CastabilityRequirement.CastableWithRituals));
    console.assert(CheckRuleMatchesAllCards(state, "Balustrade Spy", CastabilityRequirement.CastableWithRituals));
    console.assert(!CheckRuleMatchesAnyCard(state, "Liliana Vess", CastabilityRequirement.CastableWithRituals));
    console.assert(CheckRuleMatchesAnyCard(state, "Undercity Informer", CastabilityRequirement.CastableWithRituals));
    console.assert(CheckRuleMatchesAnyCard(state, "Balustrade Spy", CastabilityRequirement.CastableWithRituals));
    console.assert(!CheckRuleMatchesAllCards(state, "Liliana Vess", CastabilityRequirement.CastableWithRitualsT1));
    console.assert(CheckRuleMatchesAllCards(state, "Undercity Informer", CastabilityRequirement.CastableWithRitualsT1));
    console.assert(CheckRuleMatchesAllCards(state, "Balustrade Spy", CastabilityRequirement.CastableWithRitualsT1));
    console.assert(!CheckRuleMatchesAnyCard(state, "Liliana Vess", CastabilityRequirement.CastableWithRitualsT1));
    console.assert(CheckRuleMatchesAnyCard(state, "Undercity Informer", CastabilityRequirement.CastableWithRitualsT1));
    console.assert(CheckRuleMatchesAnyCard(state, "Balustrade Spy", CastabilityRequirement.CastableWithRitualsT1));
}
