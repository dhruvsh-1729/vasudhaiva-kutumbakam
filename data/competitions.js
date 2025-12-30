// data/competitions.js

// Timeline intervals configuration for automatic deadline progression
// All dates are in IST (Indian Standard Time - UTC+5:30)
export const timelineIntervals = [
  {
    id: 1,
    title: 'Competition Launch',
    startDate: '2025-10-27T00:00:00+05:30', // IST
    endDate: '2025-11-02T23:59:59+05:30',   // IST
    status: 'completed',
    isSubmissionInterval: false
  },
  {
    id: 2,
    title: 'Week 1 Challenge',
    startDate: '2025-11-02T00:00:00+05:30', // IST
    endDate: '2025-11-30T23:59:59+05:30',   // IST (11:59:59 PM IST on Nov 30)
    status: 'current',
    isSubmissionInterval: true,
    weekNumber: 1
  },
  {
    id: 3,
    title: 'Week 2 Challenge',
    startDate: '2025-12-01T00:00:00+05:30', // IST
    endDate: '2025-12-11T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: true,
    weekNumber: 2
  },
  {
    id: 4,
    title: 'Final Submission Window',
    startDate: '2025-12-12T00:00:00+05:30', // IST
    endDate: '2025-12-30T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: true,
    weekNumber: 3
  },
  {
    id: 5,
    title: 'Jury Review',
    startDate: '2025-12-31T00:00:00+05:30', // IST
    endDate: '2026-01-06T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: false
  },
  {
    id: 6,
    title: 'Final Results',
    startDate: '2026-01-07T00:00:00+05:30', // IST
    endDate: '2026-01-08T23:59:59+05:30',   // IST
    status: 'upcoming',
    isSubmissionInterval: false
  }
];

// Helper function to get current active interval based on current date in IST
// Since our interval dates include IST timezone offset (+05:30),
// we can directly compare with current time for accurate results
export const getCurrentInterval = () => {
  // Get current time (works correctly with timezone-aware date strings)
  const now = new Date();
  const firstInterval = timelineIntervals[0];
  const firstStart = new Date(firstInterval.startDate);

  if (now < firstStart) {
    return firstInterval;
  }
  
  // Find the interval that matches current date
  for (const interval of timelineIntervals) {
    const start = new Date(interval.startDate);
    const end = new Date(interval.endDate);
    
    if (now >= start && now <= end) {
      return interval;
    }
  }
  
  // If no current interval found (after all intervals), return the last one
  return timelineIntervals[timelineIntervals.length - 1];
};

// Helper function to get the next deadline in IST
export const getNextDeadline = () => {
  // Get current time (works correctly with timezone-aware date strings)
  const now = new Date();
  let nextInterval;
  let nextSubmission;
  
  for (const interval of timelineIntervals) {
    const end = new Date(interval.endDate);

    if (now <= end) {
      if (!nextInterval) {
        nextInterval = interval;
      }
      if (!nextSubmission && interval.isSubmissionInterval) {
        nextSubmission = interval;
      }
    }
  }
  
  const targetInterval = nextSubmission || nextInterval || timelineIntervals[timelineIntervals.length - 1];
  return {
    deadline: targetInterval.endDate,
    interval: targetInterval,
    weekNumber: targetInterval.weekNumber || null
  };
};

// Helper function to get current submission interval number (for database)
export const getCurrentSubmissionInterval = () => {
  const currentInterval = getCurrentInterval();
  if (currentInterval.weekNumber) {
    return currentInterval.weekNumber;
  }

  const now = new Date();
  const upcomingSubmission = timelineIntervals.find(interval => 
    interval.isSubmissionInterval && new Date(interval.startDate) > now && interval.weekNumber
  );

  if (upcomingSubmission?.weekNumber) {
    return upcomingSubmission.weekNumber;
  }

  const lastSubmissionInterval = [...timelineIntervals]
    .reverse()
    .find(interval => interval.isSubmissionInterval && interval.weekNumber);

  return lastSubmissionInterval?.weekNumber || 1;
};

// Helper function to check if submissions are open based on timeline
export const areSubmissionsOpen = () => {
  const now = new Date();
  const currentInterval = getCurrentInterval();

  if (!currentInterval.isSubmissionInterval) {
    const upcomingSubmission = timelineIntervals.find(interval => 
      interval.isSubmissionInterval && new Date(interval.startDate) > now
    );
    if (upcomingSubmission) {
      return true;
    }
  }

  return currentInterval.isSubmissionInterval === true;
};

