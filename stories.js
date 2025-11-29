// stories.js — curated short high-retention stories (mixed pack)
const storyCategories = {
  "Brainrot / Chaos": [
    "They said no phones at lunch — so I livestreamed the cafeteria and the principal joined to complain on camera.",
    "I whispered a rumor that the mascot is haunted — now it has a fan account and free merch.",
    "POV: You rizz the substitute teacher and suddenly they run the school like a reality show.",
    "I swapped the class playlist to weird ambient — the whole class fell asleep except the principal.",
    "They banned our snack, so I started selling 'invisible snacks' — lines formed."
  ],
  "Drama / School Tea": [
    "My ex leaked our DMs — so I leaked a better version and made him trending for being dramatic.",
    "The popular kid posted a fake apology video — we posted the untouched clip and watch him rewrite his life.",
    "Someone stole my presentation and said I plagiarized — I presented the video of them rehearsing it.",
    "They voted me out of the group chat. Now they ask to join my new chat 2 days later.",
    "I found a hidden playlist exposing who liked who — posted it and chaos followed."
  ],
  "Dark / Twist Ending": [
    "My neighbor waved every morning—until the street historian said the house burned down five years ago.",
    "I found notes under my bed about 'the last time' — turned out to be an old diary of my grandmother.",
    "The school lights cut out and the intercom said my name. Nobody believed me — but the footage did.",
    "I answered a DM from 'someone behind you' — it was my own prank from the future.",
    "My AirPods auto-played a message recorded from my empty room. I live alone."
  ],
  "Crush / Relationship Chaos": [
    "He said he's 'not into drama' — then started dating the person who caused the drama.",
    "My crush asked for 'space', then posted photos of our city with captions only I could read.",
    "They ghosted me and later used my joke in a comedy bit — I took over the stage next time.",
    "He told me he only dates artists — so I painted the hallway and now he's asking for lessons.",
    "I told my crush 'I like someone tall' — now he wears platforms to talk to me."
  ]
};

// API
function getCategories() { return Object.keys(storyCategories); }
function getRandomStory(cat) {
  const arr = storyCategories[cat] || [];
  return arr[Math.floor(Math.random() * arr.length)];
}

// expose
window.__BR_STORIES = { getCategories, getRandomStory };
