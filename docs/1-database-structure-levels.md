# Database structure for the learning data


## Level 1: Alphabet

The level data is located at: **courses > 1 > items > [item id]**

The item contains:
* id
* character (field, string)
* audioUrl (field, string)
* name (field, string)
* pronunciation (field, string)


## Level 2: Georgian Numbers

The level data is located at: **courses > 2 > items > [item id]**

The item contains:
* id
* number (field, string)
* translation (field, string)
* translationLatin (field, string)

## Level 3 (Basic Words)

The level data is located at: **courses > 3 > items > [item id]**

The item contains:
* id
* english (field, string)
* georgian (field, string)
* latin (field, string)