// Basic competition data structure
export const competitions = [ 
  { id: 1, title: "AI Short Video", description: "Create a 1-3 minute AI-generated reel on weekly themes.", icon: "🎥", color: "from-blue-500 to-blue-600", deadline: "2025-12-12T23:59:59+05:30", slug:"videos" }, 
  { id: 2, title: "Creative Expression", description: "Creative script made using AI tools.", icon: "✍️", color: "from-green-500 to-green-600", deadline: "2025-12-12T23:59:59+05:30", slug:"writing" }, 
  { id: 3, title: "LexToons (AI Comics / Legal Satire)", description: "Create illustrated comics or satire strips using AI + text on the given topics.", icon: "🖍️", color: "from-purple-500 to-purple-600", deadline: "2025-12-12T23:59:59+05:30", slug:"lextoons" },
  { id: 5, title: "Blog Writing / AI-Assisted Essay", description: "Write engaging 500–800 word blog posts or essays on the weekly topics.", icon: "📝", color: "from-orange-500 to-red-600", deadline: "2025-12-12T23:59:59+05:30", slug:"blogs" },
  { id: 4, title: "VK Painting Competition", description: "Create a painting inspired by Vasudhaiva Kutumbakam philosophy.", icon: "🖌️", color: "from-yellow-500 to-yellow-600", deadline: "2025-12-30T23:59:59+05:30", slug: "painting" },
  { id: 7, title: "VK Harmonies (Original Composition)", description: "Compose and perform original songs inspired by Vasudhaiva Kutumbakam values.", icon: "🎵", color: "from-red-500 to-red-600", deadline: "2025-12-30T23:59:59+05:30", slug: "singing" },
  { id: 8, title: "VK Verses (Poetry)", description: "Write original poetry expressing Vasudhaiva Kutumbakam values and global unity.", icon: "✨", color: "from-indigo-500 to-indigo-600", deadline: "2025-12-30T23:59:59+05:30", slug: "poetry" },
  // { id: 3, title: "Political Toons", description: "Create a political satire cartoon using AI tools.", icon: "🖼️", color: "from-purple-500 to-purple-600", deadline: "November 20, 2025" },
];

// Generate detailed sections dynamically based on competition type
const generateSectionsForCompetition = (competition) => {
  const baseSections = [];
  const formattedDeadline = competition.deadline
    ? new Date(competition.deadline).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Kolkata',
        timeZoneName: 'short'
      })
    : 'TBD';
  
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

**The 5 Guarantees (Choose Any One):**
  • Guarantee of Security — Providing security to all members is the basic ethic of a family, which makes the person stay in the family and sustains the family system. Similarly, at the global level, to give an environment of security to all nations is the core principle of Vasudhaiva Kutumbakam.
  
  • Guarantee of Basic Necessities — As in a Indian Joint family, regardless of their capabilities and contributions, each member is guaranteed the equal fulfilment of their basic necessities and equal standard of living. Similarly, in case of family of countries to provide equal basic necessities to all countries without differentiation is also one of the central tenet of Vasudhaiva Kutumbakam.
  
  • Guarantee of Health and Education of Choice — The Indian joint family provide equal access to health and education. In times of health crises, family is needed most. Similarly, on the global stage, nations should ensure the freedom to choose their health and education systems, cultivating unity and shared responsibility, thereby embodying the core value of Vasudhaiva Kutumbakam.
  
  • Guarantee of Family Bond and Feelings — In the Indian Joint Family System, family bonding and emotional support provide the solidarity needed during times of weakness, regardless of one's power. Similarly, at the international level, this guarantee is essential to strengthen the global community, fostering trust, solidarity, and unity—representing the foundational principle of Vasudhaiva Kutumbakam.
  
  • Guarantee of Equal Access to Common Resources — This ethic is a core value of the Indian joint family, ensuring equal opportunities for all members to live, grow, and develop. It helps maintain family bonds and structure. Similarly, on the international stage, guaranteeing equal access to resources for all countries embodies the essence of Vasudhaiva Kutumbakam.
  
**Objective:**
Express through visual art how traditional values and guarantees can provide innovative solutions to modern global problems. Your painting should inspire viewers to think about collective responsibility, universal values, and the interconnectedness of all humanity.

**More Details:**
Click on the banner in the dashboard page to know more about Vasudhaiva Kutumbakam and the Five Guarantees theme.`
      : competition.id === 7
        ? `Welcome to ${competition.title}! Compose and perform original songs inspired by Vasudhaiva Kutumbakam philosophy.

**📢 Week 1 Challenge – VK Competition**

