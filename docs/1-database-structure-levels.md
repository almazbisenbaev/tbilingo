# Database structure for the learning data

Each level has these fields along with "items" document:
* description (string)
* title (string)
* type (string, possible options: 'characters', 'numbers', 'words', 'phrases')


## Level 1: Alphabet
Type: 'characters'

The level data is located at: **courses > 1 > items > [item id]**

The item contains these fields:
* id (string)
* character (string)
* audioUrl (string)
* name (string)
* pronunciation (string)



## Level 2: Georgian Numbers
Type: 'numbers'

The level data is located at: **courses > 2 > items > [item id]**

The item contains these fields:
* id (string)
* number (string)
* translation (string)
* translationLatin (string)



## Level 3 (Basic Words)
Type: 'words'

The level data is located at: **courses > 3 > items > [item id]**

The item contains these fields:
* id (string)
* english (string)
* georgian (string)
* latin (string)



## Level 4 (Essential Phrases)
Type: 'phrases'

The level data is located at: **courses > 4 > items > [item id]**

The item contains these fields:
* english (string)
* georgian (string)
* id (string)
