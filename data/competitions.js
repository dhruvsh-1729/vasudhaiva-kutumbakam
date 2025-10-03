// data/competitions.js

import { title } from "process";

// Basic competition data structure
export const competitions = [ 
  { id: 1, title: "AI Short Video", description: "Create a 1-3 minute AI-generated reel on weekly themes.", icon: "🎥", color: "from-blue-500 to-blue-600", deadline: "November 20, 2025" }, 
  { id: 2, title: "Creative Expression", description: "Creative script made using AI tools.", icon: "✍️", color: "from-green-500 to-green-600", deadline: "November 20, 2025" }, 
  // { id: 3, title: "Political Toons", description: "Create a political satire cartoon using AI tools.", icon: "🖼️", color: "from-purple-500 to-purple-600", deadline: "November 20, 2025" },
  {id: 4 ,title:"Painting with AI", description:"Create a painting using AI tools.", icon:"🖌️", color:"from-yellow-500 to-yellow-600", deadline:"November 20, 2025"}
];

// Generate detailed sections dynamically based on competition type
const generateSectionsForCompetition = (competition) => {
  const baseSections = [];
  
  // Problem Statement
  baseSections.push({
    id: "problem-statement",
    title: "Problem Statement",
    content: `Welcome to the ${competition.title} competition! ${competition.description}
          
      **📢 Week 1 Challenge – VK Competition**

      Global governance, diplomacy, culture, and law face huge challenges today. Powerful nations often influence global decisions, while the wisdom of ancient civilizations offers timeless solutions.
      Your task: Use ancient wisdom and creative expression to explore solutions for modern global and legal issues. Topics include:

      **🌏 Geopolitics & Global Governance**

      1.Reforming the UN for fair global participation
      2.Uniting the Global South to raise its collective voice
      3.Lessons from ancient diplomacy for modern international relations
      4.Promoting global peace through Vasudhaiva Kutumbakam philosophy
      5.Decolonizing the consciousness of the Global South

      **⚖️ Legal & Constitutional Focus**

      1.Reclaiming Bharat's Civilizational Ethos: The Constitutional Amendment Imperative
      2.Secularism in Ancient India: Beyond the Western Paradigm
      3.Rights vs Duties: What Should Take Precedence in Nation-Building?

      Chose any one topic and express your ideas through ${competition.title}. Be creative, ethical, and inspiring!
      Objective: Combine ancient philosophy, civilizational wisdom, and constitutional/legal thinking with modern challenges to protect civilization, culture, and ethical leadership globally.
    `
  });

  // Competition-specific requirements
  if (competition.id === 1) { // AI Short Video
    baseSections.push({
      id: "video-requirements",
      title: "Video Requirements",
      content: `**✨ What We Expect**
Your video is your canvas! As long as it is original(can be inspired) aligns with the weekly theme/problem statement, you have full freedom to shape the storyline, script, visuals, and creativity in your own way. Use AI tools to bring your ideas alive—whether it's animation, editing, voiceovers, or effects.

There are no limits on style or format: it can be funny, emotional, futuristic, or even abstract. What matters is that your submission clearly highlights the theme, tells a story, and showcases the power of AI + creativity.
      
      **Technical Specifications:**
      • Duration: 1-3 minutes
      • Watermark allowed
      • Resolution: Minimum 720p, preferred 1080p
      • Aspect Ratio: 9:16 (vertical) or 16:9 (horizontal)
      • File Size: Maximum 100MB
      
      **Resources**:
      • Find additional resources and inspiration about the theme from the links provided
      • Visit the Jyot app for detailed content about the theme.`
    });
  } else if (competition.id === 2) { // Script Writing
    baseSections.push({
      id: "toon-requirements",
      title: "Toon Creation Guidelines",
      content: `Guidelines for creating your AI-powered toons:
      
      **Technical Specifications:**

      •Word Count: 500–1500 words
      •Language: English or Hindi or Gujarati
      •File Size: Max 10MB
      
      **Content Guidelines:**
      •Must align with the weekly theme provided
      •Can be written in any style – story, satire, poem, play, monologue, or drama
      •Creativity and originality are key (no plagiarized content)
      •Clarity of narrative and strong expression of ideas encouraged
      •Use of AI writing tools is optional, but disclosure is required if used

      **Note for Participants:**
      You are free to experiment with format, style, and tone. The storyline, characters, and flow are entirely your choice, as long as your script highlights the essence of the problem statement/theme. Let your imagination lead the way!`
    });
  } 
  /*else if (competition.id === 3) { // Political Toons
    baseSections.push({
      id: "satire-guidelines",
      title: "Political Satire Guidelines",
      content: `Important guidelines for political satire content:
      
      **Content Standards:**
      • Focus on issues, not personal attacks
      • Maintain respectful discourse
      • Factual basis for satirical content
      • Avoid hate speech or discrimination
      • Consider diverse political perspectives
      
      **Creative Approach:**
      • Use humor to highlight important issues
      • Clever visual metaphors and symbolism
      • AI-generated elements for enhanced creativity
      • Clear political commentary or message
      • Engaging and thought-provoking content`
    });
  }*/

  // AI Tools & Resources
  baseSections.push({
    id: "ai-tools",
    title: "Recommended AI Tools (you're free to use any)",
    content: `Explore these AI tools to enhance your submission:
    
    **Video Generation:**
    • Runway ML - Advanced video creation and editing
    • Pika Labs - AI-powered short video generation
    • Stable Video Diffusion - Open-source video tools
    • Luma AI Dream Machine - Text-to-video generation
    
    **Image/Art Generation:**
    • Midjourney - High-quality artistic images
    • DALL-E 3 - Creative image generation
    • Stable Diffusion - Open-source image creation
    • Adobe Firefly - Integrated creative tools`

  });

  // Submission Guidelines
  baseSections.push({
    id: "submission-guidelines",
    title: "Submission Guidelines",
    content: `Follow these guidelines for a successful submission:
    
    **Submission Process:**
    • Use the submission panel on this page
    • Provide your name and email address
    • Only Google drive links accepted
    • Ensure link permissions are set to "Anyone with the link can view"
    • Include a brief description of your approach
    • Submit before the deadline: ${competition.deadline}
    
    **Required Information:**
    • List all AI tools used in creation
    • Brief explanation of your creative process
    • Any inspiration or reference sources
    
    **Evaluation Criteria:**
    • Creativity and Innovation (30%)
    • Technical Quality and Execution (25%)
    • Effective Use of AI Tools (20%)
    • Adherence to Requirements (15%)
    • Overall Impact and Engagement (10%)`
  });

  return baseSections;
};

// Helper functions
export const getCompetitionById = (id) => {
  const competition = competitions.find(comp => comp.id === parseInt(id));
  if (!competition) return null;
  
  return {
    ...competition,
    sections: generateSectionsForCompetition(competition)
  };
};

export const getAllCompetitionIds = () => {
  return competitions.map(comp => ({ params: { id: comp.id.toString() } }));
};