Global governance, diplomacy, culture, and law face huge challenges today. Powerful nations often influence global decisions, while the wisdom of ancient civilizations offers timeless solutions. Your task: Use music and creativity to explore solutions for modern global and legal issues through original compositions aligned with VK themes.

**🌏 Geopolitics & Global Governance**

1. Reforming the UN for fair global participation
2. Uniting the Global South to raise its collective voice
3. Lessons from ancient diplomacy for modern international relations
4. Promoting global peace through Vasudhaiva Kutumbakam philosophy
5. Decolonizing the consciousness of the Global South

**⚖️ Legal & Constitutional Focus**

1. Reclaiming Bharat's Civilizational Ethos: The Constitutional Amendment Imperative
2. Secularism in Ancient India: Beyond the Western Paradigm
3. Rights vs Duties: What Should Take Precedence in Nation-Building?

Choose any one topic and express your ideas through ${competition.title}. Be creative, ethical, and inspiring!

**Objective:** Create original musical compositions that combine the importance of ancient wisdom aligned to VK themes with contemporary concerns to inspire global unity and shared responsibility. For resources, visit **vk.jyot.in**`
        : competition.id === 8
          ? `Welcome to ${competition.title}! Write original poetry inspired by Vasudhaiva Kutumbakam values and global unity.

**📢 Week 1 Challenge – VK Competition**

Global governance, diplomacy, culture, and law face huge challenges today. Powerful nations often influence global decisions, while the wisdom of ancient civilizations offers timeless solutions. Your task: Use the power of words and verse to explore solutions for modern global and legal issues through poetry grounded in VK philosophy.

**🌏 Geopolitics & Global Governance**

1. Reforming the UN for fair global participation
2. Uniting the Global South to raise its collective voice
3. Lessons from ancient diplomacy for modern international relations
4. Promoting global peace through Vasudhaiva Kutumbakam philosophy
5. Decolonizing the consciousness of the Global South

**⚖️ Legal & Constitutional Focus**

1. Reclaiming Bharat's Civilizational Ethos: The Constitutional Amendment Imperative
2. Secularism in Ancient India: Beyond the Western Paradigm
3. Rights vs Duties: What Should Take Precedence in Nation-Building?

Choose any one topic and express your ideas through ${competition.title}. Be creative, ethical, and inspiring!

**Objective:** Create original poetry that weaves together ancient philosophy, civilizational wisdom, and contemporary concerns to illuminate paths toward global harmony and ethical leadership. For guidelines, visit **vk.jyot.in**`
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
      •Language: English or Hindi 
      •File Size: Max 10MB
      
      **Content Guidelines:**
      •Must align with the weekly theme provided
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
  } else if (competition.id === 3) { // LexToons (AI Comics / Legal Satire)
    baseSections.push({
      id: "lextoons-guidelines",
      title: "LexToons / Illustrated Comics",
      content: `Creative comic strips or cartoons made with text.

**✓ Do:**
• Create comics illustrating the topics given
• Format: JPEG, PNG, or PDF | Keep visuals clear and readable
• Ensure storytelling is simple, creative, and theme-aligned

**✗ Don't:**
• Avoid offensive, violent, or unrelated visuals`
    });

    baseSections.push({
      id: "lextoons-prizes",
      title: "Prizes",
      content: `Total Prize Pool: ₹39,600
• 1st: ₹18,000
• 2nd: ₹12,000
• 3rd: ₹9,600`
    });
  } else if (competition.id === 5) { // Blog Writing / AI-Assisted Essay
    baseSections.push({
      id: "blog-guidelines",
      title: "Blog Writing / AI-Assisted Essay",
      content: `Writing engaging blog posts on the given topics.

**✓ Do:**
• Focus on the given topics and align your content to them
• Word Count: 500–800 words | Format: PDF or DOCX
• Ensure content is original, structured, and readable

**✗ Don't:**
• Avoid plagiarism, irrelevant topics, or offensive language`
    });

    baseSections.push({
      id: "blog-prizes",
      title: "Prizes",
      content: `Total Prize Pool: ₹26,400
