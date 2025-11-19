/**
 * Course Definitions for Phrase-Based Courses
 * Centralized configuration for all phrase learning courses
 */

export interface CourseConfig {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  icon: string;
  estimatedTime: number;
  order: number;
  route: string; // Individual route for each course
}

export interface PhraseData {
  id: string;
  english: string;
  georgian: string;
}

// Course configurations
export const PHRASE_COURSES: CourseConfig[] = [
  {
    id: '4',
    title: 'Phrases Advanced',
    description: 'Advanced Georgian phrases with sentence construction gameplay',
    prerequisites: ['phrases-1'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 45,
    order: 4,
    route: '/learn/4'
  },
  {
    id: '5',
    title: 'Business Georgian',
    description: 'Essential Georgian phrases for business and professional settings',
    prerequisites: ['4'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 60,
    order: 5,
    route: '/learn/5'
  },
  {
    id: '6',
    title: 'Travel Georgian',
    description: 'Useful phrases for traveling and tourism in Georgia',
    prerequisites: ['phrases-1'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 40,
    order: 6,
    route: '/learn/6'
  },
  {
    id: '7',
    title: 'Restaurant & Food',
    description: 'Georgian phrases for dining, ordering food, and restaurants',
    prerequisites: ['phrases-1'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 35,
    order: 7,
    route: '/learn/7'
  },
  {
    id: '8',
    title: 'Shopping & Markets',
    description: 'Essential phrases for shopping, bargaining, and market visits',
    prerequisites: ['phrases-1'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 30,
    order: 8,
    route: '/learn/8'
  },
  {
    id: '9',
    title: 'Family & Relationships',
    description: 'Georgian phrases about family, friends, and relationships',
    prerequisites: ['phrases-1'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 40,
    order: 9,
    route: '/learn/9'
  },
  {
    id: '10',
    title: 'Medical & Health',
    description: 'Important Georgian phrases for medical situations and health',
    prerequisites: ['4'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 50,
    order: 10,
    route: '/learn/10'
  },
  {
    id: '11',
    title: 'Directions & Transportation',
    description: 'Georgian phrases for asking directions and using transportation',
    prerequisites: ['phrases-1'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 35,
    order: 11,
    route: '/learn/11'
  },
  {
    id: '12',
    title: 'Weather & Seasons',
    description: 'Georgian phrases about weather, seasons, and climate',
    prerequisites: ['phrases-1'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 25,
    order: 12,
    route: '/learn/12'
  },
  {
    id: '13',
    title: 'Culture & Traditions',
    description: 'Georgian phrases about culture, traditions, and customs',
    prerequisites: ['4'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 55,
    order: 13,
    route: '/learn/13'
  },
  {
    id: '14',
    title: 'Emergency Situations',
    description: 'Critical Georgian phrases for emergency and urgent situations',
    prerequisites: ['4'],
    icon: '/images/icon-phrases.svg',
    estimatedTime: 45,
    order: 14,
    route: '/learn/14'
  }
];

// Sample data for each course
export const COURSE_SAMPLE_DATA: Record<string, PhraseData[]> = {
  'phrases-business': [
    { id: "1", english: "I have a meeting at 2 PM", georgian: "მე მაქვს შეხვედრა 2 საათზე" },
    { id: "2", english: "Could you send me the report?", georgian: "შეგიძლიათ გამომიგზავნოთ ანგარიში?" },
    { id: "3", english: "I work in marketing", georgian: "მე ვმუშაობ მარკეტინგში" },
    { id: "4", english: "What is your business card?", georgian: "რა არის თქვენი სავიზიტო ბარათი?" },
    { id: "5", english: "I need to make a presentation", georgian: "მე უნდა გავაკეთო პრეზენტაცია" },
    { id: "6", english: "The deadline is next week", georgian: "ვადა მომავალ კვირას არის" },
    { id: "7", english: "I'm calling about the contract", georgian: "ვრეკავ კონტრაქტის შესახებ" },
    { id: "8", english: "Can we schedule a conference call?", georgian: "შეგვიძლია დავგეგმოთ კონფერენს ზარი?" },
    { id: "9", english: "I'm the project manager", georgian: "მე ვარ პროექტის მენეჯერი" },
    { id: "10", english: "We need to increase sales", georgian: "ჩვენ უნდა გავზარდოთ გაყიდვები" }
  ],
  
  'phrases-travel': [
    { id: "1", english: "Where is the train station?", georgian: "სად არის სარკინიგზო ვოკზალი?" },
    { id: "2", english: "I need a taxi to the airport", georgian: "მე მჭირდება ტაქსი აეროპორტამდე" },
    { id: "3", english: "How much is a ticket to Batumi?", georgian: "რა ღირს ბილეთი ბათუმამდე?" },
    { id: "4", english: "I have a reservation", georgian: "მე მაქვს ჯავშნობა" },
    { id: "5", english: "Where can I exchange money?", georgian: "სად შემიძლია ფულის გაცვლა?" },
    { id: "6", english: "I'm looking for a hotel", georgian: "მე ვეძებ სასტუმროს" },
    { id: "7", english: "What time does the bus leave?", georgian: "რა დროს გადის ავტობუსი?" },
    { id: "8", english: "I'm lost, can you help me?", georgian: "დავკარგე გზა, შეგიძლიათ დამეხმაროთ?" },
    { id: "9", english: "Is there free wifi here?", georgian: "არის თუ არა უფასო ვაიფაი აქ?" },
    { id: "10", english: "I'd like to rent a car", georgian: "მინდა ავტომობილის დაქირავება" }
  ],
  
  'phrases-restaurant': [
    { id: "1", english: "I'd like to make a reservation", georgian: "მინდა ადგილის დაჯავშნება" },
    { id: "2", english: "Can I see the menu please?", georgian: "შემიძლია მენიუს ნახვა?" },
    { id: "3", english: "I'm vegetarian", georgian: "მე ვეგეტარიანელი ვარ" },
    { id: "4", english: "What do you recommend?", georgian: "რას მირჩევთ?" },
    { id: "5", english: "I'll have the khachapuri", georgian: "მე ხაჭაპური მინდა" },
    { id: "6", english: "Is this spicy?", georgian: "ეს ცხარეა?" },
    { id: "7", english: "Can I have the bill please?", georgian: "შემიძლია ანგარიშის მიღება?" },
    { id: "8", english: "The food is delicious", georgian: "საკვები გემრიელია" },
    { id: "9", english: "I have a food allergy", georgian: "მე მაქვს საკვების ალერგია" },
    { id: "10", english: "We'd like to sit outside", georgian: "ჩვენ გარეთ ჯდომა გვინდა" }
  ],
  
  'phrases-shopping': [
    { id: "1", english: "How much does this cost?", georgian: "რა ღირს ეს?" },
    { id: "2", english: "Can I try this on?", georgian: "შემიძლია ამის გამოცდა?" },
    { id: "3", english: "Do you have this in a different size?", georgian: "გაქვთ ეს სხვა ზომაში?" },
    { id: "4", english: "I'm just looking", georgian: "მე უბრალოდ ვუყურებ" },
    { id: "5", english: "Where is the cashier?", georgian: "სად არის კასირი?" },
    { id: "6", english: "Do you accept credit cards?", georgian: "იღებთ საკრედიტო ბარათებს?" },
    { id: "7", english: "I'd like to return this", georgian: "მინდა ამის დაბრუნება" },
    { id: "8", english: "Is this on sale?", georgian: "ეს ფასდაკლებითაა?" },
    { id: "9", english: "Can you gift wrap this?", georgian: "შეგიძლიათ ამის საჩუქრად შეფუთვა?" },
    { id: "10", english: "I need a bag", georgian: "მე ტომარა მჭირდება" }
  ],
  
  'phrases-family': [
    { id: "1", english: "This is my family", georgian: "ეს არის ჩემი ოჯახი" },
    { id: "2", english: "I have two children", georgian: "მე მაქვს ორი ბავშვი" },
    { id: "3", english: "My wife is Georgian", georgian: "ჩემი ცოლი ქართველია" },
    { id: "4", english: "How old are your kids?", georgian: "რამდენი წლისაა შენი ბავშვები?" },
    { id: "5", english: "My parents live in Tbilisi", georgian: "ჩემი მშობლები თბილისში ცხოვრობენ" },
    { id: "6", english: "I miss my grandmother", georgian: "ჩემი ბებია მენატრება" },
    { id: "7", english: "My brother is getting married", georgian: "ჩემი ძმა ქორწინდება" },
    { id: "8", english: "We're expecting a baby", georgian: "ჩვენ ბავშვს ველოდებით" },
    { id: "9", english: "My daughter speaks Georgian", georgian: "ჩემი ქალიშვილი ქართულად ლაპარაკობს" },
    { id: "10", english: "I love spending time with family", georgian: "მიყვარს ოჯახთან დროის გატარება" }
  ],
  
  'phrases-medical': [
    { id: "1", english: "I need to see a doctor", georgian: "მე ექიმის ნახვა მჭირდება" },
    { id: "2", english: "I have a headache", georgian: "მე ტავი მტკივა" },
    { id: "3", english: "Where is the pharmacy?", georgian: "სად არის აფთიაქი?" },
    { id: "4", english: "I'm allergic to penicillin", georgian: "მე პენიცილინზე მაქვს ალერგია" },
    { id: "5", english: "I feel nauseous", georgian: "გულისრევა მაქვს" },
    { id: "6", english: "I need an ambulance", georgian: "მე სასწრაფო დახმარება მჭირდება" },
    { id: "7", english: "My stomach hurts", georgian: "კუჭი მტკივა" },
    { id: "8", english: "I have a fever", georgian: "მე ცხელება მაქვს" },
    { id: "9", english: "I need a prescription", georgian: "მე რეცეპტი მჭირდება" },
    { id: "10", english: "When is my appointment?", georgian: "როდის მაქვს ვიზიტი?" }
  ],
  
  'phrases-directions': [
    { id: "1", english: "Excuse me, where is the museum?", georgian: "ბოდიში, სად არის მუზეუმი?" },
    { id: "2", english: "Turn left at the traffic light", georgian: "შუქნიშანთან მარცხნივ მიუხვიეთ" },
    { id: "3", english: "Go straight for 200 meters", georgian: "200 მეტრი პირდაპირ იარეთ" },
    { id: "4", english: "It's on the right side", georgian: "ეს მარჯვენა მხარეს არის" },
    { id: "5", english: "How far is it from here?", georgian: "რამდენად შორსაა აქედან?" },
    { id: "6", english: "I'm looking for Rustaveli Avenue", georgian: "მე ვეძებ რუსთაველის გამზირს" },
    { id: "7", english: "Is there a metro station nearby?", georgian: "არის თუ არა მეტროს სადგური ახლოს?" },
    { id: "8", english: "Can you show me on the map?", georgian: "შეგიძლიათ რუკაზე მაჩვენოთ?" },
    { id: "9", english: "I need to get to the airport", georgian: "მე აეროპორტში უნდა მივიდე" },
    { id: "10", english: "Which bus goes to the city center?", georgian: "რომელი ავტობუსი მიდის ქალაქის ცენტრში?" }
  ],
  
  'phrases-weather': [
    { id: "1", english: "What's the weather like today?", georgian: "რა ამინდია დღეს?" },
    { id: "2", english: "It's raining outside", georgian: "გარეთ წვიმს" },
    { id: "3", english: "The sun is shining", georgian: "მზე ანათებს" },
    { id: "4", english: "It's very cold today", georgian: "დღეს ძალიან ცივაა" },
    { id: "5", english: "I love spring weather", georgian: "მიყვარს გაზაფხულის ამინდი" },
    { id: "6", english: "It's snowing in the mountains", georgian: "მთებში თოვლი იცემა" },
    { id: "7", english: "Summer is very hot here", georgian: "ზაფხული აქ ძალიან ცხელია" },
    { id: "8", english: "The wind is strong today", georgian: "დღეს ქარი ძლიერია" },
    { id: "9", english: "I hope it doesn't rain tomorrow", georgian: "იმედი მაქვს ხვალ არ წავა წვიმა" },
    { id: "10", english: "Autumn leaves are beautiful", georgian: "შემოდგომის ფოთლები ლამაზია" }
  ],
  
  'phrases-culture': [
    { id: "1", english: "Georgian culture is fascinating", georgian: "ქართული კულტურა ძალიან საინტერესოა" },
    { id: "2", english: "I want to learn Georgian dances", georgian: "მინდა ქართული ცეკვების სწავლა" },
    { id: "3", english: "What is this traditional dish?", georgian: "რა არის ეს ტრადიციული კერძი?" },
    { id: "4", english: "Georgian wine is famous worldwide", georgian: "ქართული ღვინო მსოფლიოში ცნობილია" },
    { id: "5", english: "I love Georgian music", georgian: "მიყვარს ქართული მუსიკა" },
    { id: "6", english: "Tell me about Georgian history", georgian: "მითხარით ქართული ისტორიის შესახებ" },
    { id: "7", english: "Georgian hospitality is legendary", georgian: "ქართული სტუმართმოყვარეობა ლეგენდარულია" },
    { id: "8", english: "I want to visit old churches", georgian: "მინდა ძველი ეკლესიების მონახულება" },
    { id: "9", english: "Georgian alphabet is unique", georgian: "ქართული ანბანი უნიკალურია" },
    { id: "10", english: "I'm interested in Georgian literature", georgian: "მაინტერესებს ქართული ლიტერატურა" }
  ],
  
  'phrases-emergency': [
    { id: "1", english: "Help me please!", georgian: "დამეხმარეთ!" },
    { id: "2", english: "Call the police!", georgian: "დარეკეთ პოლიციას!" },
    { id: "3", english: "I need an ambulance", georgian: "მე სასწრაფო საზრუნაო მჭირდება" },
    { id: "4", english: "There's been an accident", georgian: "უბედური შემთხვევა მოხდა" },
    { id: "5", english: "I've lost my passport", georgian: "პასპორტი დავკარგე" },
    { id: "6", english: "Someone stole my bag", georgian: "ვინმემ ჩანთა მოიპარა" },
    { id: "7", english: "I'm lost and scared", georgian: "გზა დავკარგე და შიში მაქვს" },
    { id: "8", english: "Where is the nearest hospital?", georgian: "სად არის უახლოესი ჰოსპიტალი?" },
    { id: "9", english: "I don't feel safe", georgian: "თავს უსაფრთხოდ არ ვგრძნობ" },
    { id: "10", english: "Please contact my embassy", georgian: "გთხოვთ დაუკავშირდეთ ჩემს საელჩოს" }
  ]
};

// Get course configuration by ID
export function getCourseConfig(courseId: string): CourseConfig | undefined {
  return PHRASE_COURSES.find(course => course.id === courseId);
}

// Get sample data for a course
export function getCourseSampleData(courseId: string): PhraseData[] {
  return COURSE_SAMPLE_DATA[courseId] || [];
}

// Get all phrase course IDs
export function getAllPhraseCourseIds(): string[] {
  return PHRASE_COURSES.map(course => course.id);
}