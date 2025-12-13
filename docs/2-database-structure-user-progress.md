# Database structure for user's progress


## 1st course (Alphabet)

**users > [user id] > progress > 1**

The document "1" has following fields:

* courseId (string)
* userId (the user's ID)
* isFinished (boolean)
* learnedItemIds (array, contains item IDs)
    * [item id]



## 2nd course (Georgian Numbers)

**users > [user id] > progress > 2**

The document "2" has following fields:
* courseId (string)
* isFinished (boolean)
* userId (the user's ID)
* learnedItemIds (array, contains item IDs)
    * [item id]


## Level 3 (Basic Words)

**users > [user id] > progress > 3 **

The document "3" has following fields:
* courseId (string)
* isFinished (boolean)
* userId (the user's ID)
* learnedItemIds (array, contains item IDs)
    * [item id]
