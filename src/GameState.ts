import { Card } from "./card";
import { Land } from "./land";
import { Mana } from "./mana";
import { Permanent } from "./permanent";

export class GameState {
    turnCount: number = 0;
    playedLand: boolean = false;
    usedMana: number = 0;
    deck: Card[] = [];
    hand: Card[] = [];
    board: Card[] = [];

    constructor () {
    }

    public static CreateWithDeck(deck: Card[]) {
        let state = new GameState();
        state.deck = deck;
        state.Shuffle();
        state.DrawCard(7);
        return state;
    }

    public Shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        return this.deck;
    }

    public ShuffleHandToDeck() {
        this.deck.push(...this.hand);
        this.hand = [];
        this.Shuffle();
    }

    public DrawCard(amount: number = 1) {
        for (let i = 0; i < amount; i++) {
            if (this.deck.length == 0) {
                return;
            }
            this.hand.push(this.deck.pop()!);
        }
    }

    public PlayLand() {
        let landIndex = this.hand.findIndex(c => c instanceof Land);
        if (landIndex == -1) {
            return false;
        }
        this.board.push(this.hand[landIndex]);
        this.hand.splice(landIndex, 1);
        this.playedLand = true;
        return true;
    }

    public StartNewTurn() {
        this.turnCount++;
        this.playedLand = false;
        this.DrawCard(1);
        for (let i = 0; i < this.board.length; i++) {
            const card = this.board[i];
            if (card instanceof Permanent) {
                card.enteredThisTurn = false;
            }
        }
    }

    public CountLandsInHand() {
        let landNumber = 0;
        for (let c = 0; c < this.hand.length; c++) {
            let card = this.hand[c];
            if (card instanceof Land) {
                landNumber++;
            }
        }
        return landNumber;
    }

    public AvailableMana() {
        let mana: Mana[] = [];
        for (let i = 0; i < this.board.length; i++) {
            const card = this.board[i];
            if (card instanceof Land && !(card.enteredThisTurn && card.entersTapped)) {
                mana.push(card.produces);
            }
        }
        return mana;
    }

    public AvailableManaInHand() {
        let mana: Mana[] = [];
        for (let i = 0; i < this.hand.length; i++) {
            const card = this.hand[i];
            if (card instanceof Land && !(card.enteredThisTurn && card.entersTapped)) {
                mana.push(card.produces);
            }
        }
        return mana;
    }
}