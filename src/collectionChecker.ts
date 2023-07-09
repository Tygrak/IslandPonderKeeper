import { LoadFile, SaveFile } from "./deckImport";
import "./site.css";
import pdCardsText from "./data/pdCards.txt";

const deckLoadFileInput = document.getElementById('deckLoadFileInput') as HTMLInputElement;
const deckLoadButton = document.getElementById('deckLoadButton') as HTMLButtonElement;
const resultsTextArea: HTMLTextAreaElement = document.getElementById("results") as HTMLTextAreaElement;
const resultsTextDiv = document.getElementById("resultsText") as HTMLDivElement;
const exportResultToFileButton = document.getElementById('exportResultToFileButton') as HTMLButtonElement;
const exportResultToTextFileButton = document.getElementById('exportResultToTextFileButton') as HTMLButtonElement;

let pdCards: { [index: string]: boolean; } = {};

let resultCardsText = "";

function Initialize() {
    GetPdCardsList();
    resultsTextArea.value = "Ready";
}

function GetPdCardsList() {
    let cards = pdCardsText.split("\n");
    pdCards = {};
    for (let i = 0; i < cards.length; i++) {
        pdCards[cards[i].trim()] = true;
    }
}

function GetPdCardsFromCollection(dataString: string) {
    if (dataString.indexOf("Deck") == -1 || dataString.indexOf("Cards") == -1 || dataString.indexOf("CatID") == -1) {
        console.error("Tried to load non .dek file!");
        return "error";
    }
    let errorOutputDiv = document.getElementById('errorOutput') as HTMLDivElement;
    if (errorOutputDiv != null) {
        errorOutputDiv.innerText = "";
    }
    let kept = 0;
    let removed = 0;
    let result = "";
    let lines = dataString.split("\n");
    for (let i = 0; i < lines.length; i++) {
        let match = lines[i].match(/Quantity="(\d+)" Sideboard="(false|true)" Name="([^"]+)"/);
        if (match != null) {
            const number = parseInt(match[1]);
            const sideboard = match[2];
            const name = match[3].trim();
            if (name in pdCards) {
                result += lines[i]+"\n";
                resultCardsText += name+"\n";
                kept++;
            } else {
                removed++;
            }
        } else {
            result += lines[i]+"\n";
        }
    }
    if (errorOutputDiv != null) {
        errorOutputDiv.innerText += "Deck Loaded!";
    }
    resultsTextArea.value = result;
    resultsTextDiv.innerText = resultCardsText;
    console.log("Kept: " + kept);
    console.log("Removed: " + removed);
}

function ExportCollectionToMTGO() {
    if (resultsTextArea.value.length > 20) {
        SaveFile("collectionPD.dek", resultsTextArea.value);
    }
}

function ExportCollectionToTxt() {
    if (resultCardsText.length > 20) {
        SaveFile("collectionPD.txt", resultCardsText);
    }
}

Initialize();

deckLoadButton.onclick = (ev) => {
    if (deckLoadFileInput.files != null && deckLoadFileInput.files.length > 0) {
        LoadFile(deckLoadFileInput.files[0], (s: string) => {
            GetPdCardsFromCollection(s);
        });
    }
};

exportResultToFileButton.onclick = (ev) => {
    ExportCollectionToMTGO();
}

exportResultToTextFileButton.onclick = (ev) => {
    ExportCollectionToTxt();
}
