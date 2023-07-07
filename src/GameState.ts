import { Card } from "./card";
import { Mana } from "./mana";

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

    public AvailableMana() {
        //todo
    }
}