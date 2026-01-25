# Database structure for the learning data

Each level has these fields along with "items" document:
* description (string)
* title (string)
* type (string, possible options: 'characters', 'numbers', 'words', 'phrases')

---

The learning data for levels is different based on `type` field

## Type 1: characters

The item contains these fields:
* id (string)
* character (string)
* audioUrl (string)
* name (string)
* pronunciation (string)

## Type 2: numbers

The item contains these fields:
* id (string)
* number (string)
* translation (string)
* translationLatin (string)

## Type 3: words

The item contains these fields:
* id (string)
* english (string)
* georgian (string)
* latin (string)

## Type 4: phrases

The item contains these fields:
* english (string)
* georgian (string)
* id (string)



---

## Level 1: Alphabet
Type: 'characters'

The level data is located at: **courses > alphabet > items > [item id]**


## Level 2: Numbers
Type: 'numbers'

The level data is located at: **courses > numbers > items > [item id]**


## Level 3 (Basic Words)
Type: 'words'

The level data is located at: **courses > words-basic > items > [item id]**


## Level 4 (Essential Phrases)
Type: 'phrases'

The level data is located at: **courses > phrases-essential > items > [item id]**


## Level 5 (Pronouns)
Type: 'words'

The level data is located at: **courses > pronouns > items > [item id]**