• 1st: ₹12,000
• 2nd: ₹8,000
• 3rd: ₹6,400`
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
      • 1st Prize: ₹1,00,000
      • 2nd Prize: ₹51,000
      • 3rd Prize: ₹25,000
      
      **Additional Recognition:**
      • Showcase at VK 4.0 Conclave, Mumbai
      • Felicitation ceremony during the event
      • Results announced: 16–22 January 2026
      
      **Important Dates:**
      • Competition Launch: 2 October 2025
      • Round 1 Deadline: 30 November 2025 (11:59:59 PM IST)
      • Final Submission Window: 12–30 December 2025 (11:59:59 PM IST)
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
      • Innovative approach 
      • Original artistic expression
      
      **Relevance to Theme (35%):**
      • Clear connection to Vasudhaiva Kutumbakam philosophy
      • Effective representation of chosen guarantee
      • Meaningful solution to a global issue
      
      **Clarity of Message (20%):**
      • Clear communication of concept
      • Effective visual storytelling
      • Impact and emotional resonance
      
      **Technical Skill & Finish (15%):**
      • Quality of execution
      • Mastery of chosen medium
      • Overall craftsmanship and presentation`
    });
  } else if (competition.id === 1) {
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
      • Grok Imagine- AI image generation tool
      • Imagegen - Google creative image generation
      • Midjourney - High-quality artistic images
      • DALL-E 3 - Creative image generation
      • Stable Diffusion - Open-source image creation
      • Adobe Firefly - Integrated creative tools`
    });
  } else if (competition.id === 2) {
    baseSections.push({
      id: "ai-tools",
      title: "Recommended AI Tools (you're free to use any)",
      content: `Explore these AI tools to enhance your submission:
      
      **AI Writing Assistants:**
      • ChatGPT - Advanced language model for creative writing
      • Gemini - Google's AI for content generation and brainstorming`
    });
  } else if (competition.id === 7) { // VK Harmonies (Singing)
    baseSections.push({
      id: "song-guidelines",
      title: "Song Composition Guidelines",
      content: `Compose an entirely original song based on the importance of ancient wisdom aligned to VK themes.

**Technical Specifications:**
• Duration: 2-4 minutes
• Format: MP3, WAV, or M4A audio file
• Language: English, Hindi, or any Indian language
• Audio Quality: Record in a quiet environment with clear sound
• Instrumentation: Simple instrumentation or acapella—clarity is more important than effects`
    });
    baseSections.push({
      id: "dos-donts",
      title: "Do's & Don'ts",
      content: `**✓ Do:**
• Compose an entirely original song based on importance of ancient wisdom aligned to VK themes
• Ensure the lyrics are clear, clean, and meaningful
• Maintain good audio quality—record in a quiet environment
• Keep the duration within the specified time limit (2-4 minutes)
• Mention the composer and lyricist clearly (the participant can be both)
• Use simple instrumentation or acapella if needed—clarity is more important than effects

**✗ Don't:**
• Do not use copyrighted tunes, background tracks, or melodies
• Do not submit songs with abusive, political, communal, or controversial content
• Do not over-edit or auto-tune excessively
• Do not perform cover songs or adapt existing movie/music tunes`
    });
    baseSections.push({
      id: "recommended-tools",
      title: "Recommended Tools",
      content: `Explore these tools to enhance your composition:

**Music Production:**
• GarageBand - Simple music creation and recording
• Audacity - Free audio recording and editing
• FL Studio - Professional music production
• Ableton Live - Advanced music composition

**Lyric Writing & AI Assistance:**
• ChatGPT - Lyric ideation and refinement
• Gemini - Creative brainstorming`
    });
    baseSections.push({
      id: "prizes",
      title: "Prizes",
      content: `Total Prize Pool: **₹50,000**
• 1st: **₹25,000**
• 2nd: **₹15,000**
• 3rd: **₹10,000**`
    });
  } else if (competition.id === 8) { // VK Verses (Poetry)
    baseSections.push({
      id: "poetry-guidelines",
      title: "Poetry Writing Guidelines",
      content: `Write an original poem inspired by VK values.

**Technical Specifications:**
• Word Count: 300-1000 words (for complete poem or collection)
• Format: PDF or DOCX
• Language: English, Hindi, Sanskrit, or any Indian language
• Poetry Forms: Free verse, rhyme, haiku, sonnet, couplets, or any traditional/modern form
• Submission Format: Typed or clearly handwritten
• Clarity: Ensure clarity in presentation and readability`
    });
    baseSections.push({
      id: "dos-donts",
      title: "Do's & Don'ts",
      content: `**✓ Do:**
• Write an original poem inspired by VK values
• Ensure the poem is meaningful, coherent, and emotionally resonant
• Use any style—free verse, rhyme, haiku, etc.
• Keep language polite, respectful, and appropriate for all ages
• Maintain clarity in typed submission
• Stay within the word limit (300-1000 words)

**✗ Don't:**
• Do not copy poems from books
• Do not use offensive, political, abusive, or discriminatory language
• Do not include religious bias, personal attacks, or sensitive references
• Do not exceed the allowed length or submit unreadable presentation`
    });
    baseSections.push({
      id: "prizes",
      title: "Prizes",
      content: `Total Prize Pool: **₹35,200**
• 1st: **₹16,000**
• 2nd: **₹11,000**
• 3rd: **₹8,200**`
    });
  }

  // Submission Guidelines
  const submissionGuidelinesContent = competition.id === 4
    ? `Follow these guidelines for a successful submission:
    
    **Online Submission:**
    • Upload 1 full artwork photo + 2 detail photos
    • Format: JPEG or TIFF
    • Resolution: 300 DPI minimum
    • File Size: Maximum 15MB per image
    • File Naming: Lastname_Firstname_Title_Size_Medium_Year.jpg
    • Use the submission panel on this page
    • Double-check your uploaded images open correctly after upload
    
    **Physical Submission:**
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
    • Submit before: ${formattedDeadline}`
    : competition.id === 1
      ? `Follow these guidelines for a successful submission:
    
    **Submission Process:**
    • Use the submission panel on this page
    • Provide your name and email address
    • Share your Google Drive video link
    • Ensure link permissions are set to "Anyone with the link can view"
    • Include a brief description of your approach
    • Submit before the deadline: ${formattedDeadline}
    
    **Required Information:**
    • List all AI tools used in creation
    • Brief explanation of your creative process
    • Any inspiration or reference sources
    
    **Evaluation Criteria:**
    • Creativity and Originality (30%)
    • Relevance to the theme(35%)
    • Clarity of Message (20%)
    • Aritistic / Technical Quality(15%)`
      : competition.id === 7
        ? `Follow these guidelines for a successful submission:
    
    **Submission Process:**
    • Use the submission panel on this page
    • Provide your name and email address
    • Upload your audio file directly (MP3, WAV, or M4A)
    • Include a brief description of your song concept
    • Submit before the deadline: ${formattedDeadline}
    
    **Required Information:**
    • Song title and duration
    • Lyrics (in text format, attached as .txt or .pdf)
    • Which topic you've chosen
    • Composer and lyricist name(s)
    • Brief explanation of your creative process
    • Inspiration or reference sources
    • List of music production tools used
    
    **Evaluation Criteria:**
    • Creativity and Originality (30%)
    • Relevance to the theme (35%)
    • Lyrical Quality and Message (20%)
    • Audio Quality and Production (15%)`
        : competition.id === 8
          ? `Follow these guidelines for a successful submission:
    
    **Submission Process:**
    • Use the submission panel on this page
    • Provide your name and email address
    • Upload your poetry file directly (PDF or DOCX format)
    • Include a brief introduction to your work
    • Submit before the deadline: ${formattedDeadline}
    
    **Required Information:**
    • Title(s) of your poem(s)
    • Which topic you've chosen
    • Poetry form(s) used
    • Language(s) of composition
    • Word count
    • Brief explanation of your creative process and inspiration
    • List of any AI tools used (if applicable)
    • Literary influences or reference sources (if any)
    
    **Evaluation Criteria:**
    • Creativity and Originality (30%)
    • Relevance to the theme (35%)
    • Poetic Quality and Language (20%)
    • Emotional Impact and Depth (15%)`
          : `Follow these guidelines for a successful submission:
    
    **Submission Process:**
    • Use the submission panel on this page to upload your file directly (no Drive link needed)
    • Provide your name and email address
    • Include a brief description of your approach
    • Submit before the deadline: ${formattedDeadline}
    
    **Required Information:**
    • List all AI tools used in creation
    • Brief explanation of your creative process
    • Any inspiration or reference sources
    
    **Evaluation Criteria:**
    • Creativity and Originality (30%)
    • Relevance to the theme(35%)
    • Clarity of Message (20%)
    • Aritistic / Technical Quality(15%)`;

  baseSections.push({
    id: "submission-guidelines",
    title: "Submission Guidelines",
    content: submissionGuidelinesContent
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

export const getCompetitionBySlug = (slug) => {
  const competition = competitions.find(comp => comp.slug === slug);
  if (!competition) return null;
  
  return {
    ...competition,
    sections: generateSectionsForCompetition(competition)
  };
};

export const getAllCompetitionIds = () => {
  return competitions.map(comp => ({ params: { id: comp.id.toString() } }));
};

export const getAllCompetitionSlugs = () => {
  return competitions.map(comp => ({ params: { id: comp.slug } }));
};
