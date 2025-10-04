// data/competitions.js

import { title } from "process";

// Basic competition data structure
export const competitions = [ 
  { id: 1, title: "AI Short Video", description: "Create a 1-3 minute AI-generated reel on weekly themes.", icon: "🎥", color: "from-blue-500 to-blue-600", deadline: "November 20, 2025" }, 
  { id: 2, title: "Creative Expression", description: "Creative script made using AI tools.", icon: "✍️", color: "from-green-500 to-green-600", deadline: "November 20, 2025" }, 
  // { id: 3, title: "Political Toons", description: "Create a political satire cartoon using AI tools.", icon: "🖼️", color: "from-purple-500 to-purple-600", deadline: "November 20, 2025" },
  {id: 4 ,title:"VK Painting Competition", description:"Create a painting inspired by Vasudhaiva Kutumbakam philosophy.", icon:"🖌️", color:"from-yellow-500 to-yellow-600", deadline:"November 30, 2025"}
];

// Generate detailed sections dynamically based on competition type
const generateSectionsForCompetition = (competition) => {
  const baseSections = [];
  
  // Problem Statement
  baseSections.push({
    id: "problem-statement",
    title: "Problem Statement",
    content: competition.id === 4 
      ? `Welcome to the ${competition.title}!

**Theme: Vasudhaiva Kutumbakam Ki Oar — The World is One Family**

Create a painting that solves a modern global issue through one of the Five Guarantees. Your artwork should embody the ancient Indian philosophy of "Vasudhaiva Kutumbakam" (the world is one family) while addressing contemporary challenges.

**Your Challenge:**
Choose one of the Five Guarantees and create an original painting that demonstrates how this guarantee can solve a pressing global issue. Your artwork should bridge ancient wisdom with modern solutions, showing how the philosophy of global unity can address today's challenges.

**Objective:**
Express through visual art how traditional values and guarantees can provide innovative solutions to modern global problems. Your painting should inspire viewers to think about collective responsibility, universal values, and the interconnectedness of all humanity.

**More Details:**
Visit the Jyot app for detailed content about Vasudhaiva Kutumbakam and the Five Guarantees theme.`
      : `Welcome to the ${competition.title} competition! ${competition.description}
          
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
      title: "Creative Writing Guidelines",
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

    baseSections.push({
      id: "creative-expression",
      title: "Creative Expression (Short Script Writing for Videos or Street Play)",
      content: `**✓ Do:**
      • Create original scripts aligned with the suggested topics, reflecting ancient wisdom, unity, and global citizenship
      • File Format: .docx or .pdf
      • Word Limit / Duration:
        - Short Scripts for Video: 1,000–2,000 words (approx. 5–7 min)
        - Street Plays: 800–1,500 words or 5–10 minute performance
      • Ensure content is inclusive, positive, and culturally respectful
      
      **✗ Don't:**
      • Submit plagiarized or offensive content
      • Include political or religious propaganda
      • Use copyrighted material without permission`
    });
  } else if (competition.id === 4) { // VK Painting Competition
    baseSections.push({
      id: "painting-requirements",
      title: "Artwork Specifications",
      content: `**Canvas & Medium:**
      • Size: A3 (30×42 cm) to A2 (42×60 cm) only
      • Surface: Thick Art Paper / Canvas Paper / Watercolor Paper / Stretched Canvas
      • Medium: Charcoal or any color paints; mixed media allowed
      • Orientation: Portrait or Landscape
      • Originality: No AI/tracing/copyrighted images
      
      **The 5 Guarantees (Choose Any One):**
      • Guarantee of Security — Providing security to all members is the basic ethic of a family, which makes the person stay in the family and sustains the family system. Similarly, at the global level, to give an environment of security to all nations is the core principle of Vasudhaiva Kutumbakam.
      
      • Guarantee of Basic Necessities — As in a Indian Joint family, regardless of their capabilities and contributions, each member is guaranteed the equal fulfilment of their basic necessities and equal standard of living. Similarly, in case of family of countries to provide equal basic necessities to all countries without differentiation is also one of the central tenet of Vasudhaiva Kutumbakam.
      
      • Guarantee of Health and Education of Choice — The Indian joint family provide equal access to health and education. In times of health crises, family is needed most. Similarly, on the global stage, nations should ensure the freedom to choose their health and education systems, cultivating unity and shared responsibility, thereby embodying the core value of Vasudhaiva Kutumbakam.
      
      • Guarantee of Family Bond and Feelings — In the Indian Joint Family System, family bonding and emotional support provide the solidarity needed during times of weakness, regardless of one's power. Similarly, at the international level, this guarantee is essential to strengthen the global community, fostering trust, solidarity, and unity—representing the foundational principle of Vasudhaiva Kutumbakam.
      
      • Guarantee of Equal Access to Common Resources — This ethic is a core value of the Indian joint family, ensuring equal opportunities for all members to live, grow, and develop. It helps maintain family bonds and structure. Similarly, on the international stage, guaranteeing equal access to resources for all countries embodies the essence of Vasudhaiva Kutumbakam.
      
      **Artist Statement:**
      • Attach a 100–150 word statement explaining your concept
      • Explain how your chosen guarantee solves a global issue
      • Sign and date your artwork discreetly`
    });
    
    baseSections.push({
      id: "painting-guidelines",
      title: "Do's and Don'ts",
      content: `**✓ Do:**
      • Align your artwork to the theme
      • Show clearly how your chosen guarantee solves a global issue
      • Keep your message clear and impactful
      • Sign and date your work discreetly
      • Attach your artist statement (100–150 words)
      
      **✗ Don't:**
      • No plagiarism or copying existing artworks
      • No offensive or political content
      • Avoid using direct globe icon; use creative, alternative symbols
      • No AI-generated or traced images
      • No copyrighted imagery`
    });
    
    baseSections.push({
      id: "prizes",
      title: "Prizes & Recognition",
      content: `**Prize Money:**
      • 1st Prize: 1,00,000
      • 2nd Prize: ₹51,000
      • 3rd Prize: ₹25,000
      
      **Additional Recognition:**
      • Showcase at VK 4.0 Conclave, Mumbai
      • Felicitation ceremony during the event
      • Results announced: 16–22 January 2026
      
      **Important Dates:**
      • Competition Launch: 2 October 2025
      • Submission Deadline: 30 November 2025 (11:59 PM IST)
      • Results Announcement: VK 4.0 Conclave (16–22 January 2026)`
    });
  }

  // AI Tools & Resources or Judging Criteria
  if (competition.id === 4) {
    baseSections.push({
      id: "judging-criteria",
      title: "Judging Criteria",
      content: `Your artwork will be evaluated based on the following criteria:
      
      **Creativity & Originality (30%):**
      • Unique interpretation of the theme
      • Innovative approach to solving global issues
      • Original artistic expression
      
      **Relevance to Theme (25%):**
      • Clear connection to Vasudhaiva Kutumbakam philosophy
      • Effective representation of chosen guarantee
      • Meaningful solution to a global issue
      
      **Clarity of Message (20%):**
      • Clear communication of concept
      • Effective visual storytelling
      • Impact and emotional resonance
      
      **Technical Skill & Finish (25%):**
      • Quality of execution
      • Mastery of chosen medium
      • Overall craftsmanship and presentation`
    });
  } else {
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
  }

  // Submission Guidelines
  baseSections.push({
    id: "submission-guidelines",
    title: "Submission Guidelines",
    content: competition.id === 4
      ? `Follow these guidelines for a successful submission:
    
    **Online Submission:**
    • Upload 1 full artwork photo + 2 detail photos
    • Format: JPEG or TIFF
    • Resolution: 300 DPI minimum
    • File Size: Maximum 15MB per image
    • File Naming: Lastname_Firstname_Title_Size_Medium_Year.jpg
    • Use the submission panel on this page
    • Ensure Google Drive link permissions are set to "Anyone with the link can view"
    
    **Physical Submission (Optional):**
    • Label the back of your artwork with name, title, and contact details
    • Pack securely to prevent damage during transit
    • Courier to the official address (will be provided upon request)
    
    **Required Information:**
    • Your full name and contact email
    • Artwork title and dimensions
    • Medium used
    • Artist statement (100–150 words)
    • Which of the Five Guarantees you've chosen
    • Brief explanation of how your artwork addresses a global issue
    
    **Important Deadline:**
    • Submit before: ${competition.deadline} (11:59 PM IST)`
      : `Follow these guidelines for a successful submission:
    
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