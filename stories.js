export const storyCategories = {
  "Brainrot / Chaos": [
    "Teacher: phones away. Me: *pulls out a Nintendo Switch* 🎮😐",
    "They told me to be myself… so I became a problem 😌",
    "POV: You sneeze once and the whole class acts like you started COVID 4 💀",
    "My rizz is so bad even CAPTCHA thinks I'm a robot 🤖",
    "School said no snacks… so I BECAME the snack 😎✨"
  ],

  "Drama / School Tea": [
    "My friend’s fake smile cracked when I complimented someone else 😌",
    "The group kicked me out. Now they stalk what I do without them 👀",
    "She stole my look… so I stole her spotlight 💅",
    "They laughed when I failed… I laughed when they repeated the grade 😭",
    "Someone kept stealing my lunch… so I made it spicy enough to expose the thief 🔥"
  ],

  "Dark / Twist Ending": [
    "A stranger waves at me every morning… but the house is abandoned.",
    "My AirPods connect to a phone named “Behind You”… I live alone.",
    "My mom said not to talk to the boy in my room… we don’t have neighbors.",
    "I heard footsteps in the attic… we don’t have an attic.",
    "My friend blocked me… so why is she texting me from her phone right now?"
  ],

  "Crush / Relationship Chaos": [
    "He said I'm not his type… now his type cries over him 💅",
    "My crush left me on delivered… so I left him in the past ✌️",
    "He cheated with my bestie… now I'm HER bestie 😌",
    "He asked who I like… I said 'Someone taller' 💀",
    "My crush ignored me… now he watches my stories first 😏"
  ]
};

export function getRandomStory(category) {
  const list = storyCategories[category];
  return list[Math.floor(Math.random() * list.length)];
}

export function getCategories() {
  return Object.keys(storyCategories);
}
