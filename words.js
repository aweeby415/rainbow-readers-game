words.js
// words.js - Rainbow Readers Sight Word Levels

// Define the word levels object
const WORD_LEVELS = {
    red: [
        "I",
        "can",
        "the",
        "we",
        "see"
    ],
    orange: [
        "a",
        "like",
        "to",
        "and",
        "go"
    ],
    yellow: [
        "you",
        "do",
        "my",
        "are",
        "he"
    ],
    green: [
        "with",
        "is",
        "little",
        "she",
        "was"
    ],
    blue: [
        "for",
        "have",
        "they",
        "of",
        "said"
    ],
    purple: [
        "want",
        "here",
        "me",
        "this",
        "what"
    ],
    pink: [
        "help",
        "too",
        "play",
        "has",
        "where"
    ],
    gold: [
        "look",
        "who",
        "good",
        "come",
        "does"
    ]
};

// Define the color properties for each level
const LEVEL_COLORS = {
    red: {
        name: "RED",
        primary: "#FF0000",
        gradient: ["#FF9999", "#FF4444", "#CC0000"],
        textColor: "#FFFFFF"
    },
    orange: {
        name: "ORANGE",
        primary: "#FF8800",
        gradient: ["#FFBB77", "#FF8800", "#EE7700"],
        textColor: "#FFFFFF"
    },
    yellow: {
        name: "YELLOW",
        primary: "#FFCC00",
        gradient: ["#FFEE88", "#FFCC00", "#EEBB00"],
        textColor: "#333333"
    },
    green: {
        name: "GREEN",
        primary: "#33CC33",
        gradient: ["#99EE99", "#33CC33", "#22BB22"],
        textColor: "#FFFFFF"
    },
    blue: {
        name: "BLUE",
        primary: "#3399FF",
        gradient: ["#99CCFF", "#3399FF", "#2288EE"],
        textColor: "#FFFFFF"
    },
    purple: {
        name: "PURPLE",
        primary: "#9966FF",
        gradient: ["#CC99FF", "#9966FF", "#8855EE"],
        textColor: "#FFFFFF"
    },
    pink: {
        name: "PINK",
        primary: "#FF66CC",
        gradient: ["#FFAADD", "#FF66CC", "#EE55BB"],
        textColor: "#FFFFFF"
    },
    gold: {
        name: "GOLD",
        primary: "#FFCC00",
        gradient: ["#FFEE88", "#FFCC00", "#FFBB00"],
        textColor: "#333333"
    }
};

// Order of the levels
const LEVEL_ORDER = ["red", "orange", "yellow", "green", "blue", "purple", "pink", "gold"];

console.log("Words file loaded successfully!");
