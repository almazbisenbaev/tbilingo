# Learning data


## Alphabet course:

**courses > 1 > items > [item id]**

The item contains:
* id
* character (field, string)
* audioUrl (field, string)
* name (field, string)
* pronunciation (field, string)


## Georgian Numbers course:

**courses > 2 > items > [item id]**

The item contains:
* id
* number (field, string)
* translation (field, string)
* translationLatin (field, string)


---


# User progress


## 1st course (Alphabet)

**users > [user id] > progress > 1 **

Fields:
* courseId (string)
* learnedItemIds (array, contains item IDs)
* userId (the user's ID)


## 2nd course (Georgian Numbers)

**users > [user id] > progress > 2 **

Fields:
* courseId (string)
* learnedItemIds (array, contains item IDs)
* userId (the user's ID)
